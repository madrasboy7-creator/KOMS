import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../auth.js';
import { WEEKDAY_NAMES, ensureSessionsForMonth, parseDate, formatDate } from '../scheduler.js';

const router = express.Router();
router.use(authMiddleware);

// Get attendance for a class session
router.get('/session/:sessionId', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const sessionId = Number(req.params.sessionId);

  const session = db.prepare(`
    SELECT * FROM class_sessions WHERE id = ?
  `).get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Class session not found' });
  }

  // Cross-tenant verification
  if (session.master_id !== masterId) {
    return res.status(403).json({ error: 'Access denied: Class session belongs to another Dojo Master' });
  }

  // Fetch students belonging to this master (can include inactive/paused for historical entry)
  const includeInactive = req.query.include_inactive === 'true' || req.query.status === 'all';
  const studentQuery = includeInactive
    ? `SELECT id, student_name, student_code, rank, status, joining_date, paused_date, paused_reason FROM students WHERE master_id = ? ORDER BY status ASC, student_code ASC`
    : `SELECT id, student_name, student_code, rank, status, joining_date, paused_date, paused_reason FROM students 
       WHERE master_id = ? 
         AND (
           status = 'active' 
           OR (status IN ('paused', 'discontinued') AND (paused_date IS NULL OR paused_date >= ?))
         )
       ORDER BY student_code ASC`;

  const students = includeInactive 
    ? db.prepare(studentQuery).all(masterId)
    : db.prepare(studentQuery).all(masterId, session.class_date);

  // Fetch existing attendance records for this session
  const records = db.prepare(`
    SELECT id as record_id, student_id, attendance_status, marked_at, updated_at
    FROM attendance_records
    WHERE class_session_id = ?
  `).all(sessionId);

  const recordMap = new Map();
  for (const r of records) {
    recordMap.set(r.student_id, r);
  }

  let presentCount = 0;
  let absentCount = 0;
  let leaveCount = 0;
  let unmarkedCount = 0;

  const roster = students.map(student => {
    const existing = recordMap.get(student.id);
    const status = existing ? existing.attendance_status : 'NOT MARKED';

    if (status === 'PRESENT') presentCount++;
    else if (status === 'ABSENT') absentCount++;
    else if (status === 'LEAVE') leaveCount++;
    else unmarkedCount++;

    return {
      ...student,
      record_id: existing ? existing.record_id : null,
      attendance_status: status,
      marked_at: existing ? existing.marked_at : null,
      updated_at: existing ? existing.updated_at : null
    };
  });

  res.json({
    session,
    roster,
    summary: {
      total_students: students.length,
      present_count: presentCount,
      absent_count: absentCount,
      leave_count: leaveCount,
      unmarked_count: unmarkedCount,
      is_completed: session.status === 'completed'
    }
  });
});

