-- =============================================================================
-- KOMS: Karate Organization Management System — Neon PostgreSQL Schema
-- Platform: Neon Serverless Postgres (https://neon.tech)
-- Version: 2.1.0
--
-- Features:
-- - Native PostgreSQL 16+ support
-- - BIGINT GENERATED ALWAYS AS IDENTITY for auto-increment primary keys
-- - Explicit foreign key constraints with ON DELETE CASCADE / RESTRICT
-- - B-tree indexes on foreign keys and frequent query paths
-- - Proper CHECK constraints for enums (status, priority, roles)
-- - TIMESTAMPTZ for timestamps with timezone & DATE for calendar dates
-- =============================================================================

-- 1. Masters & Instructors Table
CREATE TABLE IF NOT EXISTS masters (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    dojo_name TEXT DEFAULT 'Ranga Nagar',
    role TEXT NOT NULL DEFAULT 'master' CHECK (role IN ('grand_master', 'master', 'instructor')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Master Profiles & Preferences Table
CREATE TABLE IF NOT EXISTS master_profiles (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    master_id BIGINT UNIQUE NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    phone TEXT DEFAULT '+91 98401 23456',
    bio TEXT DEFAULT '5th Dan Black Belt • Chief Instructor at Ranga Nagar Dojo',
    address TEXT DEFAULT 'Mudichur Road, Chennai, Tamil Nadu',
    dojo_info TEXT DEFAULT 'MASS DRAGON DOJO — Ranga Nagar Branch',
    notification_email INTEGER NOT NULL DEFAULT 1 CHECK (notification_email IN (0, 1)),
    notification_sms INTEGER NOT NULL DEFAULT 1 CHECK (notification_sms IN (0, 1)),
    fee_reminder_day INTEGER NOT NULL DEFAULT 5 CHECK (fee_reminder_day BETWEEN 1 AND 28),
    default_monthly_fee INTEGER NOT NULL DEFAULT 1000 CHECK (default_monthly_fee >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Students Table
CREATE TABLE IF NOT EXISTS students (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    master_id BIGINT NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_code TEXT NOT NULL,
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'discontinued', 'inactive')),
    rank TEXT NOT NULL DEFAULT 'White Belt',
    paused_date DATE,
    paused_reason TEXT,
    dob DATE,
    phone TEXT,
    email TEXT,
    guardian_name TEXT,
    guardian_phone TEXT,
    address TEXT,
    monthly_fee INTEGER NOT NULL DEFAULT 1000 CHECK (monthly_fee >= 0),
    profile_image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unq_master_student_code UNIQUE (master_id, student_code)
);

-- 4. Weekly Training Schedules
CREATE TABLE IF NOT EXISTS weekly_schedules (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    master_id BIGINT NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_until DATE,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Schedule Days (0=Sunday, 1=Monday, ..., 6=Saturday)
CREATE TABLE IF NOT EXISTS schedule_days (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    weekly_schedule_id BIGINT NOT NULL REFERENCES weekly_schedules(id) ON DELETE CASCADE,
    weekday INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6),
    CONSTRAINT unq_schedule_weekday UNIQUE (weekly_schedule_id, weekday)
);

-- 6. Class Sessions Table
CREATE TABLE IF NOT EXISTS class_sessions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    master_id BIGINT NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    weekly_schedule_id BIGINT REFERENCES weekly_schedules(id) ON DELETE SET NULL,
    class_date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    session_type TEXT NOT NULL DEFAULT 'Regular Training',
    title TEXT,
    notes TEXT,
    reschedule_reason TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unq_schedule_class_date UNIQUE (weekly_schedule_id, class_date)
);

-- 7. Attendance Records Table
CREATE TABLE IF NOT EXISTS attendance_records (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    master_id BIGINT NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    class_session_id BIGINT NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    attendance_status TEXT NOT NULL CHECK (attendance_status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'LEAVE', 'NOT MARKED')),
    remarks TEXT,
    marked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unq_session_student UNIQUE (class_session_id, student_id)
);

-- 8. Attendance Audit Logs (Maintains historical audit trail of attendance corrections)
CREATE TABLE IF NOT EXISTS attendance_audit_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    attendance_record_id BIGINT NOT NULL REFERENCES attendance_records(id) ON DELETE CASCADE,
    old_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    reason TEXT NOT NULL,
    modified_by BIGINT NOT NULL REFERENCES masters(id) ON DELETE RESTRICT,
    modified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Student Registration Requests
CREATE TABLE IF NOT EXISTS student_registration_requests (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    master_id BIGINT NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    dob DATE,
    phone TEXT,
    email TEXT,
    guardian_name TEXT,
    guardian_phone TEXT,
    address TEXT,
    belt TEXT DEFAULT 'White Belt (Beginner)',
    dojo_name TEXT DEFAULT 'Ranga Nagar Dojo',
    monthly_fee INTEGER NOT NULL DEFAULT 1000 CHECK (monthly_fee >= 0),
    registration_type TEXT NOT NULL DEFAULT 'STUDENT_SUBMITTED' CHECK (registration_type IN ('MASTER_CREATED', 'STUDENT_SUBMITTED')),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by BIGINT REFERENCES masters(id) ON DELETE SET NULL,
    review_notes TEXT
);

-- 10. Fee Payments Table (Real receipt generation & financial tracking)
CREATE TABLE IF NOT EXISTS fee_payments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    master_id BIGINT NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    receipt_number TEXT UNIQUE NOT NULL,
    billing_month TEXT NOT NULL, -- Format 'YYYY-MM'
    amount_due INTEGER NOT NULL DEFAULT 1000 CHECK (amount_due >= 0),
    amount_paid INTEGER NOT NULL CHECK (amount_paid >= 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE')),
    transaction_ref TEXT,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    remarks TEXT,
    status TEXT NOT NULL DEFAULT 'PAID' CHECK (status IN ('PAID', 'PENDING', 'PARTIAL', 'OVERDUE', 'WAIVED')),
    recorded_by BIGINT REFERENCES masters(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Fee Waivers Table
CREATE TABLE IF NOT EXISTS fee_waivers (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    master_id BIGINT NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    billing_month TEXT NOT NULL,
    waiver_amount INTEGER NOT NULL CHECK (waiver_amount >= 0),
    reason TEXT NOT NULL,
    approved_by BIGINT REFERENCES masters(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    master_id BIGINT NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'belt', 'selected')),
    target_details TEXT, -- JSON array of belts or student IDs
    publish_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expiry_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED')),
    attachment_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Announcement Read Receipts
CREATE TABLE IF NOT EXISTS announcement_reads (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    announcement_id BIGINT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unq_announcement_student UNIQUE (announcement_id, student_id)
);

-- =============================================================================
-- PERFORMANCE INDEXES (Foreign Keys & Frequent Query Paths)
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_masters_email ON masters(email);

CREATE INDEX IF NOT EXISTS idx_students_master ON students(master_id, status);
CREATE INDEX IF NOT EXISTS idx_students_code ON students(student_code);

CREATE INDEX IF NOT EXISTS idx_schedules_master ON weekly_schedules(master_id, is_active);
CREATE INDEX IF NOT EXISTS idx_schedule_days_weekly ON schedule_days(weekly_schedule_id);

CREATE INDEX IF NOT EXISTS idx_sessions_master_date ON class_sessions(master_id, class_date);
CREATE INDEX IF NOT EXISTS idx_sessions_weekly ON class_sessions(weekly_schedule_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON class_sessions(status);

CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance_records(class_session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_master ON attendance_records(master_id);

CREATE INDEX IF NOT EXISTS idx_audit_record ON attendance_audit_logs(attendance_record_id);
CREATE INDEX IF NOT EXISTS idx_audit_modified_by ON attendance_audit_logs(modified_by);

CREATE INDEX IF NOT EXISTS idx_reg_requests_master ON student_registration_requests(master_id, status);

CREATE INDEX IF NOT EXISTS idx_fee_payments_student ON fee_payments(student_id, billing_month);
CREATE INDEX IF NOT EXISTS idx_fee_payments_master ON fee_payments(master_id, billing_month);
CREATE INDEX IF NOT EXISTS idx_fee_payments_receipt ON fee_payments(receipt_number);

CREATE INDEX IF NOT EXISTS idx_fee_waivers_student ON fee_waivers(student_id, billing_month);
CREATE INDEX IF NOT EXISTS idx_fee_waivers_master ON fee_waivers(master_id, billing_month);

CREATE INDEX IF NOT EXISTS idx_announcements_master ON announcements(master_id, status);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_announcement ON announcement_reads(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_student ON announcement_reads(student_id);

