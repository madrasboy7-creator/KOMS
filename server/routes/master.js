import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../auth.js';
import { 
  WEEKDAY_NAMES, 
  parseDate, 
  formatDate, 
  ensureSessionsForMonth, 
  ensureUpcomingSessions,
  changeWeeklySchedule 
} from '../scheduler.js';

const router = express.Router();
router.use(authMiddleware);

// Helper to format 24h '18:30' to 12h '6:30 PM'
function formatTime12(t) {
  if (!t) return '—';
  const [hh, mm] = t.split(':').map(Number);
  const period = hh >= 12 ? 'PM' : 'AM';
  const hour12 = hh % 12 || 12;
  return `${hour12}:${String(mm).padStart(2, '0')} ${period}`;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/* ==========================================================
   PART 10: ATTENDANCE HISTORY APIS (FOUR-LEVEL HIERARCHY)
   ========================================================== */

// LEVEL 1: GET /api/master/attendance/history/years
router.get('/attendance/history/years', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const todayStr = formatDate(new Date());

  // Query distinct years from class sessions
  const yearsRows = db.prepare(`
    SELECT DISTINCT CAST(substr(class_date, 1, 4) AS INTEGER) as year
    FROM class_sessions
    WHERE master_id = ?
    ORDER BY year DESC
  `).all(masterId);

  // If no years found, default to 2026
  const yearsList = yearsRows.length > 0 ? yearsRows.map(r => r.year) : [2026];

  const results = yearsList.map(y => {
    const sessions = db.prepare(`
      SELECT 
        cs.id,
        cs.class_date,
        cs.status,
        (SELECT COUNT(*) FROM attendance_records WHERE class_session_id = cs.id) as total_marked
      FROM class_sessions cs
      WHERE cs.master_id = ? AND cs.class_date LIKE ?
    `).all(masterId, `${y}-%`);

    const totalSessions = sessions.length;
    let completedSessions = 0;
    let pendingSessions = 0;
    let upcomingSessions = 0;

    const monthsSet = new Set();
    for (const s of sessions) {
      monthsSet.add(s.class_date.slice(5, 7));
      if (s.status === 'cancelled') continue;
      if (s.status === 'completed' || s.total_marked > 0) {
        completedSessions++;
      } else if (s.class_date <= todayStr) {
        pendingSessions++;
      } else {
        upcomingSessions++;
      }
    }

    return {
      year: y,
      total_months: monthsSet.size > 0 ? monthsSet.size : 12,
      total_sessions: totalSessions,
      completed_sessions: completedSessions,
      pending_sessions: pendingSessions,
      upcoming_sessions: upcomingSessions
    };
  });

  res.json({ years: results });
});

// LEVEL 2: GET /api/master/attendance/history/months?year=2026
router.get('/attendance/history/months', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const year = req.query.year ? Number(req.query.year) : 2026;
  const todayStr = formatDate(new Date());

  const months = [];

  for (let m = 1; m <= 12; m++) {
    const monthCode = String(m).padStart(2, '0');
    const monthPrefix = `${year}-${monthCode}`;

    // Ensure sessions exist for this month
    ensureSessionsForMonth(db, masterId, year, m);

    const sessions = db.prepare(`
      SELECT 
        cs.id, 
        cs.class_date, 
        cs.status,
        (SELECT COUNT(*) FROM attendance_records WHERE class_session_id = cs.id) as total_marked
      FROM class_sessions cs
      WHERE cs.master_id = ? AND cs.class_date LIKE ?
    `).all(masterId, `${monthPrefix}-%`);

    const totalScheduled = sessions.filter(s => s.status !== 'cancelled').length;
    let completed = 0;
    let pending = 0;
    let upcoming = 0;

    for (const s of sessions) {
      if (s.status === 'cancelled') continue;
      if (s.status === 'completed' || s.total_marked > 0) {
        completed++;
      } else if (s.class_date <= todayStr) {
        pending++;
      } else {
        upcoming++;
      }
    }

    months.push({
      month: m,
      month_code: monthCode,
      month_name: MONTH_NAMES[m - 1],
      year,
      total_scheduled: totalScheduled,
      completed,
      pending,
      upcoming
    });
  }

  res.json({ year, months });
});