// Save or Update Attendance for a session (Section 5 & 6)
router.post('/save', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const { class_session_id, records, reason } = req.body;

  if (!class_session_id || !Array.isArray(records)) {
    return res.status(400).json({ error: 'class_session_id and records array are required' });
  }

  // 1. Verify class session exists and belongs to logged-in Master
  const session = db.prepare('SELECT * FROM class_sessions WHERE id = ?').get(Number(class_session_id));
  if (!session) {
    return res.status(404).json({ error: 'Class session not found' });
  }
  if (session.master_id !== masterId) {
    return res.status(403).json({ error: 'Access denied: Class session belongs to another Master' });
  }

  // 2. Verify all students in records belong to this Master
  const verifyStudentStmt = db.prepare('SELECT master_id FROM students WHERE id = ?');
  for (const item of records) {
    const st = verifyStudentStmt.get(Number(item.student_id));
    if (!st || st.master_id !== masterId) {
      return res.status(403).json({ 
        error: `Access denied: Student #${item.student_id} does not belong to this Dojo Master` 
      });
    }
    const status = (item.status || item.attendance_status || '').toUpperCase();
    if (!['PRESENT', 'ABSENT', 'LEAVE', 'NOT MARKED'].includes(status)) {
      return res.status(400).json({ error: `Invalid attendance status: ${item.status}` });
    }
  }

  // 3. Database transaction to save attendance idempotently
  let inTransaction = false;

  try {
    db.exec('BEGIN IMMEDIATE;');
    inTransaction = true;

    const findExistingStmt = db.prepare(`
      SELECT id, attendance_status FROM attendance_records 
      WHERE class_session_id = ? AND student_id = ?
    `);

    const upsertStmt = db.prepare(`
      INSERT INTO attendance_records 
        (master_id, class_session_id, student_id, attendance_status, marked_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      ON CONFLICT(class_session_id, student_id) 
      DO UPDATE SET 
        attendance_status = excluded.attendance_status,
        updated_at = datetime('now')
    `);

    const deleteUnmarkedStmt = db.prepare(`
      DELETE FROM attendance_records 
      WHERE class_session_id = ? AND student_id = ?
    `);

    const insertAuditStmt = db.prepare(`
      INSERT INTO attendance_audit_logs 
        (attendance_record_id, old_status, new_status, reason, modified_by)
      VALUES (?, ?, ?, ?, ?)
    `);

    let markedEntriesCount = 0;

    for (const item of records) {
      const studentId = Number(item.student_id);
      const status = (item.status || item.attendance_status || '').toUpperCase();
      const existing = findExistingStmt.get(Number(class_session_id), studentId);

      if (status === 'NOT MARKED') {
        if (existing) {
          deleteUnmarkedStmt.run(Number(class_session_id), studentId);
        }
      } else {
        markedEntriesCount++;
        const upsertRes = upsertStmt.run(masterId, Number(class_session_id), studentId, status);
        const recordId = existing ? existing.id : Number(upsertRes.lastInsertRowid);

        // If existing record was modified and reason provided, create audit log
        if (existing && existing.attendance_status !== status && reason) {
          insertAuditStmt.run(recordId, existing.attendance_status, status, reason, req.master.id);
        }
      }
    }

    // 4. Update session status to completed if any valid attendance was recorded
    if (markedEntriesCount > 0) {
      db.prepare("UPDATE class_sessions SET status = 'completed' WHERE id = ?").run(Number(class_session_id));
    }

    db.exec('COMMIT;');
    inTransaction = false;

    // 5. Query updated summary
    const counts = db.prepare(`
      SELECT 
        SUM(CASE WHEN attendance_status = 'PRESENT' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN attendance_status = 'ABSENT' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN attendance_status = 'LEAVE' THEN 1 ELSE 0 END) as leave_count,
        COUNT(*) as total_marked
      FROM attendance_records
      WHERE class_session_id = ?
    `).get(Number(class_session_id));

    const totalActive = db.prepare("SELECT COUNT(*) as count FROM students WHERE master_id = ? AND status = 'active'").get(masterId).count;
    const unmarked = Math.max(0, totalActive - (counts.total_marked || 0));

    res.json({
      success: true,
      message: 'Attendance successfully saved.',
      summary: {
        present_count: counts.present_count || 0,
        absent_count: counts.absent_count || 0,
        leave_count: counts.leave_count || 0,
        unmarked_count: unmarked,
        total_students: totalActive
      }
    });
  } catch (err) {
    if (inTransaction) {
      try { db.exec('ROLLBACK;'); } catch (e) {}
    }
    console.error('Attendance save error:', err);
    res.status(500).json({ error: 'Failed to save attendance: ' + err.message });
  }
});

// Edit finalized attendance record with audit trail (Section 10)
router.post('/edit-audit', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const { attendance_record_id, new_status, reason } = req.body;

  if (!attendance_record_id || !new_status || !reason || !reason.trim()) {
    return res.status(400).json({ error: 'attendance_record_id, new_status, and reason are required' });
  }

  const validStatus = new_status.toUpperCase();
  if (!['PRESENT', 'ABSENT', 'LEAVE'].includes(validStatus)) {
    return res.status(400).json({ error: 'Invalid attendance status' });
  }

  const record = db.prepare(`
    SELECT ar.*, cs.master_id as session_master_id
    FROM attendance_records ar
    JOIN class_sessions cs ON ar.class_session_id = cs.id
    WHERE ar.id = ?
  `).get(Number(attendance_record_id));

  if (!record) {
    return res.status(404).json({ error: 'Attendance record not found' });
  }

  if (record.master_id !== masterId || record.session_master_id !== masterId) {
    return res.status(403).json({ error: 'Access denied: Record belongs to another Master' });
  }

  db.exec('BEGIN IMMEDIATE;');
  try {
    const oldStatus = record.attendance_status;

    // Insert into audit log
    db.prepare(`
      INSERT INTO attendance_audit_logs 
        (attendance_record_id, old_status, new_status, reason, modified_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(record.id, oldStatus, validStatus, reason.trim(), req.master.id);

    // Update attendance record
    db.prepare(`
      UPDATE attendance_records 
      SET attendance_status = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(validStatus, record.id);

    db.exec('COMMIT;');

    res.json({
      success: true,
      message: `Attendance updated from ${oldStatus} to ${validStatus} with audit entry.`,
      oldStatus,
      newStatus: validStatus
    });
  } catch (err) {
    db.exec('ROLLBACK;');
    res.status(500).json({ error: 'Failed to update attendance audit record: ' + err.message });
  }
});

