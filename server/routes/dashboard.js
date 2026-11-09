import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../auth.js';
import { 
  ensureUpcomingSessions, 
  WEEKDAY_NAMES, 
  formatDate, 
  parseDate 
} from '../scheduler.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/stats', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const todayStr = req.query.date || formatDate(new Date());

  // Ensure sessions exist
  ensureUpcomingSessions(db, masterId, 1);

  const now = new Date();
  const targetMonthPrefix = req.query.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // 1. Total Active Students
  const activeStudents = db.prepare(`
    SELECT id, student_name, student_code, coalesce(monthly_fee, 1000) as fee
    FROM students 
    WHERE master_id = ? AND status = 'active'
  `).all(masterId);

  const totalActiveStudents = activeStudents.length;

  // 2. New Registrations (last 30 days or pending requests)
  const newRegistrationsCount = db.prepare(`
    SELECT COUNT(*) as count FROM student_registration_requests
    WHERE master_id = ? AND status = 'PENDING'
  `).get(masterId)?.count || 0;

  // 3. Today's Scheduled Classes
  const todayClasses = db.prepare(`
    SELECT * FROM class_sessions 
    WHERE master_id = ? AND class_date = ? AND status != 'cancelled'
    ORDER BY start_time ASC
  `).all(masterId, todayStr);

  // 4 & 5. Today's Present & Absent Students
  const todayAttendance = db.prepare(`
    SELECT 
      SUM(CASE WHEN ar.attendance_status = 'PRESENT' THEN 1 ELSE 0 END) as present_count,
      SUM(CASE WHEN ar.attendance_status = 'ABSENT' THEN 1 ELSE 0 END) as absent_count
    FROM attendance_records ar
    JOIN class_sessions cs ON ar.class_session_id = cs.id
    WHERE ar.master_id = ? AND cs.class_date = ?
  `).get(masterId, todayStr);

  const todayPresentStudents = todayAttendance?.present_count || 0;
  const todayAbsentStudents = todayAttendance?.absent_count || 0;

  // 6. Current Month's Expected Fees
  const expectedMonthlyFees = activeStudents.reduce((acc, s) => acc + s.fee, 0);

  // 7. Current Month's Collected Revenue
  const feePaymentsRow = db.prepare(`
    SELECT coalesce(sum(amount_paid), 0) as collected
    FROM fee_payments
    WHERE master_id = ? AND billing_month = ?
  `).get(masterId, targetMonthPrefix);

  const collectedRevenue = feePaymentsRow?.collected || 0;

  // Approved Waivers
  const waiversRow = db.prepare(`
    SELECT coalesce(sum(waiver_amount), 0) as waived
    FROM fee_waivers
    WHERE master_id = ? AND billing_month = ?
  `).get(masterId, targetMonthPrefix);

  const waivedAmount = waiversRow?.waived || 0;

  // 8. Outstanding Fees
  const outstandingFees = Math.max(0, expectedMonthlyFees - collectedRevenue - waivedAmount);

  // 9. Monthly Attendance Percentage
  const attendanceMonthly = db.prepare(`
    SELECT 
      SUM(CASE WHEN ar.attendance_status = 'PRESENT' THEN 1 ELSE 0 END) as present_count,
      SUM(CASE WHEN ar.attendance_status = 'ABSENT' THEN 1 ELSE 0 END) as absent_count,
      SUM(CASE WHEN ar.attendance_status = 'LEAVE' THEN 1 ELSE 0 END) as leave_count,
      COUNT(ar.id) as total_records
    FROM attendance_records ar
    JOIN class_sessions cs ON ar.class_session_id = cs.id
    WHERE ar.master_id = ? 
      AND cs.class_date LIKE ? 
      AND cs.status != 'cancelled'
  `).get(masterId, `${targetMonthPrefix}%`);

  const presentCount = attendanceMonthly?.present_count || 0;
  const totalRecords = (attendanceMonthly?.present_count || 0) + (attendanceMonthly?.absent_count || 0) + (attendanceMonthly?.leave_count || 0);
  const monthlyAttendancePercentage = totalRecords > 0 
    ? Math.round((presentCount / totalRecords) * 1000) / 10 
    : 0;

  // 10. Recent Activities
  const recentActivities = db.prepare(`
    SELECT 
      cs.id as session_id,
      cs.class_date,
      cs.start_time,
      cs.end_time,
      cs.status,
      COUNT(ar.id) as marked_count,
      SUM(CASE WHEN ar.attendance_status = 'PRESENT' THEN 1 ELSE 0 END) as present_count,
      SUM(CASE WHEN ar.attendance_status = 'ABSENT' THEN 1 ELSE 0 END) as absent_count,
      MAX(ar.updated_at) as last_updated
    FROM class_sessions cs
    JOIN attendance_records ar ON cs.id = ar.class_session_id
    WHERE cs.master_id = ?
    GROUP BY cs.id
    ORDER BY cs.class_date DESC, last_updated DESC
    LIMIT 5
  `).all(masterId).map((a) => ({
    type: 'ATTENDANCE_MARKED',
    description: `Attendance saved for class on ${a.class_date} (${a.present_count} Present, ${a.absent_count} Absent)`,
    date: a.class_date,
    time: a.last_updated,
  }));

  // 11. Upcoming Classes
  const upcomingClasses = db.prepare(`
    SELECT * FROM class_sessions 
    WHERE master_id = ? AND class_date >= ? AND status != 'cancelled'
    ORDER BY class_date ASC, start_time ASC
    LIMIT 5
  `).all(masterId, todayStr);

  // 12. Recent Announcements
  const recentAnnouncements = db.prepare(`
    SELECT * FROM announcements
    WHERE master_id = ? AND status = 'PUBLISHED'
    ORDER BY publish_date DESC
    LIMIT 3
  `).all(masterId);

  res.json({
    filter_date: todayStr,
    filter_month: targetMonthPrefix,
    total_active_students: totalActiveStudents,
    new_registrations: newRegistrationsCount,
    today_scheduled_classes_count: todayClasses.length,
    today_scheduled_classes: todayClasses,
    today_present_students: todayPresentStudents,
    today_absent_students: todayAbsentStudents,
    current_month_expected_fees: expectedMonthlyFees,
    current_month_collected_revenue: collectedRevenue,
    current_month_outstanding_fees: outstandingFees,
    monthly_attendance_percentage: monthlyAttendancePercentage,
    recent_activities: recentActivities,
    upcoming_classes: upcomingClasses,
    recent_announcements: recentAnnouncements,
  });
});

export default router;
