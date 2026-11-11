import express from 'express';
import { db } from '../db.js';
import { authMiddleware, requireRole } from '../auth.js';

const router = express.Router();
router.use(authMiddleware);
router.use(requireRole('student'));

// Helper to resolve student record for logged-in user
function getStudentForUser(user) {
  // 1. By user_id in student_profiles
  let profile = db.prepare('SELECT * FROM student_profiles WHERE user_id = ?').get(user.id);
  if (profile) return profile;

  // 2. By email or member_id in students
  let student = db.prepare('SELECT * FROM students WHERE email = ? OR student_code = ?').get(user.email, user.member_id);
  if (student) return student;

  // 3. Fallback to user data
  return {
    id: user.id,
    user_id: user.id,
    name: user.name,
    student_name: user.name,
    email: user.email,
    phone: user.phone,
    student_code: user.member_id || 'STU-PENDING',
    belt: 'White Belt (Beginner)',
    rank: 'White Belt (Beginner)',
    status: user.status,
    dojo_id: user.dojo_id,
    monthly_fee: 800,
    joining_date: user.created_at ? user.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10)
  };
}

// -----------------------------------------------------------------------------
// GET /api/student/dashboard — Student Dashboard Overview
// -----------------------------------------------------------------------------
router.get('/dashboard', (req, res) => {
  try {
    const student = getStudentForUser(req.user);

    // 1. Dojo Details
    let dojo = null;
    if (student.dojo_id) {
      dojo = db.prepare('SELECT * FROM dojos WHERE id = ?').get(student.dojo_id);
    }
    if (!dojo) {
      dojo = db.prepare("SELECT * FROM dojos WHERE status = 'active' LIMIT 1").get() || {
        name: 'MASS DRAGON DOJO — Central Dojo',
        head_instructor: 'Sensei Rubeshwaren',
        address: 'Mudichur Road, Chennai, Tamil Nadu',
        phone: '+91 96001 03987',
        class_timings: '06:00 PM – 07:30 PM',
        training_days: 'Saturday, Sunday'
      };
    }

    // 2. Attendance Summary
    const attRecords = db.prepare(`
      SELECT ar.*, cs.class_date, cs.start_time, cs.end_time, cs.session_type
      FROM attendance_records ar
      JOIN class_sessions cs ON ar.class_session_id = cs.id
      WHERE ar.student_id = ? OR ar.student_id = ?
      ORDER BY cs.class_date DESC
    `).all(student.id, student.user_id || 0);

    const totalSessions = attRecords.length;
    const presentCount = attRecords.filter(r => r.attendance_status === 'PRESENT').length;
    const absentCount = attRecords.filter(r => r.attendance_status === 'ABSENT').length;
    const lateCount = attRecords.filter(r => r.attendance_status === 'LATE').length;
    const excusedCount = attRecords.filter(r => r.attendance_status === 'EXCUSED' || r.attendance_status === 'LEAVE').length;
    const attendancePercentage = totalSessions > 0 ? Math.round(((presentCount + lateCount) / totalSessions) * 100) : 0;

    // 3. Fee Status
    const payments = db.prepare(`
      SELECT * FROM fee_payments
      WHERE student_id = ? OR student_id = ?
      ORDER BY payment_date DESC
    `).all(student.id, student.user_id || 0);

    const totalPaid = payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + (p.amount_paid || 0), 0);
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthPaid = payments.some(p => p.billing_month === currentMonth && p.status === 'PAID');

    // 4. Upcoming Classes
    const today = new Date().toISOString().slice(0, 10);
    const upcomingClasses = db.prepare(`
      SELECT id, class_date, start_time, end_time, session_type, status, title
      FROM class_sessions
      WHERE class_date >= ? AND status != 'cancelled'
      ORDER BY class_date ASC LIMIT 5
    `).all(today);

    // 5. Announcements
    const announcements = db.prepare(`
      SELECT id, title, message, category, priority, publish_date
      FROM announcements
      WHERE status = 'PUBLISHED'
      ORDER BY publish_date DESC LIMIT 5
    `).all();

    res.json({
      student: {
        id: student.id,
        name: student.name || student.student_name,
        student_code: student.student_code,
        belt: student.belt || student.rank || 'White Belt (Beginner)',
        status: student.status,
        monthly_fee: student.monthly_fee || 800,
        joining_date: student.joining_date
      },
      dojo,
      attendance: {
        total_sessions: totalSessions,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        excused: excusedCount,
        percentage: attendancePercentage,
        recent: attRecords.slice(0, 5)
      },
      fees: {
        total_paid: totalPaid,
        current_month: currentMonth,
        current_month_status: currentMonthPaid ? 'PAID' : 'PENDING',
        monthly_fee: student.monthly_fee || 800,
        recent_payments: payments.slice(0, 5)
      },
      upcoming_classes: upcomingClasses,
      announcements
    });
  } catch (err) {
    console.error('Student dashboard error:', err);
    res.status(500).json({ error: 'Failed to load student dashboard: ' + err.message });
  }
});