// Get attendance audit logs for master
router.get('/audit-logs', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const logs = db.prepare(`
    SELECT 
      al.*,
      s.student_name,
      s.student_code,
      cs.class_date,
      m.name as master_name
    FROM attendance_audit_logs al
    JOIN attendance_records ar ON al.attendance_record_id = ar.id
    JOIN students s ON ar.student_id = s.id
    JOIN class_sessions cs ON ar.class_session_id = cs.id
    JOIN masters m ON al.modified_by = m.id
    WHERE ar.master_id = ?
    ORDER BY al.modified_at DESC
    LIMIT 50
  `).all(masterId);

  res.json({ logs });
});

// Monthly Attendance Register Sheet (Month-Wise & Date of the Month)
router.get('/monthly-register', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const now = new Date();
  const year = req.query.year ? Number(req.query.year) : now.getFullYear();
  const month = req.query.month ? Number(req.query.month) : (now.getMonth() + 1);
  const statusFilter = req.query.status || 'all'; // 'all', 'active', 'inactive'

  // Ensure sessions exist for this month based on active schedule
  ensureSessionsForMonth(db, masterId, year, month);

  const formattedMonth = String(month).padStart(2, '0');
  const monthPrefix = `${year}-${formattedMonth}`;

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // 1. Fetch all class sessions in this month
  const sessions = db.prepare(`
    SELECT id, class_date, start_time, end_time, status
    FROM class_sessions
    WHERE master_id = ? AND class_date LIKE ? AND status != 'cancelled'
    ORDER BY class_date ASC, start_time ASC
  `).all(masterId, `${monthPrefix}%`);

  const enrichedSessions = sessions.map(s => {
    const d = parseDate(s.class_date);
    return {
      id: s.id,
      class_date: s.class_date,
      day_of_month: d.getDate(),
      weekday: d.getDay(),
      weekday_name: WEEKDAY_NAMES[d.getDay()],
      short_weekday: WEEKDAY_NAMES[d.getDay()].slice(0, 3),
      start_time: s.start_time,
      end_time: s.end_time,
      status: s.status
    };
  });

  const totalScheduledClasses = enrichedSessions.length;

  // 2. Fetch students for monthly register:
  // For the active register: include active students OR students who paused during/after this month.
  // For next month, paused students are automatically removed from the attendance list!
  let studentQuery = `SELECT id, student_name, student_code, rank, status, joining_date, paused_date, paused_reason FROM students WHERE master_id = ?`;
  const studentParams = [masterId];

  if (statusFilter === 'paused' || statusFilter === 'discontinued') {
    studentQuery += ` AND status IN ('paused', 'discontinued')`;
  } else if (statusFilter === 'inactive') {
    studentQuery += ` AND status = 'inactive'`;
  } else if (statusFilter !== 'all') {
    // Default active roster for this month:
    // Exclude students who discontinued before this month!
    studentQuery += ` AND (
      status = 'active'
      OR (
        status IN ('paused', 'discontinued') 
        AND (paused_date IS NULL OR substr(paused_date, 1, 7) >= ?)
      )
    )`;
    studentParams.push(monthPrefix);
  }
  studentQuery += ` ORDER BY status ASC, student_code ASC`;
  const students = db.prepare(studentQuery).all(...studentParams);

  // 3. Fetch all attendance records for this master in this month
  const attendanceRows = db.prepare(`
    SELECT ar.class_session_id, ar.student_id, ar.attendance_status
    FROM attendance_records ar
    JOIN class_sessions cs ON ar.class_session_id = cs.id
    WHERE ar.master_id = ? AND cs.class_date LIKE ? AND cs.status != 'cancelled'
  `).all(masterId, `${monthPrefix}%`);

  // Map by student_id -> { [session_id]: status }
  const attMap = new Map();
  for (const row of attendanceRows) {
    if (!attMap.has(row.student_id)) {
      attMap.set(row.student_id, {});
    }
    attMap.get(row.student_id)[row.class_session_id] = row.attendance_status;
  }

  // 4. Build student register rows with schedule-based percentage calculation
  const registerRows = students.map(st => {
    const studentDates = attMap.get(st.id) || {};
    let attendedCount = 0;
    let absentCount = 0;
    let leaveCount = 0;
    let unmarkedCount = 0;

    for (const sess of enrichedSessions) {
      const stStatus = studentDates[sess.id] || 'NOT MARKED';
      studentDates[sess.id] = stStatus;

      if (stStatus === 'PRESENT') attendedCount++;
      else if (stStatus === 'ABSENT') absentCount++;
      else if (stStatus === 'LEAVE') leaveCount++;
      else unmarkedCount++;
    }

    // Percentage calculated as per class schedule in month
    // eg: monthly 8 classes the students attend 6 means 75%, if 4 class means 50%
    const percentage = totalScheduledClasses > 0
      ? Math.round((attendedCount / totalScheduledClasses) * 1000) / 10
      : 0;

    return {
      student_id: st.id,
      student_name: st.student_name,
      student_code: st.student_code,
      rank: st.rank,
      status: st.status,
      joining_date: st.joining_date,
      dates: studentDates,
      attended_classes_count: attendedCount,
      absent_count: absentCount,
      leave_count: leaveCount,
      unmarked_count: unmarkedCount,
      total_scheduled_classes: totalScheduledClasses,
      monthly_percentage: percentage,
      fraction_display: `${attendedCount} / ${totalScheduledClasses}`,
      formula_display: `${attendedCount} of ${totalScheduledClasses} classes (${percentage}%)`
    };
  });

  res.json({
    year,
    month,
    month_name: `${MONTH_NAMES[month - 1]} ${year}`,
    total_scheduled_classes: totalScheduledClasses,
    sessions: enrichedSessions,
    register: registerRows
  });
});