// LEVEL 3: GET /api/master/attendance/history/sessions?year=2026&month=11
router.get('/attendance/history/sessions', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const year = req.query.year ? Number(req.query.year) : 2026;
  const month = req.query.month ? Number(req.query.month) : 11;
  const monthCode = String(month).padStart(2, '0');
  const monthPrefix = `${year}-${monthCode}`;
  const todayStr = formatDate(new Date());

  // Ensure sessions for this month exist
  ensureSessionsForMonth(db, masterId, year, month);

  const rawSessions = db.prepare(`
    SELECT 
      cs.*,
      (SELECT COUNT(*) FROM students 
       WHERE master_id = cs.master_id 
         AND joining_date <= cs.class_date 
         AND (status = 'active' OR (status = 'paused' AND (paused_date IS NULL OR paused_date >= cs.class_date)))
      ) as total_eligible_students,
      (SELECT COUNT(*) FROM attendance_records WHERE class_session_id = cs.id AND attendance_status = 'PRESENT') as present_count,
      (SELECT COUNT(*) FROM attendance_records WHERE class_session_id = cs.id AND attendance_status = 'ABSENT') as absent_count,
      (SELECT COUNT(*) FROM attendance_records WHERE class_session_id = cs.id AND attendance_status = 'LEAVE') as leave_count,
      (SELECT COUNT(*) FROM attendance_records WHERE class_session_id = cs.id) as total_marked
    FROM class_sessions cs
    WHERE cs.master_id = ? AND cs.class_date LIKE ?
    ORDER BY cs.class_date ASC, cs.start_time ASC
  `).all(masterId, `${monthPrefix}-%`);

  let classCounter = 0;
  const sessions = rawSessions.map((s) => {
    const isCancelled = s.status === 'cancelled';
    if (!isCancelled) {
      classCounter++;
    }

    const d = parseDate(s.class_date);
    const dayOfWeek = d.getDay();
    const dayName = WEEKDAY_NAMES[dayOfWeek];
    const isPastOrToday = s.class_date <= todayStr;

    // Calculate unmarked count
    const totalEligible = s.total_eligible_students || 0;
    const unmarked = Math.max(0, totalEligible - s.total_marked);

    // Class status: SCHEDULED, CONDUCTED, CANCELLED
    let classStatus = 'SCHEDULED';
    if (isCancelled) {
      classStatus = 'CANCELLED';
    } else if (isPastOrToday || s.total_marked > 0) {
      classStatus = 'CONDUCTED';
    }

    // Attendance completion status: NOT STARTED, IN PROGRESS, FINALIZED
    let attendanceStatus = 'NOT STARTED';
    if (isCancelled) {
      attendanceStatus = 'NOT APPLICABLE';
    } else if (s.total_marked > 0 && unmarked === 0) {
      attendanceStatus = 'FINALIZED';
    } else if (s.total_marked > 0 && unmarked > 0) {
      attendanceStatus = 'IN PROGRESS';
    } else if (!isPastOrToday) {
      attendanceStatus = 'UPCOMING';
    }

    return {
      id: s.id,
      class_number: isCancelled ? null : classCounter,
      class_number_label: isCancelled ? 'Cancelled' : `Class ${String(classCounter).padStart(2, '0')}`,
      class_date: s.class_date,
      day_name: dayName,
      start_time: s.start_time,
      end_time: s.end_time,
      timing_display: `${formatTime12(s.start_time)} – ${formatTime12(s.end_time)}`,
      total_eligible_students: totalEligible,
      present_count: s.present_count || 0,
      absent_count: s.absent_count || 0,
      leave_count: s.leave_count || 0,
      not_marked_count: unmarked,
      total_marked: s.total_marked || 0,
      class_status: classStatus,
      attendance_status: attendanceStatus,
      is_completed: attendanceStatus === 'FINALIZED' || s.status === 'completed',
      is_cancelled: isCancelled
    };
  });

  res.json({
    year,
    month,
    month_name: MONTH_NAMES[month - 1],
    total_classes: classCounter,
    sessions
  });
});

// LEVEL 4: GET /api/master/attendance/history/sessions/:id/summary
router.get('/attendance/history/sessions/:id/summary', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const sessionId = Number(req.params.id);

  const session = db.prepare(`
    SELECT * FROM class_sessions WHERE id = ?
  `).get(sessionId);

  if (!session || session.master_id !== masterId) {
    return res.status(404).json({ error: 'Class session not found' });
  }

  const d = parseDate(session.class_date);
  const dayName = WEEKDAY_NAMES[d.getDay()];

  // Query eligible students on this date
  const eligibleStudents = db.prepare(`
    SELECT COUNT(*) as count FROM students 
    WHERE master_id = ? 
      AND joining_date <= ?
      AND (status = 'active' OR (status = 'paused' AND (paused_date IS NULL OR paused_date >= ?)))
  `).get(masterId, session.class_date, session.class_date).count;

  // Counts from attendance_records
  const attCounts = db.prepare(`
    SELECT 
      COUNT(*) as total_marked,
      SUM(CASE WHEN attendance_status = 'PRESENT' THEN 1 ELSE 0 END) as present_count,
      SUM(CASE WHEN attendance_status = 'ABSENT' THEN 1 ELSE 0 END) as absent_count,
      SUM(CASE WHEN attendance_status = 'LEAVE' THEN 1 ELSE 0 END) as leave_count
    FROM attendance_records
    WHERE class_session_id = ?
  `).get(sessionId);

  const present = attCounts.present_count || 0;
  const absent = attCounts.absent_count || 0;
  const leave = attCounts.leave_count || 0;
  const notMarked = Math.max(0, eligibleStudents - (attCounts.total_marked || 0));

  res.json({
    session: {
      ...session,
      day_name: dayName,
      timing_display: `${formatTime12(session.start_time)} – ${formatTime12(session.end_time)}`
    },
    summary: {
      total_students: eligibleStudents,
      present_count: present,
      absent_count: absent,
      leave_count: leave,
      not_marked_count: notMarked,
      attendance_rate: (present + absent + leave) > 0 ? Math.round((present / (present + absent + leave)) * 100) : 0
    }
  });
});

