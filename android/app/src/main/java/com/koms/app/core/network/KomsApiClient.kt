package com.koms.app.core.network

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.koms.app.core.model.*
import com.koms.app.core.security.SessionManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.logging.HttpLoggingInterceptor
import java.util.concurrent.TimeUnit

class KomsApiClient(private val context: Context) {
    private val sessionManager = SessionManager(context)
    private val gson = Gson()
    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    private val client: OkHttpClient by lazy {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        OkHttpClient.Builder()
            .addInterceptor(logging)
            .addInterceptor { chain ->
                val requestBuilder = chain.request().newBuilder()
                sessionManager.getToken()?.let { token ->
                    requestBuilder.addHeader("Authorization", "Bearer $token")
                }
                chain.proceed(requestBuilder.build())
            }
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .writeTimeout(15, TimeUnit.SECONDS)
            .build()
    }

    private fun baseUrl(): String = sessionManager.getServerUrl()

    suspend fun checkAppVersion(): AppVersionInfo = withContext(Dispatchers.IO) {
        try {
            val req = Request.Builder().url("${baseUrl()}/api/app-version").get().build()
            client.newCall(req).execute().use { resp ->
                if (resp.isSuccessful) {
                    val body = resp.body?.string() ?: ""
                    return@withContext gson.fromJson(body, AppVersionInfo::class.java)
                }
            }
        } catch (_: Exception) {}
        AppVersionInfo(latestVersion = "1.0.0", versionCode = 1, updateAvailable = false)
    }

    suspend fun login(email: String, password: String, portalPreference: String): Result<User> = withContext(Dispatchers.IO) {
        try {
            val payload = mapOf(
                "email" to email,
                "password" to password,
                "portalPreference" to portalPreference
            )
            val reqBody = gson.toJson(payload).toRequestBody(jsonMediaType)
            val req = Request.Builder().url("${baseUrl()}/api/auth/login").post(reqBody).build()
            client.newCall(req).execute().use { resp ->
                val body = resp.body?.string() ?: ""
                if (resp.isSuccessful) {
                    val mapType = object : TypeToken<Map<String, Any>>() {}.type
                    val map: Map<String, Any> = gson.fromJson(body, mapType)
                    val token = map["token"] as? String ?: ""
                    val userMap = map["user"] as? Map<*, *> ?: emptyMap<Any, Any>()

                    val user = User(
                        id = userMap["id"]?.toString() ?: "",
                        name = userMap["name"]?.toString() ?: "",
                        email = userMap["email"]?.toString() ?: "",
                        role = userMap["role"]?.toString() ?: "",
                        status = userMap["status"]?.toString() ?: "active",
                        memberId = userMap["member_id"]?.toString() ?: "",
                        dojoId = userMap["dojo_id"]?.toString(),
                        token = token
                    )
                    sessionManager.saveSession(token, user)
                    Result.success(user)
                } else {
                    val errMap = try { gson.fromJson(body, Map::class.java) } catch (_: Exception) { null }
                    val errMsg = errMap?.get("error")?.toString() ?: "Login failed (code ${resp.code})"
                    Result.failure(Exception(errMsg))
                }
            }
        } catch (e: Exception) {
            Result.failure(Exception("Cannot connect to server (${e.message}). Check internet connection."))
        }
    }

