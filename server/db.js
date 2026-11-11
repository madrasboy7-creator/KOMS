import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Worker, MessageChannel, receiveMessageOnPort } from 'node:worker_threads';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Neon PostgreSQL / Render connection string
const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

export const isPostgres = Boolean(DATABASE_URL);
export const isNeon = Boolean(DATABASE_URL && DATABASE_URL.includes('neon.tech'));

let dbInstance = null;

function createPostgresAdapter(connectionString) {
  const { port1, port2 } = new MessageChannel();
  const sab = new SharedArrayBuffer(4);
  const notify = new Int32Array(sab);

  const workerPath = path.join(__dirname, 'pg_worker.js');
  const worker = new Worker(workerPath);

  // Send communication port and buffer to worker
  worker.postMessage({ port: port2, sab, connectionString }, [port2]);

  // Wait for worker startup ready signal
  Atomics.wait(notify, 0, 0, 5000);

  function executeSync(type, sql, params = []) {
    Atomics.store(notify, 0, 0);
    port1.postMessage({ type, sql, params });
    // Block main thread until worker signals completion
    Atomics.wait(notify, 0, 0);
    const msg = receiveMessageOnPort(port1);
    if (!msg || !msg.message) {
      throw new Error(`Database worker error: No response received for query [${type}]`);
    }
    if (!msg.message.success) {
      throw new Error(`Database Error (${type}): ${msg.message.error}`);
    }
    return msg.message.result;
  }

  return {
    isPostgres: true,
    prepare(sql) {
      return {
        run(...params) {
          return executeSync('run', sql, params);
        },
        get(...params) {
          return executeSync('get', sql, params);
        },
        all(...params) {
          return executeSync('all', sql, params);
        },
      };
    },
    exec(sql) {
      executeSync('exec', sql);
    },
  };
}

