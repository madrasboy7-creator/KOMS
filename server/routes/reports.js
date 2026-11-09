import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../auth.js';
import { ensureSessionsForMonth, WEEKDAY_NAMES, parseDate } from '../scheduler.js';

const router = express.Router();
router.use(authMiddleware);

// Monthly Attendance Summary Report
router.get('/monthly', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const now = new Date();
  const year = req.query.year ? Number(req.query.year) : now.getFullYear();
  const month = req.query.month ? Number(req.query.month) : (now.getMonth() + 1);
  const policy = req.query.policy || 'standard';

  ensureSessionsForMonth(db, masterId, year, month);

  const formattedMonth = String(month).padStart(2, '0');
  const monthPrefix = `${year}-${formattedMonth}`;

  // Get all completed classes in this month
  const classesInMonth = db.prepare(`
    SELECT id, class_date, start_time, end_time, status 
    FROM class_sessions 
    WHERE master_id = ? 
      AND class_date LIKE ? 
      AND status != 'cancelled'
    ORDER BY class_date ASC
  `).all(masterId, `${monthPrefix}%`);

  const completedClasses = classesInMonth.filter(c => c.status === 'completed');

  // Query all students of this master
  const students = db.prepare(`
    SELECT id, student_name, student_code, rank, status, joining_date
    FROM students
    WHERE master_id = ?
    ORDER BY status ASC, student_code ASC
  `).all(masterId);

  // Query all attendance records for this master in this month
  const attendanceRows = db.prepare(`
    SELECT ar.student_id, ar.attendance_status, cs.class_date
    FROM attendance_records ar
    JOIN class_sessions cs ON ar.class_session_id = cs.id
    WHERE ar.master_id = ? 
      AND cs.class_date LIKE ?
      AND cs.status != 'cancelled'
  `).all(masterId, `${monthPrefix}%`);

  const studentAttMap = new Map();
  for (const row of attendanceRows) {
    if (!studentAttMap.has(row.student_id)) {
      studentAttMap.set(row.student_id, { present: 0, absent: 0, leave: 0 });
    }
    const stat = studentAttMap.get(row.student_id);
    if (row.attendance_status === 'PRESENT') stat.present++;
    else if (row.attendance_status === 'ABSENT') stat.absent++;
    else if (row.attendance_status === 'LEAVE') stat.leave++;
  }

  let dojoTotalPresent = 0;
  let dojoTotalAbsent = 0;
  let dojoTotalLeave = 0;

  const studentReports = students.map(st => {
    const counts = studentAttMap.get(st.id) || { present: 0, absent: 0, leave: 0 };
    const eligible = counts.present + counts.absent + counts.leave;

    dojoTotalPresent += counts.present;
    dojoTotalAbsent += counts.absent;
    dojoTotalLeave += counts.leave;

    let percentage = 0;
    if (eligible > 0) {
      if (policy === 'include_leave') {
        percentage = Math.round(((counts.present + counts.leave) / eligible) * 1000) / 10;
      } else if (policy === 'exclude_leave') {
        const net = counts.present + counts.absent;
        percentage = net > 0 ? Math.round((counts.present / net) * 1000) / 10 : 0;
      } else {
        percentage = Math.round((counts.present / eligible) * 1000) / 10;
      }
    }

    let grade = 'No Data';
    if (eligible > 0) {
      if (percentage >= 90) grade = 'Excellent (>=90%)';
      else if (percentage >= 75) grade = 'Good Standing (75-89%)';
      else grade = 'Needs Improvement (<75%)';
    }

    return {
      student_id: st.id,
      student_name: st.student_name,
      student_code: st.student_code,
      rank: st.rank,
      status: st.status,
      total_eligible: eligible,
      present_count: counts.present,
      absent_count: counts.absent,
      leave_count: counts.leave,
      attendance_percentage: percentage,
      grade
    };
  });

  const totalDojoEligible = dojoTotalPresent + dojoTotalAbsent + dojoTotalLeave;
  const dojoOverallPercentage = totalDojoEligible > 0 
    ? Math.round((dojoTotalPresent / totalDojoEligible) * 1000) / 10 
    : 0;

  res.json({
    year,
    month,
    monthPrefix,
    total_classes_scheduled: classesInMonth.length,
    total_classes_completed: completedClasses.length,
    dojo_summary: {
      total_students: students.length,
      active_students: students.filter(s => s.status === 'active').length,
      total_present: dojoTotalPresent,
      total_absent: dojoTotalAbsent,
      total_leave: dojoTotalLeave,
      overall_percentage: dojoOverallPercentage
    },
    students: studentReports
  });
});

// CSV Export for monthly reports
router.get('/export-csv', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const now = new Date();
  const year = req.query.year ? Number(req.query.year) : now.getFullYear();
  const month = req.query.month ? Number(req.query.month) : (now.getMonth() + 1);
  const formattedMonth = String(month).padStart(2, '0');
  const monthPrefix = `${year}-${formattedMonth}`;

  const students = db.prepare(`
    SELECT id, student_name, student_code, rank, status
    FROM students WHERE master_id = ? ORDER BY student_code ASC
  `).all(masterId);

  const attendanceRows = db.prepare(`
    SELECT ar.student_id, ar.attendance_status
    FROM attendance_records ar
    JOIN class_sessions cs ON ar.class_session_id = cs.id
    WHERE ar.master_id = ? AND cs.class_date LIKE ? AND cs.status != 'cancelled'
  `).all(masterId, `${monthPrefix}%`);

  const studentAttMap = new Map();
  for (const row of attendanceRows) {
    if (!studentAttMap.has(row.student_id)) {
      studentAttMap.set(row.student_id, { present: 0, absent: 0, leave: 0 });
    }
    const stat = studentAttMap.get(row.student_id);
    if (row.attendance_status === 'PRESENT') stat.present++;
    else if (row.attendance_status === 'ABSENT') stat.absent++;
    else if (row.attendance_status === 'LEAVE') stat.leave++;
  }

  let csv = 'Student Code,Student Name,Rank,Status,Eligible Classes,Present,Absent,Leave,Attendance %\n';

  for (const st of students) {
    const counts = studentAttMap.get(st.id) || { present: 0, absent: 0, leave: 0 };
    const eligible = counts.present + counts.absent + counts.leave;
    const pct = eligible > 0 ? ((counts.present / eligible) * 100).toFixed(1) : '0.0';
    csv += `"${st.student_code}","${st.student_name}","${st.rank}","${st.status}",${eligible},${counts.present},${counts.absent},${counts.leave},${pct}%\n`;
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="koms-attendance-${monthPrefix}.csv"`);
  res.send(csv);
});

export default router;