// -----------------------------------------------------------------------------
// GET /api/student/profile — Full Student Profile
// -----------------------------------------------------------------------------
router.get('/profile', (req, res) => {
  try {
    const student = getStudentForUser(req.user);
    res.json({ student });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student profile: ' + err.message });
  }
});

// -----------------------------------------------------------------------------
// PUT /api/student/profile — Update Contact Details
// -----------------------------------------------------------------------------
router.put('/profile', (req, res) => {
  const { phone, address, avatar, guardian_phone } = req.body;
  try {
    const student = getStudentForUser(req.user);

    // Update users
    db.prepare(`
      UPDATE users
      SET phone = coalesce(?, phone),
          avatar = coalesce(?, avatar),
          updated_at = datetime('now')
      WHERE id = ?
    `).run(phone || null, avatar || null, req.user.id);

    // Update student_profiles if exists
    db.prepare(`
      UPDATE student_profiles
      SET phone = coalesce(?, phone),
          address = coalesce(?, address),
          avatar = coalesce(?, avatar),
          guardian_phone = coalesce(?, guardian_phone),
          updated_at = datetime('now')
      WHERE user_id = ?
    `).run(phone || null, address || null, avatar || null, guardian_phone || null, req.user.id);

    // Update students table if exists
    db.prepare(`
      UPDATE students
      SET phone = coalesce(?, phone),
          address = coalesce(?, address),
          guardian_phone = coalesce(?, guardian_phone)
      WHERE email = ? OR student_code = ?
    `).run(phone || null, address || null, guardian_phone || null, req.user.email, student.student_code);

    res.json({ success: true, message: 'Profile details updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile: ' + err.message });
  }
});

// -----------------------------------------------------------------------------
// GET /api/student/attendance — Complete Attendance History (Read-only)
// -----------------------------------------------------------------------------
router.get('/attendance', (req, res) => {
  try {
    const student = getStudentForUser(req.user);

    const records = db.prepare(`
      SELECT ar.id, ar.attendance_status, ar.marked_at, ar.remarks,
             cs.class_date, cs.start_time, cs.end_time, cs.session_type, cs.title
      FROM attendance_records ar
      JOIN class_sessions cs ON ar.class_session_id = cs.id
      WHERE ar.student_id = ? OR ar.student_id = ?
      ORDER BY cs.class_date DESC
    `).all(student.id, student.user_id || 0);

    const total = records.length;
    const present = records.filter(r => r.attendance_status === 'PRESENT').length;
    const absent = records.filter(r => r.attendance_status === 'ABSENT').length;
    const late = records.filter(r => r.attendance_status === 'LATE').length;
    const excused = records.filter(r => r.attendance_status === 'EXCUSED' || r.attendance_status === 'LEAVE').length;
    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    res.json({
      records,
      summary: {
        total,
        present,
        absent,
        late,
        excused,
        percentage
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attendance history: ' + err.message });
  }
});

// -----------------------------------------------------------------------------
// GET /api/student/fees — Fee Records & Receipts (Read-only)
// -----------------------------------------------------------------------------
router.get('/fees', (req, res) => {
  try {
    const student = getStudentForUser(req.user);

    const payments = db.prepare(`
      SELECT * FROM fee_payments
      WHERE student_id = ? OR student_id = ?
      ORDER BY payment_date DESC
    `).all(student.id, student.user_id || 0);

    res.json({ payments, monthly_fee: student.monthly_fee || 800 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch fee records: ' + err.message });
  }
});

export default router;