function createSqliteAdapter(dbPath) {
  // Dynamic import of node:sqlite only when running in SQLite mode
  const { DatabaseSync } = requireNodeSqlite();
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');

  // Core Schema Creation for SQLite
  db.exec(`
    CREATE TABLE IF NOT EXISTS masters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      dojo_name TEXT DEFAULT 'Ranga Nagar',
      role TEXT NOT NULL DEFAULT 'master',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      master_id INTEGER NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
      student_name TEXT NOT NULL,
      student_code TEXT NOT NULL,
      joining_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'paused', 'discontinued', 'inactive')),
      rank TEXT DEFAULT 'White Belt',
      paused_date TEXT,
      paused_reason TEXT,
      dob TEXT,
      phone TEXT,
      email TEXT,
      guardian_name TEXT,
      guardian_phone TEXT,
      address TEXT,
      monthly_fee INTEGER DEFAULT 1000,
      profile_image TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(master_id, student_code)
    );

    CREATE TABLE IF NOT EXISTS weekly_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      master_id INTEGER NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
      effective_from TEXT NOT NULL,
      effective_until TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS schedule_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      weekly_schedule_id INTEGER NOT NULL REFERENCES weekly_schedules(id) ON DELETE CASCADE,
      weekday INTEGER NOT NULL CHECK(weekday BETWEEN 0 AND 6),
      UNIQUE(weekly_schedule_id, weekday)
    );

    CREATE TABLE IF NOT EXISTS class_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      master_id INTEGER NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
      weekly_schedule_id INTEGER REFERENCES weekly_schedules(id) ON DELETE SET NULL,
      class_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'completed', 'cancelled')),
      session_type TEXT DEFAULT 'Regular Training',
      title TEXT,
      notes TEXT,
      reschedule_reason TEXT,
      cancellation_reason TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(weekly_schedule_id, class_date)
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      master_id INTEGER NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
      class_session_id INTEGER NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      attendance_status TEXT NOT NULL CHECK(attendance_status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'LEAVE', 'NOT MARKED')),
      remarks TEXT,
      marked_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(class_session_id, student_id)
    );

    CREATE TABLE IF NOT EXISTS attendance_audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attendance_record_id INTEGER NOT NULL REFERENCES attendance_records(id) ON DELETE CASCADE,
      old_status TEXT NOT NULL,
      new_status TEXT NOT NULL,
      reason TEXT NOT NULL,
      modified_by INTEGER NOT NULL REFERENCES masters(id),
      modified_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS student_registration_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      master_id INTEGER NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
      student_name TEXT NOT NULL,
      dob TEXT,
      phone TEXT,
      email TEXT,
      guardian_name TEXT,
      guardian_phone TEXT,
      address TEXT,
      belt TEXT DEFAULT 'White Belt (Beginner)',
      dojo_name TEXT DEFAULT 'Ranga Nagar Dojo',
      monthly_fee INTEGER DEFAULT 1000,
      registration_type TEXT DEFAULT 'STUDENT_SUBMITTED' CHECK(registration_type IN ('MASTER_CREATED', 'STUDENT_SUBMITTED')),
      status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED')),
      requested_at TEXT DEFAULT (datetime('now')),
      reviewed_at TEXT,
      reviewed_by INTEGER REFERENCES masters(id),
      review_notes TEXT
    );

    CREATE TABLE IF NOT EXISTS fee_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      master_id INTEGER NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      receipt_number TEXT UNIQUE NOT NULL,
      billing_month TEXT NOT NULL,
      amount_due INTEGER NOT NULL DEFAULT 1000,
      amount_paid INTEGER NOT NULL,
      payment_method TEXT NOT NULL CHECK(payment_method IN ('CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE')),
      transaction_ref TEXT,
      payment_date TEXT NOT NULL,
      remarks TEXT,
      status TEXT NOT NULL DEFAULT 'PAID' CHECK(status IN ('PAID', 'PENDING', 'PARTIAL', 'OVERDUE', 'WAIVED')),
      recorded_by INTEGER REFERENCES masters(id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS fee_waivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      master_id INTEGER NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      billing_month TEXT NOT NULL,
      waiver_amount INTEGER NOT NULL,
      reason TEXT NOT NULL,
      approved_by INTEGER REFERENCES masters(id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      master_id INTEGER NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      priority TEXT DEFAULT 'Medium' CHECK(priority IN ('Low', 'Medium', 'High', 'Urgent')),
      target_audience TEXT NOT NULL DEFAULT 'all' CHECK(target_audience IN ('all', 'belt', 'selected')),
      target_details TEXT,
      publish_date TEXT DEFAULT (datetime('now')),
      expiry_date TEXT,
      status TEXT DEFAULT 'PUBLISHED' CHECK(status IN ('DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED')),
      attachment_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS announcement_reads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      announcement_id INTEGER NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      read_at TEXT DEFAULT (datetime('now')),
      UNIQUE(announcement_id, student_id)
    );

    CREATE TABLE IF NOT EXISTS master_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      master_id INTEGER UNIQUE NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
      phone TEXT DEFAULT '+91 98401 23456',
      bio TEXT DEFAULT '5th Dan Black Belt • Chief Instructor at Ranga Nagar Dojo',
      address TEXT DEFAULT 'Mudichur Road, Chennai, Tamil Nadu',
      dojo_info TEXT DEFAULT 'MASS DRAGON DOJO — Ranga Nagar Branch',
      notification_email INTEGER DEFAULT 1,
      notification_sms INTEGER DEFAULT 1,
      fee_reminder_day INTEGER DEFAULT 5,
      default_monthly_fee INTEGER DEFAULT 1000,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_students_master ON students(master_id, status);
    CREATE INDEX IF NOT EXISTS idx_sessions_master_date ON class_sessions(master_id, class_date);
    CREATE INDEX IF NOT EXISTS idx_sessions_status ON class_sessions(status);
    CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance_records(class_session_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance_records(student_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_master ON attendance_records(master_id);
    CREATE INDEX IF NOT EXISTS idx_audit_record ON attendance_audit_logs(attendance_record_id);
    CREATE INDEX IF NOT EXISTS idx_fee_payments_student ON fee_payments(student_id, billing_month);
    CREATE INDEX IF NOT EXISTS idx_fee_payments_master ON fee_payments(master_id, billing_month);
    CREATE INDEX IF NOT EXISTS idx_announcements_master ON announcements(master_id, status);

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'master', 'grandmaster')),
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('pending', 'pending_approval', 'active', 'suspended', 'rejected')),
      member_id TEXT UNIQUE,
      phone TEXT,
      avatar TEXT,
      dojo_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS dojos (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      badge TEXT DEFAULT '龍神',
      master_id INTEGER,
      head_instructor TEXT,
      instructor_rank TEXT,
      instructor_experience TEXT,
      instructor_avatar TEXT,
      instructor_bio TEXT,
      instructor_qualifications TEXT,
      instructor_achievements TEXT,
      area TEXT,
      city TEXT DEFAULT 'Chennai',
      state TEXT DEFAULT 'Tamil Nadu',
      country TEXT DEFAULT 'India',
      pincode TEXT,
      address TEXT,
      landmarks TEXT,
      phone TEXT,
      email TEXT,
      training_days TEXT,
      class_timings TEXT,
      levels_offered TEXT,
      entry_fee INTEGER DEFAULT 1000,
      monthly_fee INTEGER DEFAULT 800,
      facilities TEXT,
      description TEXT,
      banner_url TEXT,
      logo_url TEXT,
      gallery TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'pending_approval', 'suspended', 'inactive')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS master_applications (
      id TEXT PRIMARY KEY,
      user_id INTEGER,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      dob TEXT,
      gender TEXT,
      style TEXT,
      dan_rank TEXT,
      experience TEXT,
      qualifications TEXT,
      teaching_experience TEXT,
      achievements TEXT,
      about_master TEXT,
      dojo_name TEXT NOT NULL,
      dojo_address TEXT,
      dojo_city TEXT,
      dojo_state TEXT,
      dojo_pincode TEXT,
      dojo_phone TEXT,
      dojo_email TEXT,
      training_styles TEXT,
      initial_schedule TEXT,
      status TEXT NOT NULL DEFAULT 'pending_approval' CHECK(status IN ('pending_approval', 'approved', 'rejected')),
      submitted_at TEXT DEFAULT (datetime('now')),
      reviewed_by INTEGER,
      reviewer_notes TEXT
    );

    CREATE TABLE IF NOT EXISTS join_requests (
      id TEXT PRIMARY KEY,
      student_user_id INTEGER,
      student_name TEXT NOT NULL,
      dojo_id TEXT,
      dojo_name TEXT NOT NULL,
      dob TEXT,
      age TEXT,
      gender TEXT,
      blood_group TEXT,
      guardian_name TEXT,
      guardian_phone TEXT,
      guardian_whatsapp TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      training_category TEXT,
      prior_experience TEXT,
      status TEXT NOT NULL DEFAULT 'pending_review' CHECK(status IN ('pending_review', 'approved', 'rejected')),
      submitted_at TEXT DEFAULT (datetime('now')),
      reviewed_by INTEGER,
      reviewer_notes TEXT,
      assigned_belt TEXT,
      assigned_monthly_fee INTEGER
    );

    CREATE TABLE IF NOT EXISTS student_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE,
      student_code TEXT UNIQUE NOT NULL,
      dojo_id TEXT,
      master_id INTEGER,
      name TEXT NOT NULL,
      dob TEXT,
      gender TEXT,
      blood_group TEXT,
      guardian_name TEXT,
      guardian_phone TEXT,
      guardian_whatsapp TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      belt TEXT DEFAULT 'White Belt (Beginner)',
      training_category TEXT,
      prior_experience TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'pending', 'suspended', 'inactive')),
      monthly_fee INTEGER DEFAULT 800,
      joining_date TEXT DEFAULT (datetime('now')),
      avatar TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT DEFAULT (datetime('now')),
      user_id TEXT,
      user_name TEXT,
      user_role TEXT,
      dojo_id TEXT,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      details TEXT,
      reason TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role, status);
    CREATE INDEX IF NOT EXISTS idx_dojos_status ON dojos(status);
    CREATE INDEX IF NOT EXISTS idx_join_requests_dojo ON join_requests(dojo_id, status);
    CREATE INDEX IF NOT EXISTS idx_master_apps_status ON master_applications(status);
  `);

  try {
    const masterCols = db.prepare('PRAGMA table_info(masters)').all();
    if (!masterCols.some(c => c.name === 'role')) {
      db.exec("ALTER TABLE masters ADD COLUMN role TEXT NOT NULL DEFAULT 'master';");
    }
  } catch (_) {}

  return db;
}