// LEVEL 4: GET /api/master/attendance/history/sessions/:id/students
router.get('/attendance/history/sessions/:id/students', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const sessionId = Number(req.params.id);

  const session = db.prepare(`
    SELECT * FROM class_sessions WHERE id = ?
  `).get(sessionId);

  if (!session || session.master_id !== masterId) {
    return res.status(404).json({ error: 'Class session not found' });
  }

  const d = parseDate(session.class_date);
  const dayName = WEEKDAY_NAMES[d.getDay()];

  // Load eligible students for this class date
  const students = db.prepare(`
    SELECT id, student_name, student_code, rank, status, joining_date, paused_date
    FROM students
    WHERE master_id = ? 
      AND joining_date <= ?
      AND (
        status = 'active' 
        OR (status IN ('paused', 'discontinued') AND (paused_date IS NULL OR paused_date >= ?))
        OR id IN (SELECT student_id FROM attendance_records WHERE class_session_id = ?)
      )
    ORDER BY student_code ASC
  `).all(masterId, session.class_date, session.class_date, sessionId);

  // Load attendance records
  const records = db.prepare(`
    SELECT 
      ar.id as record_id, 
      ar.student_id, 
      ar.attendance_status, 
      ar.marked_at, 
      ar.updated_at,
      (SELECT COUNT(*) FROM attendance_audit_logs WHERE attendance_record_id = ar.id) as audit_count
    FROM attendance_records ar
    WHERE ar.class_session_id = ?
  `).all(sessionId);

  const recordMap = new Map();
  for (const r of records) {
    recordMap.set(r.student_id, r);
  }

  let presentCount = 0;
  let absentCount = 0;
  let leaveCount = 0;
  let notMarkedCount = 0;

  const studentList = students.map((s, idx) => {
    const existing = recordMap.get(s.id);
    const attStatus = existing ? existing.attendance_status : 'NOT MARKED';

    if (attStatus === 'PRESENT') presentCount++;
    else if (attStatus === 'ABSENT') absentCount++;
    else if (attStatus === 'LEAVE') leaveCount++;
    else notMarkedCount++;

    return {
      s_no: idx + 1,
      student_id: s.id,
      student_name: s.student_name,
      student_code: s.student_code,
      rank: s.rank || 'White Belt',
      enrollment_status: s.status,
      attendance_status: attStatus,
      record_id: existing ? existing.record_id : null,
      marked_at: existing ? existing.marked_at : null,
      has_audit: (existing?.audit_count || 0) > 0
    };
  });

  res.json({
    session: {
      ...session,
      day_name: dayName,
      timing_display: `${formatTime12(session.start_time)} – ${formatTime12(session.end_time)}`
    },
    summary: {
      total_students: students.length,
      present_count: presentCount,
      absent_count: absentCount,
      leave_count: leaveCount,
      not_marked_count: notMarkedCount,
      attendance_rate: (presentCount + absentCount + leaveCount) > 0 
        ? Math.round((presentCount / (presentCount + absentCount + leaveCount)) * 100) 
        : 0
    },
    students: studentList
  });
});

/* ==========================================================
   PART 7 & 10: INDIVIDUAL STUDENT ATTENDANCE HISTORY
   ========================================================== */

// GET /api/master/students/:student_id/attendance-history
router.get('/students/:student_id/attendance-history', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const studentId = Number(req.params.student_id);
  const { year, month } = req.query;

  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
  if (!student || student.master_id !== masterId) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const todayStr = formatDate(new Date());

  let query = `
    SELECT 
      cs.id as class_session_id,
      cs.class_date,
      cs.start_time,
      cs.end_time,
      cs.status as session_status,
      ar.id as record_id,
      ar.attendance_status,
      ar.marked_at,
      ar.updated_at,
      (SELECT COUNT(*) FROM attendance_audit_logs WHERE attendance_record_id = ar.id) as audit_count
    FROM class_sessions cs
    LEFT JOIN attendance_records ar 
      ON cs.id = ar.class_session_id AND ar.student_id = ?
    WHERE cs.master_id = ?
      AND cs.status != 'cancelled'
      AND (cs.class_date <= ? OR ar.id IS NOT NULL)
  `;
  const params = [studentId, masterId, todayStr];

  if (year && month) {
    const formattedMonth = String(month).padStart(2, '0');
    query += ` AND cs.class_date LIKE ?`;
    params.push(`${year}-${formattedMonth}%`);
  } else if (year) {
    query += ` AND cs.class_date LIKE ?`;
    params.push(`${year}%`);
  }

  query += ` ORDER BY cs.class_date DESC, cs.start_time DESC`;

  const rows = db.prepare(query).all(...params);

  // Group by month
  const monthGroups = new Map();
  for (const r of rows) {
    const monthKey = r.class_date.slice(0, 7);
    if (!monthGroups.has(monthKey)) {
      const [yStr, mStr] = monthKey.split('-');
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10);

      const totalScheduled = db.prepare(`
        SELECT COUNT(*) as count FROM class_sessions 
        WHERE master_id = ? AND class_date LIKE ? AND status != 'cancelled'
      `).get(masterId, `${monthKey}%`).count;

      monthGroups.set(monthKey, {
        month_key: monthKey,
        month_name: `${MONTH_NAMES[m - 1]} ${y}`,
        year: y,
        month: m,
        total_scheduled_in_month: totalScheduled,
        attended_count: 0,
        absent_count: 0,
        leave_count: 0,
        unmarked_count: 0,
        dates: []
      });
    }

    const group = monthGroups.get(monthKey);
    const d = parseDate(r.class_date);
    const dayOfWeek = d.getDay();
    const status = r.attendance_status || 'NOT MARKED';

    if (status === 'PRESENT') group.attended_count++;
    else if (status === 'ABSENT') group.absent_count++;
    else if (status === 'LEAVE') group.leave_count++;
    else group.unmarked_count++;

    group.dates.push({
      session_id: r.class_session_id,
      record_id: r.record_id,
      class_date: r.class_date,
      day_of_month: d.getDate(),
      day_name: WEEKDAY_NAMES[dayOfWeek],
      timing: `${formatTime12(r.start_time)} – ${formatTime12(r.end_time)}`,
      status,
      marked_at: r.marked_at,
      has_audit: r.audit_count > 0
    });
  }

  const monthlyRecords = Array.from(monthGroups.values()).map(m => {
    const denominator = m.total_scheduled_in_month > 0 ? m.total_scheduled_in_month : (m.attended_count + m.absent_count + m.leave_count);
    const pct = denominator > 0 
      ? Math.round((m.attended_count / denominator) * 1000) / 10 
      : 0;

    return {
      ...m,
      attendance_percentage: pct,
      formula_display: `${m.attended_count} of ${m.total_scheduled_in_month} classes attended (${pct}%)`
    };
  });

  // Calculate cumulative stats
  let totalAttended = 0;
  let totalAbsent = 0;
  let totalLeave = 0;
  let totalScheduled = 0;

  for (const m of monthlyRecords) {
    totalAttended += m.attended_count;
    totalAbsent += m.absent_count;
    totalLeave += m.leave_count;
    totalScheduled += m.total_scheduled_in_month;
  }

  const overallPct = totalScheduled > 0 
    ? Math.round((totalAttended / totalScheduled) * 1000) / 10 
    : 0;

  res.json({
    student,
    metrics: {
      total_scheduled_classes: totalScheduled,
      total_attended_classes: totalAttended,
      total_absent: totalAbsent,
      total_leave: totalLeave,
      overall_attendance_percentage: overallPct
    },
    monthly_records: monthlyRecords
  });
});

