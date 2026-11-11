package com.koms.app.core.database

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import com.koms.app.core.model.*

class KomsLocalDb(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    companion object {
        const val DATABASE_NAME = "koms_offline_cache.db"
        const val DATABASE_VERSION = 1
    }

    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS dojos (
                id TEXT PRIMARY KEY,
                name TEXT,
                badge TEXT,
                master_name TEXT,
                master_rank TEXT,
                address TEXT,
                city TEXT,
                schedule TEXT,
                style TEXT,
                monthly_fee INTEGER,
                banner_url TEXT
            )
        """.trimIndent())

        db.execSQL("""
            CREATE TABLE IF NOT EXISTS students (
                id TEXT PRIMARY KEY,
                name TEXT,
                member_id TEXT,
                email TEXT,
                phone TEXT,
                dojo_id TEXT,
                belt TEXT,
                status TEXT,
                attendance_pct INTEGER
            )
        """.trimIndent())

        db.execSQL("""
            CREATE TABLE IF NOT EXISTS attendance (
                id TEXT PRIMARY KEY,
                student_id TEXT,
                student_name TEXT,
                date TEXT,
                status TEXT,
                notes TEXT,
                is_synced INTEGER DEFAULT 1
            )
        """.trimIndent())

        db.execSQL("""
            CREATE TABLE IF NOT EXISTS fees (
                id TEXT PRIMARY KEY,
                student_id TEXT,
                student_name TEXT,
                amount REAL,
                status TEXT,
                month TEXT,
                payment_date TEXT,
                is_synced INTEGER DEFAULT 1
            )
        """.trimIndent())

        db.execSQL("""
            CREATE TABLE IF NOT EXISTS schedules (
                id TEXT PRIMARY KEY,
                dojo_id TEXT,
                day_of_week TEXT,
                start_time TEXT,
                end_time TEXT,
                style TEXT,
                status TEXT
            )
        """.trimIndent())

        db.execSQL("""
            CREATE TABLE IF NOT EXISTS join_requests (
                id TEXT PRIMARY KEY,
                student_name TEXT,
                email TEXT,
                phone TEXT,
                dojo_id TEXT,
                dojo_name TEXT,
                status TEXT,
                requested_at TEXT
            )
        """.trimIndent())

        db.execSQL("""
            CREATE TABLE IF NOT EXISTS pending_sync (
                id TEXT PRIMARY KEY,
                action_type TEXT,
                endpoint TEXT,
                method TEXT,
                payload_json TEXT,
                created_at INTEGER,
                status TEXT
            )
        """.trimIndent())
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        db.execSQL("DROP TABLE IF EXISTS dojos")
        db.execSQL("DROP TABLE IF EXISTS students")
        db.execSQL("DROP TABLE IF EXISTS attendance")
        db.execSQL("DROP TABLE IF EXISTS fees")
        db.execSQL("DROP TABLE IF EXISTS schedules")
        db.execSQL("DROP TABLE IF EXISTS join_requests")
        db.execSQL("DROP TABLE IF EXISTS pending_sync")
        onCreate(db)
    }

    // --- DOJOS ---
    fun saveDojos(dojos: List<Dojo>) {
        val db = writableDatabase
        db.beginTransaction()
        try {
            for (d in dojos) {
                val cv = ContentValues().apply {
                    put("id", d.id)
                    put("name", d.name)
                    put("badge", d.badge)
                    put("master_name", d.masterName)
                    put("master_rank", d.masterRank)
                    put("address", d.address)
                    put("city", d.city)
                    put("schedule", d.schedule)
                    put("style", d.style)
                    put("monthly_fee", d.monthlyFee)
                    put("banner_url", d.bannerUrl)
                }
                db.insertWithOnConflict("dojos", null, cv, SQLiteDatabase.CONFLICT_REPLACE)
            }
            db.setTransactionSuccessful()
        } finally {
            db.endTransaction()
        }
    }

    fun getDojos(): List<Dojo> {
        val list = mutableListOf<Dojo>()
        val db = readableDatabase
        val cursor = db.rawQuery("SELECT * FROM dojos ORDER BY name ASC", null)
        cursor.use { c ->
            while (c.moveToNext()) {
                list.add(
                    Dojo(
                        id = c.getString(c.getColumnIndexOrThrow("id")),
                        name = c.getString(c.getColumnIndexOrThrow("name")),
                        badge = c.getString(c.getColumnIndexOrThrow("badge")),
                        masterName = c.getString(c.getColumnIndexOrThrow("master_name")),
                        masterRank = c.getString(c.getColumnIndexOrThrow("master_rank")),
                        address = c.getString(c.getColumnIndexOrThrow("address")),
                        city = c.getString(c.getColumnIndexOrThrow("city")),
                        schedule = c.getString(c.getColumnIndexOrThrow("schedule")),
                        style = c.getString(c.getColumnIndexOrThrow("style")),
                        monthlyFee = c.getInt(c.getColumnIndexOrThrow("monthly_fee")),
                        bannerUrl = c.getString(c.getColumnIndexOrThrow("banner_url"))
                    )
                )
            }
        }
        return list
    }

    // --- STUDENTS ---
    fun saveStudents(students: List<Student>) {
        val db = writableDatabase
        db.beginTransaction()
        try {
            for (s in students) {
                val cv = ContentValues().apply {
                    put("id", s.id)
                    put("name", s.name)
                    put("member_id", s.memberId)
                    put("email", s.email)
                    put("phone", s.phone)
                    put("dojo_id", s.dojoId)
                    put("belt", s.belt)
                    put("status", s.status)
                    put("attendance_pct", s.attendancePct)
                }
                db.insertWithOnConflict("students", null, cv, SQLiteDatabase.CONFLICT_REPLACE)
            }
            db.setTransactionSuccessful()
        } finally {
            db.endTransaction()
        }
    }

    fun getStudents(dojoId: String? = null): List<Student> {
        val list = mutableListOf<Student>()
        val db = readableDatabase
        val query = if (dojoId.isNullOrBlank()) "SELECT * FROM students ORDER BY name ASC" else "SELECT * FROM students WHERE dojo_id = ? ORDER BY name ASC"
        val args = if (dojoId.isNullOrBlank()) null else arrayOf(dojoId)
        val cursor = db.rawQuery(query, args)
        cursor.use { c ->
            while (c.moveToNext()) {
                list.add(
                    Student(
                        id = c.getString(c.getColumnIndexOrThrow("id")),
                        name = c.getString(c.getColumnIndexOrThrow("name")),
                        memberId = c.getString(c.getColumnIndexOrThrow("member_id")),
                        email = c.getString(c.getColumnIndexOrThrow("email")),
                        phone = c.getString(c.getColumnIndexOrThrow("phone")),
                        dojoId = c.getString(c.getColumnIndexOrThrow("dojo_id")),
                        belt = c.getString(c.getColumnIndexOrThrow("belt")),
                        status = c.getString(c.getColumnIndexOrThrow("status")),
                        attendancePct = c.getInt(c.getColumnIndexOrThrow("attendance_pct"))
                    )
                )
            }
        }
        return list
    }

    // --- ATTENDANCE ---
    fun saveAttendance(records: List<AttendanceRecord>) {
        val db = writableDatabase
        db.beginTransaction()
        try {
            for (a in records) {
                val cv = ContentValues().apply {
                    put("id", a.id)
                    put("student_id", a.studentId)
                    put("student_name", a.studentName)
                    put("date", a.date)
                    put("status", a.status)
                    put("notes", a.notes)
                    put("is_synced", if (a.isSynced) 1 else 0)
                }
                db.insertWithOnConflict("attendance", null, cv, SQLiteDatabase.CONFLICT_REPLACE)
            }
            db.setTransactionSuccessful()
        } finally {
            db.endTransaction()
        }
    }

    fun getAttendanceForDate(date: String): List<AttendanceRecord> {
        val list = mutableListOf<AttendanceRecord>()
        val db = readableDatabase
        val cursor = db.rawQuery("SELECT * FROM attendance WHERE date = ?", arrayOf(date))
        cursor.use { c ->
            while (c.moveToNext()) {
                list.add(
                    AttendanceRecord(
                        id = c.getString(c.getColumnIndexOrThrow("id")),
                        studentId = c.getString(c.getColumnIndexOrThrow("student_id")),
                        studentName = c.getString(c.getColumnIndexOrThrow("student_name")),
                        date = c.getString(c.getColumnIndexOrThrow("date")),
                        status = c.getString(c.getColumnIndexOrThrow("status")),
                        notes = c.getString(c.getColumnIndexOrThrow("notes")),
                        isSynced = c.getInt(c.getColumnIndexOrThrow("is_synced")) == 1
                    )
                )
            }
        }
        return list
    }

    fun getAttendanceForStudent(studentId: String): List<AttendanceRecord> {
        val list = mutableListOf<AttendanceRecord>()
        val db = readableDatabase
        val cursor = db.rawQuery("SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC", arrayOf(studentId))
        cursor.use { c ->
            while (c.moveToNext()) {
                list.add(
                    AttendanceRecord(
                        id = c.getString(c.getColumnIndexOrThrow("id")),
                        studentId = c.getString(c.getColumnIndexOrThrow("student_id")),
                        studentName = c.getString(c.getColumnIndexOrThrow("student_name")),
                        date = c.getString(c.getColumnIndexOrThrow("date")),
                        status = c.getString(c.getColumnIndexOrThrow("status")),
                        notes = c.getString(c.getColumnIndexOrThrow("notes")),
                        isSynced = c.getInt(c.getColumnIndexOrThrow("is_synced")) == 1
                    )
                )
            }
        }
        return list
    }

    // --- FEES ---
    fun saveFees(fees: List<FeeRecord>) {
        val db = writableDatabase
        db.beginTransaction()
        try {
            for (f in fees) {
                val cv = ContentValues().apply {
                    put("id", f.id)
                    put("student_id", f.studentId)
                    put("student_name", f.studentName)
                    put("amount", f.amount)
                    put("status", f.status)
                    put("month", f.month)
                    put("payment_date", f.paymentDate)
                    put("is_synced", if (f.isSynced) 1 else 0)
                }
                db.insertWithOnConflict("fees", null, cv, SQLiteDatabase.CONFLICT_REPLACE)
            }
            db.setTransactionSuccessful()
        } finally {
            db.endTransaction()
        }
    }

    fun getFees(): List<FeeRecord> {
        val list = mutableListOf<FeeRecord>()
        val db = readableDatabase
        val cursor = db.rawQuery("SELECT * FROM fees ORDER BY payment_date DESC", null)
        cursor.use { c ->
            while (c.moveToNext()) {
                list.add(
                    FeeRecord(
                        id = c.getString(c.getColumnIndexOrThrow("id")),
                        studentId = c.getString(c.getColumnIndexOrThrow("student_id")),
                        studentName = c.getString(c.getColumnIndexOrThrow("student_name")),
                        amount = c.getDouble(c.getColumnIndexOrThrow("amount")),
                        status = c.getString(c.getColumnIndexOrThrow("status")),
                        month = c.getString(c.getColumnIndexOrThrow("month")),
                        paymentDate = c.getString(c.getColumnIndexOrThrow("payment_date")),
                        isSynced = c.getInt(c.getColumnIndexOrThrow("is_synced")) == 1
                    )
                )
            }
        }
        return list
    }

    // --- PENDING SYNC QUEUE ---
    fun queuePendingSync(op: PendingSync) {
        val db = writableDatabase
        val cv = ContentValues().apply {
            put("id", op.id)
            put("action_type", op.actionType)
            put("endpoint", op.endpoint)
            put("method", op.method)
            put("payload_json", op.payloadJson)
            put("created_at", op.createdAt)
            put("status", op.status)
        }
        db.insertWithOnConflict("pending_sync", null, cv, SQLiteDatabase.CONFLICT_REPLACE)
    }

    fun getPendingSyncs(): List<PendingSync> {
        val list = mutableListOf<PendingSync>()
        val db = readableDatabase
        val cursor = db.rawQuery("SELECT * FROM pending_sync WHERE status = 'pending' ORDER BY created_at ASC", null)
        cursor.use { c ->
            while (c.moveToNext()) {
                list.add(
                    PendingSync(
                        id = c.getString(c.getColumnIndexOrThrow("id")),
                        actionType = c.getString(c.getColumnIndexOrThrow("action_type")),
                        endpoint = c.getString(c.getColumnIndexOrThrow("endpoint")),
                        method = c.getString(c.getColumnIndexOrThrow("method")),
                        payloadJson = c.getString(c.getColumnIndexOrThrow("payload_json")),
                        createdAt = c.getLong(c.getColumnIndexOrThrow("created_at")),
                        status = c.getString(c.getColumnIndexOrThrow("status"))
                    )
                )
            }
        }
        return list
    }

    fun removePendingSync(id: String) {
        val db = writableDatabase
        db.delete("pending_sync", "id = ?", arrayOf(id))
    }
}