let nodeSqliteCache = null;
function requireNodeSqlite() {
  if (!nodeSqliteCache) {
    const { DatabaseSync } = requireNativeSqlite();
    nodeSqliteCache = { DatabaseSync };
  }
  return nodeSqliteCache;
}

import { DatabaseSync as NativeDatabaseSync } from 'node:sqlite';
function requireNativeSqlite() {
  return { DatabaseSync: NativeDatabaseSync };
}

export function initDatabase() {
  if (dbInstance) return dbInstance;

  if (DATABASE_URL) {
    const isNeonEndpoint = DATABASE_URL.includes('neon.tech');
    console.log(`⚡ Connecting to ${isNeonEndpoint ? 'Neon Serverless' : ''} PostgreSQL database...`);
    dbInstance = createPostgresAdapter(DATABASE_URL);
    console.log(`✅ ${isNeonEndpoint ? 'Neon' : ''} PostgreSQL connected via connection pool.`);
  } else {
    const defaultDbPath = process.env.KOMS_DB_PATH || path.join(__dirname, '..', 'koms.db');
    console.log(`📁 Connecting to local SQLite database at: ${defaultDbPath}`);
    dbInstance = createSqliteAdapter(defaultDbPath);
  }

  return dbInstance;
}

export const db = initDatabase();
