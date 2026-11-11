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
        val payload = mapOf(
            "email" to email,
            "password" to password,
            "portalPreference" to portalPreference
        )
        val reqBody = gson.toJson(payload).toRequestBody(jsonMediaType)
        
        var respBody: String? = null
        var isSuccess = false
        var statusCode = 0

        // 1. Try configured Base URL
        try {
            val req = Request.Builder().url("${baseUrl()}/api/auth/login").post(reqBody).build()
            client.newCall(req).execute().use { resp ->
                statusCode = resp.code
                isSuccess = resp.isSuccessful
                respBody = resp.body?.string()
            }
        } catch (_: Exception) {
            // 2. Try localhost fallback if USB reverse is active
            try {
                val reqLocal = Request.Builder().url("http://localhost:5000/api/auth/login").post(reqBody).build()
                client.newCall(reqLocal).execute().use { resp ->
                    statusCode = resp.code
                    isSuccess = resp.isSuccessful
                    respBody = resp.body?.string()
                    if (isSuccess) {
                        sessionManager.setServerUrl("http://localhost:5000")
                    }
                }
            } catch (_: Exception) {}
        }

        if (respBody != null) {
            val body = respBody!!
            if (isSuccess) {
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
                val errMsg = errMap?.get("error")?.toString() ?: "Login failed (code $statusCode)"
                Result.failure(Exception(errMsg))
            }
        } else {
            Result.failure(Exception("Cannot connect to server. Please check internet connection."))
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
            val primaryUrl = "${baseUrl()}/api/dojos/public"
            val fallbackUrl = "http://localhost:5000/api/dojos/public"
            
            var body: String? = null
            try {
                val req = Request.Builder().url(primaryUrl).get().build()
                client.newCall(req).execute().use { resp ->
                    if (resp.isSuccessful) {
                        body = resp.body?.string()
                    }
                }
            } catch (_: Exception) {
                // Try localhost fallback if connected via adb reverse
                try {
                    val reqFallback = Request.Builder().url(fallbackUrl).get().build()
                    client.newCall(reqFallback).execute().use { resp ->
                        if (resp.isSuccessful) {
                            body = resp.body?.string()
                        }
                    }
                } catch (_: Exception) {}
            }

            if (body != null && body!!.isNotBlank()) {
                val raw = body!!
                val list: List<Map<String, Any>> = if (raw.trimStart().startsWith("{")) {
                    val obj = gson.fromJson(raw, Map::class.java)
                    @Suppress("UNCHECKED_CAST")
                    (obj["dojos"] as? List<Map<String, Any>>) ?: emptyList()
                } else {
                    val listType = object : TypeToken<List<Map<String, Any>>>() {}.type
                    gson.fromJson(raw, listType)
                }

                val dojos = list.map { m ->
                    Dojo(
                        id = m["id"]?.toString() ?: "",
                        name = m["name"]?.toString() ?: "",
                        badge = m["badge"]?.toString() ?: "Official Branch",
                        masterName = m["headInstructor"]?.toString() ?: m["masterName"]?.toString() ?: m["head_instructor"]?.toString() ?: "Sensei Master",
                        masterRank = m["instructorRank"]?.toString() ?: m["masterRank"]?.toString() ?: m["instructor_rank"]?.toString() ?: "Black Belt",
                        address = m["address"]?.toString() ?: "",
                        city = m["city"]?.toString() ?: "Chennai",
                        schedule = m["trainingDays"]?.toString() ?: m["schedule"]?.toString() ?: "Sat, Sun Batches",
                        style = m["style"]?.toString() ?: "Okinawa Shorin Ryu",
                        monthlyFee = (m["monthlyFee"] as? Number)?.toInt() ?: (m["monthly_fee"] as? Number)?.toInt() ?: 800,
                        bannerUrl = m["bannerUrl"]?.toString() ?: ""
                    )
                }
                Result.success(dojos)
            } else {
                Result.failure(Exception("Unable to load dojos directory"))
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

    suspend fun getMasterProfile(): Result<Map<String, Any>> = withContext(Dispatchers.IO) {
        try {
            val req = Request.Builder().url("${baseUrl()}/api/master/profile").get().build()
            client.newCall(req).execute().use { resp ->
                if (resp.isSuccessful) {
                    val body = resp.body?.string() ?: ""
                    val mapType = object : TypeToken<Map<String, Any>>() {}.type
                    Result.success(gson.fromJson(body, mapType))
                } else {
                    Result.failure(Exception("Failed to fetch master profile"))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateMasterProfile(data: Map<String, Any>): Result<String> = withContext(Dispatchers.IO) {
        try {
            val reqBody = gson.toJson(data).toRequestBody(jsonMediaType)
            val req = Request.Builder().url("${baseUrl()}/api/master/profile").put(reqBody).build()
            client.newCall(req).execute().use { resp ->
                if (resp.isSuccessful) {
                    Result.success("Master profile updated and synchronized live to Common UI!")
                } else {
                    Result.failure(Exception("Failed to update master profile"))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getDojoProfile(): Result<Map<String, Any>> = withContext(Dispatchers.IO) {
        try {
            val req = Request.Builder().url("${baseUrl()}/api/master/dojo-profile").get().build()
            client.newCall(req).execute().use { resp ->
                if (resp.isSuccessful) {
                    val body = resp.body?.string() ?: ""
                    val mapType = object : TypeToken<Map<String, Any>>() {}.type
                    Result.success(gson.fromJson(body, mapType))
                } else {
                    Result.failure(Exception("Failed to fetch dojo profile"))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateDojoProfile(data: Map<String, Any>): Result<String> = withContext(Dispatchers.IO) {
        try {
            val reqBody = gson.toJson(data).toRequestBody(jsonMediaType)
            val req = Request.Builder().url("${baseUrl()}/api/master/dojo-profile").put(reqBody).build()
            client.newCall(req).execute().use { resp ->
                if (resp.isSuccessful) {
                    Result.success("Dojo profile updated and live synced to Common UI!")
                } else {
                    Result.failure(Exception("Failed to update dojo profile"))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun recordFeePayment(studentId: String, amount: Double, month: String): Result<String> = withContext(Dispatchers.IO) {
        try {
            val payload = mapOf("student_id" to studentId, "amount" to amount, "month" to month)
            val reqBody = gson.toJson(payload).toRequestBody(jsonMediaType)
            val req = Request.Builder().url("${baseUrl()}/api/fees/record").post(reqBody).build()
            client.newCall(req).execute().use { resp ->
                if (resp.isSuccessful) Result.success("Fee recorded successfully!") else Result.failure(Exception("Failed to record fee"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun registerStudentDirect(data: Map<String, Any>): Result<String> = withContext(Dispatchers.IO) {
        try {
            val reqBody = gson.toJson(data).toRequestBody(jsonMediaType)
            val req = Request.Builder().url("${baseUrl()}/api/master/students").post(reqBody).build()
            client.newCall(req).execute().use { resp ->
                if (resp.isSuccessful) Result.success("Student registered directly!") else Result.failure(Exception("Failed to register student"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

