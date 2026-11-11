package com.koms.app.core.security

import android.content.Context
import android.content.SharedPreferences
import com.koms.app.core.model.User

class SessionManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)

    companion object {
        private const val PREF_NAME = "koms_secure_session"
        private const val KEY_TOKEN = "auth_token"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_USER_NAME = "user_name"
        private const val KEY_USER_EMAIL = "user_email"
        private const val KEY_USER_ROLE = "user_role"
        private const val KEY_USER_STATUS = "user_status"
        private const val KEY_MEMBER_ID = "member_id"
        private const val KEY_DOJO_ID = "dojo_id"
        private const val KEY_SERVER_URL = "server_api_url"

        const val DEFAULT_PRODUCTION_URL = "https://koms-backend.onrender.com"
        const val DEFAULT_USB_URL = "http://localhost:5000"
    }

    fun saveSession(token: String, user: User) {
        prefs.edit().apply {
            putString(KEY_TOKEN, token)
            putString(KEY_USER_ID, user.id)
            putString(KEY_USER_NAME, user.name)
            putString(KEY_USER_EMAIL, user.email)
            putString(KEY_USER_ROLE, user.role)
            putString(KEY_USER_STATUS, user.status)
            putString(KEY_MEMBER_ID, user.memberId)
            putString(KEY_DOJO_ID, user.dojoId ?: "")
            apply()
        }
    }

    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)

    fun isLoggedIn(): Boolean {
        val token = getToken()
        val role = getUserRole()
        return !token.isNullOrBlank() && !role.isNullOrBlank()
    }

    fun getCurrentUser(): User? {
        val id = prefs.getString(KEY_USER_ID, null) ?: return null
        return User(
            id = id,
            name = prefs.getString(KEY_USER_NAME, "") ?: "",
            email = prefs.getString(KEY_USER_EMAIL, "") ?: "",
            role = prefs.getString(KEY_USER_ROLE, "") ?: "",
            status = prefs.getString(KEY_USER_STATUS, "active") ?: "active",
            memberId = prefs.getString(KEY_MEMBER_ID, "") ?: "",
            dojoId = prefs.getString(KEY_DOJO_ID, null)?.takeIf { it.isNotBlank() },
            token = getToken()
        )
    }

    fun getUserRole(): String? = prefs.getString(KEY_USER_ROLE, null)

    fun getServerUrl(): String {
        return prefs.getString(KEY_SERVER_URL, DEFAULT_PRODUCTION_URL) ?: DEFAULT_PRODUCTION_URL
    }

    fun setServerUrl(url: String) {
        prefs.edit().putString(KEY_SERVER_URL, url.trimEnd('/')).apply()
    }

    fun clearSession() {
        prefs.edit().apply {
            remove(KEY_TOKEN)
            remove(KEY_USER_ID)
            remove(KEY_USER_NAME)
            remove(KEY_USER_EMAIL)
            remove(KEY_USER_ROLE)
            remove(KEY_USER_STATUS)
            remove(KEY_MEMBER_ID)
            remove(KEY_DOJO_ID)
            apply()
        }
    }
}
