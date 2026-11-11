package com.koms.app.core.model

data class User(
    val id: String = "",
    val name: String = "",
    val email: String = "",
    val role: String = "", // "student", "master", "grandmaster"
    val status: String = "active", // "active", "pending", "pending_approval", "rejected"
    val memberId: String = "",
    val dojoId: String? = null,
    val token: String? = null
)

data class Dojo(
    val id: String = "",
    val name: String = "",
    val badge: String = "Honbu Dojo",
    val masterName: String = "",
    val masterRank: String = "Master",
    val address: String = "",
    val city: String = "Chennai",
    val schedule: String = "Sat & Sun 06:00 AM - 08:00 AM",
    val style: String = "Okinawa Shorin Ryu",
    val monthlyFee: Int = 1200,
    val bannerUrl: String = ""
)

data class Student(
    val id: String = "",
    val name: String = "",
    val memberId: String = "",
    val email: String = "",
    val phone: String = "",
    val dojoId: String = "",
    val belt: String = "White Belt",
    val status: String = "active",
    val attendancePct: Int = 100
)

data class AttendanceRecord(
    val id: String = "",
    val studentId: String = "",
    val studentName: String = "",
    val date: String = "",
    val status: String = "present", // "present", "absent", "late", "excused"
    val notes: String = "",
    val isSynced: Boolean = true
)

data class FeeRecord(
    val id: String = "",
    val studentId: String = "",
    val studentName: String = "",
    val amount: Double = 0.0,
    val status: String = "paid", // "paid", "pending", "overdue"
    val month: String = "",
    val paymentDate: String = "",
    val isSynced: Boolean = true
)

data class ClassSchedule(
    val id: String = "",
    val dojoId: String = "",
    val dayOfWeek: String = "Saturday",
    val startTime: String = "06:00 AM",
    val endTime: String = "08:00 AM",
    val style: String = "Shorin-Ryu Karate",
    val status: String = "active"
)

data class JoinRequest(
    val id: String = "",
    val studentName: String = "",
    val email: String = "",
    val phone: String = "",
    val dojoId: String = "",
    val dojoName: String = "",
    val status: String = "pending_review",
    val requestedAt: String = ""
)

data class PendingSync(
    val id: String = "",
    val actionType: String = "", // "MARK_ATTENDANCE", "RECORD_FEE", "UPDATE_PROFILE"
    val endpoint: String = "",
    val method: String = "POST",
    val payloadJson: String = "",
    val createdAt: Long = System.currentTimeMillis(),
    val status: String = "pending"
)

data class AppVersionInfo(
    val latestVersion: String = "1.0.0",
    val versionCode: Int = 1,
    val updateAvailable: Boolean = false,
    val downloadUrl: String = "",
    val releaseNotes: List<String> = emptyList()
)