/* ==========================================================
   SCHEDULE & DAILY ATTENDANCE COMPATIBILITY APIS
   ========================================================== */

// GET /api/master/schedule/weekly
router.get('/schedule/weekly', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const schedule = db.prepare(`
    SELECT * FROM weekly_schedules 
    WHERE master_id = ? AND is_active = 1
    ORDER BY id DESC LIMIT 1
  `).get(masterId);

  if (!schedule) {
    return res.json({ active: false, schedule: null });
  }

  const days = db.prepare(`
    SELECT weekday FROM schedule_days WHERE weekly_schedule_id = ? ORDER BY weekday ASC
  `).all(schedule.id).map(r => r.weekday);

  res.json({
    active: true,
    schedule: {
      ...schedule,
      days,
      timing_display: `${formatTime12(schedule.start_time)} – ${formatTime12(schedule.end_time)}`
    }
  });
});

// POST & PUT /api/master/schedule/weekly
const handleUpdateWeeklySchedule = (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const { effective_from, start_time, end_time, days, replaceFutureUncompleted = true } = req.body;

  if (!effective_from || !start_time || !end_time || !Array.isArray(days) || days.length === 0) {
    return res.status(400).json({ error: 'effective_from, start_time, end_time, and days array are required' });
  }

  try {
    const result = changeWeeklySchedule(db, masterId, {
      effective_from,
      start_time,
      end_time,
      days: days.map(Number),
      replaceFutureUncompleted: Boolean(replaceFutureUncompleted)
    });

    res.json({ success: true, message: 'Schedule updated successfully', ...result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update schedule: ' + err.message });
  }
};

router.post('/schedule/weekly', handleUpdateWeeklySchedule);
router.put('/schedule/weekly', handleUpdateWeeklySchedule);

// GET /api/master/schedule/sessions
router.get('/schedule/sessions', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const { from, to, month } = req.query;

  let startDate = from;
  let endDate = to;

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split('-').map(Number);
    ensureSessionsForMonth(db, masterId, y, m);
    startDate = `${month}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    endDate = `${month}-${String(lastDay).padStart(2, '0')}`;
  } else if (!startDate && !endDate) {
    ensureUpcomingSessions(db, masterId, 2);
  }

  let query = `
    SELECT cs.*,
      (SELECT COUNT(*) FROM students WHERE master_id = cs.master_id AND status = 'active') as active_students_count,
      (SELECT COUNT(*) FROM attendance_records WHERE class_session_id = cs.id AND attendance_status = 'PRESENT') as present_count,
      (SELECT COUNT(*) FROM attendance_records WHERE class_session_id = cs.id AND attendance_status = 'ABSENT') as absent_count,
      (SELECT COUNT(*) FROM attendance_records WHERE class_session_id = cs.id AND attendance_status = 'LEAVE') as leave_count,
      (SELECT COUNT(*) FROM attendance_records WHERE class_session_id = cs.id) as total_marked
    FROM class_sessions cs
    WHERE cs.master_id = ?
  `;
  const params = [masterId];

  if (startDate) {
    query += ` AND cs.class_date >= ?`;
    params.push(startDate);
  }
  if (endDate) {
    query += ` AND cs.class_date <= ?`;
    params.push(endDate);
  }

  query += ` ORDER BY cs.class_date ASC, cs.start_time ASC`;

  const sessions = db.prepare(query).all(...params).map(s => {
    const d = parseDate(s.class_date);
    return {
      ...s,
      day_name: WEEKDAY_NAMES[d.getDay()],
      timing_display: `${formatTime12(s.start_time)} – ${formatTime12(s.end_time)}`
    };
  });

  res.json({ sessions });
});

// GET /api/master/attendance/sessions
router.get('/attendance/sessions', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  ensureUpcomingSessions(db, masterId, 1);

  const sessions = db.prepare(`
    SELECT cs.*,
      (SELECT COUNT(*) FROM students WHERE master_id = cs.master_id AND status = 'active') as active_students_count,
      (SELECT COUNT(*) FROM attendance_records WHERE class_session_id = cs.id AND attendance_status = 'PRESENT') as present_count,
      (SELECT COUNT(*) FROM attendance_records WHERE class_session_id = cs.id AND attendance_status = 'ABSENT') as absent_count,
      (SELECT COUNT(*) FROM attendance_records WHERE class_session_id = cs.id AND attendance_status = 'LEAVE') as leave_count,
      (SELECT COUNT(*) FROM attendance_records WHERE class_session_id = cs.id) as total_marked
    FROM class_sessions cs
    WHERE cs.master_id = ?
    ORDER BY cs.class_date DESC, cs.start_time DESC
    LIMIT 30
  `).all(masterId).map(s => {
    const d = parseDate(s.class_date);
    return {
      ...s,
      day_name: WEEKDAY_NAMES[d.getDay()],
      timing_display: `${formatTime12(s.start_time)} – ${formatTime12(s.end_time)}`
    };
  });

  res.json({ sessions });
});

// GET /api/master/attendance/sessions/:id
router.get('/attendance/sessions/:id', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const sessionId = Number(req.params.id);

  const session = db.prepare('SELECT * FROM class_sessions WHERE id = ?').get(sessionId);
  if (!session || session.master_id !== masterId) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const d = parseDate(session.class_date);
  res.json({
    session: {
      ...session,
      day_name: WEEKDAY_NAMES[d.getDay()],
      timing_display: `${formatTime12(session.start_time)} – ${formatTime12(session.end_time)}`
    }
  });
});

// GET /api/master/attendance/sessions/:id/students
router.get('/attendance/sessions/:id/students', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const sessionId = Number(req.params.id);

  const session = db.prepare('SELECT * FROM class_sessions WHERE id = ?').get(sessionId);
  if (!session || session.master_id !== masterId) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const students = db.prepare(`
    SELECT id, student_name, student_code, rank, status
    FROM students
    WHERE master_id = ?
      AND (status = 'active' OR id IN (SELECT student_id FROM attendance_records WHERE class_session_id = ?))
    ORDER BY student_code ASC
  `).all(masterId, sessionId);

  const records = db.prepare(`
    SELECT id as record_id, student_id, attendance_status, marked_at, updated_at
    FROM attendance_records
    WHERE class_session_id = ?
  `).all(sessionId);

  const recordMap = new Map();
  for (const r of records) recordMap.set(r.student_id, r);

  const roster = students.map((s, idx) => {
    const existing = recordMap.get(s.id);
    return {
      s_no: idx + 1,
      id: s.id,
      student_id: s.id,
      student_name: s.student_name,
      student_code: s.student_code,
      rank: s.rank || 'White Belt',
      status: s.status,
      attendance_status: existing ? existing.attendance_status : 'NOT MARKED',
      record_id: existing ? existing.record_id : null,
      marked_at: existing ? existing.marked_at : null
    };
  });

  res.json({ session, roster });
});

// POST /api/master/attendance/sessions/:id/save
router.post('/attendance/sessions/:id/save', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const sessionId = Number(req.params.id);
  const { records, reason } = req.body;

  if (!Array.isArray(records)) {
    return res.status(400).json({ error: 'records array is required' });
  }

  const session = db.prepare('SELECT * FROM class_sessions WHERE id = ?').get(sessionId);
  if (!session || session.master_id !== masterId) {
    return res.status(404).json({ error: 'Session not found' });
  }

  let inTx = false;
  try {
    db.exec('BEGIN IMMEDIATE;');
    inTx = true;

    const findExisting = db.prepare('SELECT id, attendance_status FROM attendance_records WHERE class_session_id = ? AND student_id = ?');
    const upsertStmt = db.prepare(`
      INSERT INTO attendance_records 
        (master_id, class_session_id, student_id, attendance_status, marked_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      ON CONFLICT(class_session_id, student_id) 
      DO UPDATE SET attendance_status = excluded.attendance_status, updated_at = datetime('now')
    `);
    const deleteStmt = db.prepare('DELETE FROM attendance_records WHERE class_session_id = ? AND student_id = ?');
    const auditStmt = db.prepare(`
      INSERT INTO attendance_audit_logs 
        (attendance_record_id, old_status, new_status, reason, modified_by)
      VALUES (?, ?, ?, ?, ?)
    `);

    let present = 0, absent = 0, leave = 0, unmarked = 0;

    for (const r of records) {
      const studentId = Number(r.student_id);
      const status = (r.status || r.attendance_status || 'NOT MARKED').toUpperCase();
      const existing = findExisting.get(sessionId, studentId);

      if (status === 'NOT MARKED') {
        unmarked++;
        if (existing) deleteStmt.run(sessionId, studentId);
      } else if (['PRESENT', 'ABSENT', 'LEAVE'].includes(status)) {
        if (status === 'PRESENT') present++;
        else if (status === 'ABSENT') absent++;
        else if (status === 'LEAVE') leave++;

        const upsertRes = upsertStmt.run(masterId, sessionId, studentId, status);
        const recordId = existing ? existing.id : Number(upsertRes.lastInsertRowid);

        if (existing && existing.attendance_status !== status && reason) {
          auditStmt.run(recordId, existing.attendance_status, status, reason, req.master.id);
        }
      }
    }

    db.prepare("UPDATE class_sessions SET status = 'completed' WHERE id = ?").run(sessionId);

    db.exec('COMMIT;');
    inTx = false;

    res.json({
      success: true,
      message: 'Attendance saved successfully',
      summary: { present_count: present, absent_count: absent, leave_count: leave, unmarked_count: unmarked }
    });
  } catch (err) {
    if (inTx) {
      try { db.exec('ROLLBACK;'); } catch (e) {}
    }
    res.status(500).json({ error: 'Failed to save attendance: ' + err.message });
  }
});

// PUT /api/master/attendance/records/:id
router.put('/attendance/records/:id', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const recordId = Number(req.params.id);
  const { attendance_status, reason } = req.body;

  if (!attendance_status || !reason) {
    return res.status(400).json({ error: 'attendance_status and reason are required' });
  }

  const record = db.prepare('SELECT * FROM attendance_records WHERE id = ?').get(recordId);
  if (!record || record.master_id !== masterId) {
    return res.status(404).json({ error: 'Attendance record not found' });
  }

  db.exec('BEGIN IMMEDIATE;');
  try {
    const oldStatus = record.attendance_status;
    const newStatus = attendance_status.toUpperCase();

    db.prepare(`
      INSERT INTO attendance_audit_logs 
        (attendance_record_id, old_status, new_status, reason, modified_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(recordId, oldStatus, newStatus, reason.trim(), req.master.id);

    db.prepare(`
      UPDATE attendance_records 
      SET attendance_status = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(newStatus, recordId);

    db.exec('COMMIT;');
    res.json({ success: true, message: 'Record updated with audit log', oldStatus, newStatus });
  } catch (err) {
    db.exec('ROLLBACK;');
    res.status(500).json({ error: 'Failed to update record: ' + err.message });
  }
});

// GET /api/master/attendance/records/:id/audit
router.get('/attendance/records/:id/audit', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const recordId = Number(req.params.id);

  const logs = db.prepare(`
    SELECT al.*, m.name as modified_by_name
    FROM attendance_audit_logs al
    JOIN attendance_records ar ON al.attendance_record_id = ar.id
    LEFT JOIN masters m ON al.modified_by = m.id
    WHERE ar.id = ? AND ar.master_id = ?
    ORDER BY al.modified_at DESC
  `).all(recordId, masterId);

  res.json({ audit_logs: logs });
});

/* ==========================================================
   MASTER PROFILE & SETTINGS APIS
   ========================================================== */

// Get Master Profile & Settings
router.get('/profile', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;

  const master = db.prepare('SELECT id, name, email, dojo_name, created_at FROM masters WHERE id = ?').get(masterId);
  if (!master) {
    return res.status(404).json({ error: 'Master not found.' });
  }

  // Ensure master profile row exists
  db.prepare(`
    INSERT OR IGNORE INTO master_profiles (master_id, phone, bio, address, dojo_info)
    VALUES (?, '+91 98401 23456', 'Chief Instructor & Dojo Master', 'Mudichur Road, Chennai, Tamil Nadu', 'MASS DRAGON DOJO — Ranga Nagar Branch')
  `).run(masterId);

  const profile = db.prepare('SELECT * FROM master_profiles WHERE master_id = ?').get(masterId);

  // Student counts & activity history
  const activeStudents = db.prepare('SELECT COUNT(*) as count FROM students WHERE master_id = ? AND status = "active"').get(masterId).count;
  const recentSessions = db.prepare(`
    SELECT class_date, start_time, end_time, status 
    FROM class_sessions 
    WHERE master_id = ? 
    ORDER BY class_date DESC LIMIT 5
  `).all(masterId);

  // Also fetch Dojo record linked to this master
  const dojoRow = db.prepare('SELECT * FROM dojos WHERE master_id = ? OR name = ?').get(masterId, master.dojo_name);

  res.json({
    master: {
      ...master,
      phone: profile?.phone || '+91 98401 23456',
      bio: profile?.bio || '5th Dan Black Belt • Chief Instructor',
      address: profile?.address || 'Mudichur, Chennai',
      dojo_info: profile?.dojo_info || 'MASS DRAGON DOJO — Ranga Nagar Branch',
      rank: dojoRow?.instructor_rank || '5th Dan Black Belt',
      experience: dojoRow?.instructor_experience || '16+ Years',
      qualifications: dojoRow?.instructor_qualifications || 'Certified National Karate Referee',
      achievements: dojoRow?.instructor_achievements || '',
      avatar: dojoRow?.instructor_avatar || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=300',
      notification_email: profile?.notification_email === 1,
      notification_sms: profile?.notification_sms === 1,
      fee_reminder_day: profile?.fee_reminder_day || 5,
      default_monthly_fee: profile?.default_monthly_fee || 1000,
    },
    dojo: dojoRow || {
      name: master.dojo_name || 'Ranga Nagar Dojo',
      area: 'Mudichur, Chennai',
      head_sensei: master.name,
      active_students: activeStudents,
    },
    activity_history: recentSessions.map((s) => ({
      activity: `Class session held on ${s.class_date} (${s.start_time} - ${s.end_time})`,
      status: s.status,
      date: s.class_date,
    })),
  });
});

// Update Master Profile (SYNCS IMMEDIATELY TO DOJO HEAD INSTRUCTOR PROFILE IN COMMON UI)
router.put('/profile', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const {
    name,
    phone,
    bio,
    address,
    dojo_info,
    rank,
    experience,
    qualifications,
    achievements,
    avatar,
    notification_email,
    notification_sms,
    fee_reminder_day,
    default_monthly_fee
  } = req.body;

  try {
    // 1. Update master_profiles table
    db.prepare(`
      INSERT INTO master_profiles (
        master_id, phone, bio, address, dojo_info,
        notification_email, notification_sms, fee_reminder_day, default_monthly_fee, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(master_id) DO UPDATE SET
        phone = coalesce(excluded.phone, phone),
        bio = coalesce(excluded.bio, bio),
        address = coalesce(excluded.address, address),
        dojo_info = coalesce(excluded.dojo_info, dojo_info),
        notification_email = coalesce(excluded.notification_email, notification_email),
        notification_sms = coalesce(excluded.notification_sms, notification_sms),
        fee_reminder_day = coalesce(excluded.fee_reminder_day, fee_reminder_day),
        default_monthly_fee = coalesce(excluded.default_monthly_fee, default_monthly_fee),
        updated_at = datetime('now')
    `).run(
      masterId,
      phone || null,
      bio || null,
      address || null,
      dojo_info || null,
      notification_email !== undefined ? (notification_email ? 1 : 0) : 1,
      notification_sms !== undefined ? (notification_sms ? 1 : 0) : 1,
      fee_reminder_day !== undefined ? Number(fee_reminder_day) : 5,
      default_monthly_fee !== undefined ? Number(default_monthly_fee) : 1000
    );

    // 2. Update masters table name if provided
    if (name) {
      db.prepare('UPDATE masters SET name = ? WHERE id = ?').run(name.trim(), masterId);
    }

    // 3. SYNC TO DOJO HEAD INSTRUCTOR PROFILE (Reflects live in Common UI -> Dojos)
    db.prepare(`
      UPDATE dojos
      SET 
        head_instructor = coalesce(?, head_instructor),
        instructor_bio = coalesce(?, instructor_bio),
        instructor_rank = coalesce(?, instructor_rank),
        instructor_experience = coalesce(?, instructor_experience),
        instructor_qualifications = coalesce(?, instructor_qualifications),
        instructor_achievements = coalesce(?, instructor_achievements),
        instructor_avatar = coalesce(?, instructor_avatar),
        phone = coalesce(?, phone),
        updated_at = datetime('now')
      WHERE master_id = ? OR name = ?
    `).run(
      name || null,
      bio || null,
      rank || null,
      experience || null,
      qualifications || null,
      achievements || null,
      avatar || null,
      phone || null,
      masterId,
      req.master.dojo_name
    );

    res.json({ success: true, message: 'Master profile updated and synchronized live to Common UI!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile: ' + err.message });
  }
});

/* ==========================================================
   DOJO PROFILE MANAGEMENT (SYNCS LIVE TO COMMON UI)
   ========================================================== */

// Get Dojo Profile
router.get('/dojo-profile', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const dojoName = req.master.dojo_name;

  try {
    let dojo = db.prepare('SELECT * FROM dojos WHERE master_id = ? OR name = ?').get(masterId, dojoName);
    if (!dojo) {
      // Create initial dojo record for this master if none exists
      const dojoId = 'dojo-' + (dojoName || 'branch').toLowerCase().replace(/[^a-z0-9]/g, '-');
      db.prepare(`
        INSERT INTO dojos (id, name, master_id, head_instructor, status)
        VALUES (?, ?, ?, ?, 'active')
      `).run(dojoId, dojoName || 'Main Dojo', masterId, req.master.name);
      dojo = db.prepare('SELECT * FROM dojos WHERE id = ?').get(dojoId);
    }
    res.json({ dojo });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dojo profile: ' + err.message });
  }
});

// Update Dojo Profile (Live Sync to Common UI Dojos section)
router.put('/dojo-profile', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const dojoName = req.master.dojo_name;
  const {
    name,
    badge,
    area,
    city,
    state,
    pincode,
    address,
    landmarks,
    phone,
    email,
    training_days,
    class_timings,
    entry_fee,
    monthly_fee,
    facilities,
    description,
    banner_url,
    logo_url
  } = req.body;

  try {
    db.prepare(`
      UPDATE dojos
      SET 
        name = coalesce(?, name),
        badge = coalesce(?, badge),
        area = coalesce(?, area),
        city = coalesce(?, city),
        state = coalesce(?, state),
        pincode = coalesce(?, pincode),
        address = coalesce(?, address),
        landmarks = coalesce(?, landmarks),
        phone = coalesce(?, phone),
        email = coalesce(?, email),
        training_days = coalesce(?, training_days),
        class_timings = coalesce(?, class_timings),
        entry_fee = coalesce(?, entry_fee),
        monthly_fee = coalesce(?, monthly_fee),
        facilities = coalesce(?, facilities),
        description = coalesce(?, description),
        banner_url = coalesce(?, banner_url),
        logo_url = coalesce(?, logo_url),
        updated_at = datetime('now')
      WHERE master_id = ? OR name = ?
    `).run(
      name || null,
      badge || null,
      area || null,
      city || null,
      state || null,
      pincode || null,
      address || null,
      landmarks || null,
      phone || null,
      email || null,
      training_days || null,
      class_timings || null,
      entry_fee !== undefined ? Number(entry_fee) : null,
      monthly_fee !== undefined ? Number(monthly_fee) : null,
      facilities || null,
      description || null,
      banner_url || null,
      logo_url || null,
      masterId,
      dojoName
    );

    res.json({ success: true, message: 'Dojo Profile updated live! Changes will appear in Common UI immediately.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update dojo profile: ' + err.message });
  }
});

/* ==========================================================
   JOIN REQUESTS MANAGEMENT (STUDENT APPROVAL WORKFLOW)
   ========================================================== */

// GET /api/master/join-requests — List requests for this Dojo
router.get('/join-requests', (req, res) => {
  const dojoName = req.master.dojo_name;

  try {
    const requests = db.prepare(`
      SELECT * FROM join_requests
      WHERE dojo_name LIKE ? OR dojo_id = ? OR status = 'pending_review'
      ORDER BY submitted_at DESC
    `).all(`%${dojoName}%`, req.master.dojo_id || 'dojo-ranganagar');

    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch join requests: ' + err.message });
  }
});

// POST /api/master/join-requests/:id/approve — Approve Student
router.post('/join-requests/:id/approve', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const reqId = req.params.id;
  const { assigned_belt, assigned_monthly_fee, notes } = req.body;

  try {
    const joinReq = db.prepare('SELECT * FROM join_requests WHERE id = ?').get(reqId);
    if (!joinReq) {
      return res.status(404).json({ error: 'Join request not found.' });
    }

    db.exec('BEGIN IMMEDIATE;');

    // 1. Mark request approved
    db.prepare(`
      UPDATE join_requests
      SET status = 'approved',
          reviewed_by = ?,
          reviewer_notes = ?,
          assigned_belt = ?,
          assigned_monthly_fee = ?
      WHERE id = ?
    `).run(
      masterId,
      notes || 'Approved by Dojo Master',
      assigned_belt || 'White Belt (Beginner)',
      Number(assigned_monthly_fee) || 800,
      reqId
    );

    // 2. Activate user in users table
    if (joinReq.student_user_id) {
      db.prepare(`
        UPDATE users
        SET status = 'active', updated_at = datetime('now')
        WHERE id = ?
      `).run(joinReq.student_user_id);
    }

    // 3. Generate student code & create record in students table
    const stuCount = db.prepare('SELECT COUNT(*) as count FROM students').get()?.count || 0;
    const studentCode = `KOMS-STU-${String(stuCount + 1).padStart(3, '0')}`;

    db.prepare(`
      INSERT INTO students (
        master_id, student_name, student_code, joining_date, status, rank,
        dob, phone, email, guardian_name, guardian_phone, address, monthly_fee
      ) VALUES (?, ?, ?, date('now'), 'active', ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      masterId,
      joinReq.student_name,
      studentCode,
      assigned_belt || 'White Belt (Beginner)',
      joinReq.dob || null,
      joinReq.phone || null,
      joinReq.email || null,
      joinReq.guardian_name || null,
      joinReq.guardian_phone || null,
      joinReq.address || null,
      Number(assigned_monthly_fee) || 800
    );

    // 4. Create student_profiles entry
    db.prepare(`
      INSERT OR REPLACE INTO student_profiles (
        user_id, student_code, dojo_id, master_id, name, dob, gender,
        blood_group, guardian_name, guardian_phone, guardian_whatsapp,
        phone, email, address, belt, training_category, prior_experience,
        status, monthly_fee, joining_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, date('now'))
    `).run(
      joinReq.student_user_id || null,
      studentCode,
      joinReq.dojo_id || 'dojo-ranganagar',
      masterId,
      joinReq.student_name,
      joinReq.dob || null,
      joinReq.gender || null,
      joinReq.blood_group || null,
      joinReq.guardian_name || null,
      joinReq.guardian_phone || null,
      joinReq.guardian_whatsapp || null,
      joinReq.phone || null,
      joinReq.email || null,
      joinReq.address || null,
      assigned_belt || 'White Belt (Beginner)',
      joinReq.training_category || 'Traditional Karate',
      joinReq.prior_experience || 'None',
      Number(assigned_monthly_fee) || 800
    );

    db.exec('COMMIT;');

    res.json({
      success: true,
      message: `Student ${joinReq.student_name} approved! Assigned Student Code: ${studentCode}. Account is now active.`,
      studentCode
    });
  } catch (err) {
    try { db.exec('ROLLBACK;'); } catch (_) {}
    console.error('Approve join request error:', err);
    res.status(500).json({ error: 'Failed to approve join request: ' + err.message });
  }
});

// POST /api/master/join-requests/:id/reject — Reject Student
router.post('/join-requests/:id/reject', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const reqId = req.params.id;
  const { notes } = req.body;

  try {
    const joinReq = db.prepare('SELECT * FROM join_requests WHERE id = ?').get(reqId);
    if (!joinReq) {
      return res.status(404).json({ error: 'Join request not found.' });
    }

    db.exec('BEGIN IMMEDIATE;');

    db.prepare(`
      UPDATE join_requests
      SET status = 'rejected', reviewed_by = ?, reviewer_notes = ?
      WHERE id = ?
    `).run(masterId, notes || 'Rejected by Dojo Master', reqId);

    if (joinReq.student_user_id) {
      db.prepare(`
        UPDATE users
        SET status = 'rejected', updated_at = datetime('now')
        WHERE id = ?
      `).run(joinReq.student_user_id);
    }

    db.exec('COMMIT;');

    res.json({
      success: true,
      message: `Join request for ${joinReq.student_name} rejected.`
    });
  } catch (err) {
    try { db.exec('ROLLBACK;'); } catch (_) {}
    res.status(500).json({ error: 'Failed to reject join request: ' + err.message });
  }
});

export default router;