// Bulk Save Monthly Register Updates
router.post('/monthly-register/save', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const { updates } = req.body;

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ error: 'updates array is required' });
  }

  let inTx = false;
  try {
    db.exec('BEGIN IMMEDIATE;');
    inTx = true;

    const upsertStmt = db.prepare(`
      INSERT INTO attendance_records 
        (master_id, class_session_id, student_id, attendance_status, marked_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      ON CONFLICT(class_session_id, student_id) 
      DO UPDATE SET 
        attendance_status = excluded.attendance_status,
        updated_at = datetime('now')
    `);

    const deleteStmt = db.prepare(`
      DELETE FROM attendance_records WHERE class_session_id = ? AND student_id = ?
    `);

    const verifySessionStmt = db.prepare('SELECT master_id FROM class_sessions WHERE id = ?');
    const verifyStudentStmt = db.prepare('SELECT master_id FROM students WHERE id = ?');
    const updateSessionCompleted = db.prepare("UPDATE class_sessions SET status = 'completed' WHERE id = ?");

    const sessionCompletedSet = new Set();

    for (const item of updates) {
      const sessionId = Number(item.class_session_id);
      const studentId = Number(item.student_id);
      const status = (item.status || 'NOT MARKED').toUpperCase();

      const sess = verifySessionStmt.get(sessionId);
      if (!sess || sess.master_id !== masterId) continue;

      const st = verifyStudentStmt.get(studentId);
      if (!st || st.master_id !== masterId) continue;

      if (status === 'NOT MARKED') {
        deleteStmt.run(sessionId, studentId);
      } else if (['PRESENT', 'ABSENT', 'LEAVE'].includes(status)) {
        upsertStmt.run(masterId, sessionId, studentId, status);
        sessionCompletedSet.add(sessionId);
      }
    }

    for (const sId of sessionCompletedSet) {
      updateSessionCompleted.run(sId);
    }

    db.exec('COMMIT;');
    inTx = false;

    res.json({
      success: true,
      message: `Successfully saved ${updates.length} attendance updates across the monthly register.`
    });
  } catch (err) {
    if (inTx) {
      try { db.exec('ROLLBACK;'); } catch (e) {}
    }
    console.error('Monthly register save error:', err);
    res.status(500).json({ error: 'Failed to save monthly register: ' + err.message });
  }
});

// Single Cell Quick Update
router.post('/record-single', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const { class_session_id, student_id, status } = req.body;

  if (!class_session_id || !student_id || !status) {
    return res.status(400).json({ error: 'class_session_id, student_id and status are required' });
  }

  const sess = db.prepare('SELECT master_id FROM class_sessions WHERE id = ?').get(Number(class_session_id));
  if (!sess || sess.master_id !== masterId) {
    return res.status(403).json({ error: 'Access denied: Session belongs to another master' });
  }

  const st = db.prepare('SELECT master_id FROM students WHERE id = ?').get(Number(student_id));
  if (!st || st.master_id !== masterId) {
    return res.status(403).json({ error: 'Access denied: Student belongs to another master' });
  }

  const validStatus = status.toUpperCase();
  if (validStatus === 'NOT MARKED') {
    db.prepare('DELETE FROM attendance_records WHERE class_session_id = ? AND student_id = ?').run(Number(class_session_id), Number(student_id));
  } else {
    db.prepare(`
      INSERT INTO attendance_records 
        (master_id, class_session_id, student_id, attendance_status, marked_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      ON CONFLICT(class_session_id, student_id) 
      DO UPDATE SET attendance_status = excluded.attendance_status, updated_at = datetime('now')
    `).run(masterId, Number(class_session_id), Number(student_id), validStatus);

    db.prepare("UPDATE class_sessions SET status = 'completed' WHERE id = ?").run(Number(class_session_id));
  }

  res.json({ success: true, message: 'Attendance updated' });
});

export default router;