    suspend fun registerStudent(data: Map<String, Any>): Result<String> = withContext(Dispatchers.IO) {
        try {
            val reqBody = gson.toJson(data).toRequestBody(jsonMediaType)
            val req = Request.Builder().url("${baseUrl()}/api/auth/register-student").post(reqBody).build()
            client.newCall(req).execute().use { resp ->
                val body = resp.body?.string() ?: ""
                if (resp.isSuccessful) {
                    val map = gson.fromJson(body, Map::class.java)
                    Result.success(map["message"]?.toString() ?: "Student application submitted successfully!")
                } else {
                    val errMap = try { gson.fromJson(body, Map::class.java) } catch (_: Exception) { null }
                    Result.failure(Exception(errMap?.get("error")?.toString() ?: "Registration failed"))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun registerMaster(data: Map<String, Any>): Result<String> = withContext(Dispatchers.IO) {
        try {
            val reqBody = gson.toJson(data).toRequestBody(jsonMediaType)
            val req = Request.Builder().url("${baseUrl()}/api/auth/register-master").post(reqBody).build()
            client.newCall(req).execute().use { resp ->
                val body = resp.body?.string() ?: ""
                if (resp.isSuccessful) {
                    val map = gson.fromJson(body, Map::class.java)
                    Result.success(map["message"]?.toString() ?: "Master application submitted for review!")
                } else {
                    val errMap = try { gson.fromJson(body, Map::class.java) } catch (_: Exception) { null }
                    Result.failure(Exception(errMap?.get("error")?.toString() ?: "Application failed"))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getPublicDojos(): Result<List<Dojo>> = withContext(Dispatchers.IO) {
        try {
            val req = Request.Builder().url("${baseUrl()}/api/dojos/public").get().build()
            client.newCall(req).execute().use { resp ->
                if (resp.isSuccessful) {
                    val body = resp.body?.string() ?: ""
                    val listType = object : TypeToken<List<Map<String, Any>>>() {}.type
                    val list: List<Map<String, Any>> = gson.fromJson(body, listType)
                    val dojos = list.map { m ->
                        Dojo(
                            id = m["id"]?.toString() ?: "",
                            name = m["name"]?.toString() ?: "",
                            badge = m["badge"]?.toString() ?: "Verified Center",
                            masterName = m["masterName"]?.toString() ?: m["head_instructor"]?.toString() ?: "",
                            masterRank = m["masterRank"]?.toString() ?: m["instructor_rank"]?.toString() ?: "Master",
                            address = m["address"]?.toString() ?: "",
                            city = m["city"]?.toString() ?: "Chennai",
                            schedule = m["schedule"]?.toString() ?: m["training_days"]?.toString() ?: "",
                            style = m["style"]?.toString() ?: "Okinawa Shorin Ryu",
                            monthlyFee = (m["monthlyFee"] as? Number)?.toInt() ?: 1200,
                            bannerUrl = m["bannerUrl"]?.toString() ?: ""
                        )
                    }
                    Result.success(dojos)
                } else {
                    Result.failure(Exception("Failed to fetch dojos"))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getMasterDashboard(): Result<Map<String, Any>> = withContext(Dispatchers.IO) {
        try {
            val req = Request.Builder().url("${baseUrl()}/api/master/dashboard").get().build()
            client.newCall(req).execute().use { resp ->
                if (resp.isSuccessful) {
                    val body = resp.body?.string() ?: ""
                    val mapType = object : TypeToken<Map<String, Any>>() {}.type
                    val map: Map<String, Any> = gson.fromJson(body, mapType)
                    Result.success(map)
                } else {
                    Result.failure(Exception("Failed to load dashboard"))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getMasterStudents(): Result<List<Student>> = withContext(Dispatchers.IO) {
        try {
            val req = Request.Builder().url("${baseUrl()}/api/master/students").get().build()
            client.newCall(req).execute().use { resp ->
                if (resp.isSuccessful) {
                    val body = resp.body?.string() ?: ""
                    val listType = object : TypeToken<List<Map<String, Any>>>() {}.type
                    val list: List<Map<String, Any>> = gson.fromJson(body, listType)
                    val students = list.map { m ->
                        Student(
                            id = m["id"]?.toString() ?: "",
                            name = m["name"]?.toString() ?: "",
                            memberId = m["member_id"]?.toString() ?: "",
                            email = m["email"]?.toString() ?: "",
                            phone = m["phone"]?.toString() ?: "",
                            dojoId = m["dojo_id"]?.toString() ?: "",
                            belt = m["belt"]?.toString() ?: "White Belt",
                            status = m["status"]?.toString() ?: "active",
                            attendancePct = (m["attendance_pct"] as? Number)?.toInt() ?: 100
                        )
                    }
                    Result.success(students)
                } else {
                    Result.failure(Exception("Failed to load students"))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun saveAttendance(date: String, records: List<Map<String, Any>>): Result<String> = withContext(Dispatchers.IO) {
        try {
            val payload = mapOf(
                "date" to date,
                "records" to records
            )
            val reqBody = gson.toJson(payload).toRequestBody(jsonMediaType)
            val req = Request.Builder().url("${baseUrl()}/api/master/attendance").post(reqBody).build()
            client.newCall(req).execute().use { resp ->
                if (resp.isSuccessful) {
                    Result.success("Attendance saved successfully!")
                } else {
                    Result.failure(Exception("Failed to save attendance"))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getJoinRequests(): Result<List<JoinRequest>> = withContext(Dispatchers.IO) {
        try {
            val req = Request.Builder().url("${baseUrl()}/api/master/join-requests").get().build()
            client.newCall(req).execute().use { resp ->
                if (resp.isSuccessful) {
                    val body = resp.body?.string() ?: ""
                    val listType = object : TypeToken<List<Map<String, Any>>>() {}.type
                    val list: List<Map<String, Any>> = gson.fromJson(body, listType)
                    val requests = list.map { m ->
                        JoinRequest(
                            id = m["id"]?.toString() ?: "",
                            studentName = m["student_name"]?.toString() ?: "",
                            email = m["email"]?.toString() ?: "",
                            phone = m["phone"]?.toString() ?: "",
                            dojoId = m["dojo_id"]?.toString() ?: "",
                            dojoName = m["dojo_name"]?.toString() ?: "",
                            status = m["status"]?.toString() ?: "pending_review",
                            requestedAt = m["created_at"]?.toString() ?: ""
                        )
                    }
                    Result.success(requests)
                } else {
                    Result.failure(Exception("Failed to fetch join requests"))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun approveJoinRequest(id: String): Result<String> = withContext(Dispatchers.IO) {
        try {
            val reqBody = "".toRequestBody(jsonMediaType)
            val req = Request.Builder().url("${baseUrl()}/api/master/join-requests/$id/approve").post(reqBody).build()
            client.newCall(req).execute().use { resp ->
                if (resp.isSuccessful) Result.success("Student approved!") else Result.failure(Exception("Failed to approve"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun rejectJoinRequest(id: String): Result<String> = withContext(Dispatchers.IO) {
        try {
            val reqBody = "".toRequestBody(jsonMediaType)
            val req = Request.Builder().url("${baseUrl()}/api/master/join-requests/$id/reject").post(reqBody).build()
            client.newCall(req).execute().use { resp ->
                if (resp.isSuccessful) Result.success("Application rejected") else Result.failure(Exception("Failed to reject"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
