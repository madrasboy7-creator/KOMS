import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../auth.js';
import { WEEKDAY_NAMES, parseDate, formatDate } from '../scheduler.js';

const router = express.Router();
router.use(authMiddleware);

// Generate next student code suggestion (e.g. KOMS-STU-016)
router.get('/next-code', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const lastStudent = db.prepare(`
    SELECT student_code FROM students 
    WHERE master_id = ? 
    ORDER BY id DESC LIMIT 1
  `).get(masterId);

  let nextNum = 1;
  if (lastStudent && lastStudent.student_code) {
    const match = lastStudent.student_code.match(/(\d+)$/);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }

  const prefix = masterId === 1 ? 'KOMS-STU-' : `KOMS-M${masterId}-`;
  const code = `${prefix}${String(nextNum).padStart(3, '0')}`;
  res.json({ next_code: code });
});

// List all students for logged-in master
router.get('/', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const { status, search } = req.query;

  let query = `SELECT * FROM students WHERE master_id = ?`;
  const params = [masterId];

  if (status && status !== 'all') {
    query += ` AND status = ?`;
    params.push(status);
  }

  if (search && search.trim()) {
    query += ` AND (student_name LIKE ? OR student_code LIKE ?)`;
    const term = `%${search.trim()}%`;
    params.push(term, term);
  }

  query += ` ORDER BY status ASC, student_code ASC`;

  const students = db.prepare(query).all(...params);
  res.json({ students });
});

// Create new student or previous student record
router.post('/', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const {
    student_name,
    student_code,
    joining_date,
    status = 'active',
    rank = 'White Belt (Beginner)'
  } = req.body;

  if (!student_name || !student_name.trim()) {
    return res.status(400).json({ error: 'Student name is required' });
  }

  let code = student_code ? student_code.trim() : null;
  if (!code) {
    // Generate code
    const last = db.prepare('SELECT student_code FROM students WHERE master_id = ? ORDER BY id DESC LIMIT 1').get(masterId);
    let nextNum = 1;
    if (last && last.student_code) {
      const match = last.student_code.match(/(\d+)$/);
      if (match) nextNum = parseInt(match[1], 10) + 1;
    }
    const prefix = masterId === 1 ? 'KOMS-STU-' : `KOMS-M${masterId}-`;
    code = `${prefix}${String(nextNum).padStart(3, '0')}`;
  }

  const joinDate = joining_date || formatDate(new Date());
  const validStatus = status === 'inactive' ? 'inactive' : 'active';

  try {
    const insertStmt = db.prepare(`
      INSERT INTO students (master_id, student_name, student_code, joining_date, status, rank)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = insertStmt.run(masterId, student_name.trim(), code, joinDate, validStatus, rank.trim());
    const newStudent = db.prepare('SELECT * FROM students WHERE id = ?').get(Number(result.lastInsertRowid));

    res.json({
      success: true,
      message: `Student ${newStudent.student_name} (${newStudent.student_code}) added successfully.`,
      student: newStudent
    });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: `Student code "${code}" already exists for this Dojo.` });
    }
    res.status(500).json({ error: 'Failed to create student: ' + err.message });
  }
});

// Update student details
router.put('/:id', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const studentId = Number(req.params.id);
  const { student_name, student_code, joining_date, status, rank } = req.body;

  const existing = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
  if (!existing) {
    return res.status(404).json({ error: 'Student not found' });
  }
  if (existing.master_id !== masterId) {
    return res.status(403).json({ error: 'Access denied: Student belongs to another Master' });
  }

  const newName = student_name !== undefined ? student_name.trim() : existing.student_name;
  const newCode = student_code !== undefined ? student_code.trim() : existing.student_code;
  const newJoin = joining_date !== undefined ? joining_date : existing.joining_date;
  const newStatus = status !== undefined ? status : existing.status;
  const newRank = rank !== undefined ? rank.trim() : existing.rank;

  try {
    db.prepare(`
      UPDATE students 
      SET student_name = ?, student_code = ?, joining_date = ?, status = ?, rank = ?
      WHERE id = ? AND master_id = ?
    `).run(newName, newCode, newJoin, newStatus, newRank, studentId, masterId);

    const updated = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
    res.json({
      success: true,
      message: 'Student record updated successfully',
      student: updated
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update student: ' + err.message });
  }
});

// Pause student attendance (Discontinue classes)
router.post('/:id/pause', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const studentId = Number(req.params.id);
  const { paused_date, reason } = req.body;

  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  if (student.master_id !== masterId) return res.status(403).json({ error: 'Access denied: Student belongs to another Master' });

  const effectivePauseDate = paused_date || formatDate(new Date());
  const pauseReason = reason && reason.trim() ? reason.trim() : 'Discontinued classes';

  db.prepare(`
    UPDATE students 
    SET status = 'paused', paused_date = ?, paused_reason = ?
    WHERE id = ? AND master_id = ?
  `).run(effectivePauseDate, pauseReason, studentId, masterId);

  const updated = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
  res.json({
    success: true,
    message: `Attendance for ${updated.student_name} has been paused from ${effectivePauseDate}. They will be automatically removed from the next month's attendance list while their history is maintained.`,
    student: updated
  });
});

// Resume student attendance
router.post('/:id/resume', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const studentId = Number(req.params.id);

  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  if (student.master_id !== masterId) return res.status(403).json({ error: 'Access denied: Student belongs to another Master' });

  db.prepare(`
    UPDATE students 
    SET status = 'active', paused_date = NULL, paused_reason = NULL
    WHERE id = ? AND master_id = ?
  `).run(studentId, masterId);

  const updated = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
  res.json({
    success: true,
    message: `Attendance for ${updated.student_name} has been resumed to Active.`,
    student: updated
  });
});

// Get single student profile
router.get('/:id', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const studentId = Number(req.params.id);

  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  if (student.master_id !== masterId) {
    return res.status(403).json({ error: 'Access denied: Student belongs to another Master' });
  }

  res.json({ student });
});

// Student Attendance History - Month-Wise & Date of the Month
router.get('/:id/attendance-history', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const studentId = Number(req.params.id);
  const { year, month } = req.query;

  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  if (student.master_id !== masterId) {
    return res.status(403).json({ error: 'Access denied: Student belongs to another Master' });
  }

  const todayStr = formatDate(new Date());

  // Fetch sessions for this master up to today (or where attendance is already marked), never future unmarked classes
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

  // Month names helper
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Group rows by month ('YYYY-MM')
  const monthGroups = new Map();

  for (const r of rows) {
    const monthKey = r.class_date.slice(0, 7); // 'YYYY-MM'
    if (!monthGroups.has(monthKey)) {
      const [yStr, mStr] = monthKey.split('-');
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10);

      // Query total scheduled classes in this month for this master
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
      timing: `${r.start_time} - ${r.end_time}`,
      status,
      marked_at: r.marked_at,
      has_audit: r.audit_count > 0
    });
  }

  // Calculate percentages per month based on class schedule in month
  // e.g. monthly 8 classes, student attends 6 -> 75%, attends 4 -> 50%
  const monthlyRecords = Array.from(monthGroups.values()).map(m => {
    // Total scheduled in month is denominator
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

  // Calculate overall metrics
  let totalAttended = 0;
  let totalAbsent = 0;
  let totalLeave = 0;
  let totalScheduledAllMonths = 0;

  for (const m of monthlyRecords) {
    totalAttended += m.attended_count;
    totalAbsent += m.absent_count;
    totalLeave += m.leave_count;
    totalScheduledAllMonths += m.total_scheduled_in_month;
  }

  const overallDenominator = totalScheduledAllMonths > 0 ? totalScheduledAllMonths : (totalAttended + totalAbsent + totalLeave);
  const overallPercentage = overallDenominator > 0 
    ? Math.round((totalAttended / overallDenominator) * 1000) / 10 
    : 0;

  res.json({
    student,
    filter: { year: year || null, month: month || null },
    metrics: {
      total_scheduled_classes: totalScheduledAllMonths,
      total_attended_classes: totalAttended,
      total_absent: totalAbsent,
      total_leave: totalLeave,
      overall_attendance_percentage: overallPercentage,
      formula_text: `${totalAttended} attended ÷ ${totalScheduledAllMonths} scheduled classes = ${overallPercentage}%`
    },
    monthly_records: monthlyRecords,
    // Flattened history for date-wise table
    history: rows.map(r => ({
      session_id: r.class_session_id,
      record_id: r.record_id,
      date: r.class_date,
      day: WEEKDAY_NAMES[parseDate(r.class_date).getDay()],
      timing: `${r.start_time} - ${r.end_time}`,
      status: r.attendance_status || 'NOT MARKED',
      marked_at: r.marked_at,
      has_audit: r.audit_count > 0
    }))
  });
});

export default router;

/* =========================================================================
   ADDITIONAL MASTER STUDENT MANAGEMENT ENDPOINTS
   ========================================================================= */

// Registration Requests List
router.get('/requests/list', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const { status } = req.query;

  let query = 'SELECT * FROM student_registration_requests WHERE master_id = ?';
  const params = [masterId];

  if (status && status !== 'ALL') {
    query += ' AND status = ?';
    params.push(status.toUpperCase());
  }

  query += ' ORDER BY requested_at DESC';

  const requests = db.prepare(query).all(...params);
  res.json({ requests });
});

// Submit Registration Request (Master-created or Student-submitted)
router.post('/requests/create', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const {
    student_name,
    dob,
    phone,
    email,
    guardian_name,
    guardian_phone,
    address,
    belt = 'White Belt (Beginner)',
    monthly_fee = 1000,
    registration_type = 'MASTER_CREATED',
    auto_approve = false,
  } = req.body;

  if (!student_name || !student_name.trim()) {
    return res.status(400).json({ error: 'Student name is required.' });
  }

  const master = db.prepare('SELECT dojo_name FROM masters WHERE id = ?').get(masterId);
  const dojoName = master?.dojo_name || 'Ranga Nagar Dojo';

  try {
    const insertReq = db.prepare(`
      INSERT INTO student_registration_requests (
        master_id, student_name, dob, phone, email, guardian_name,
        guardian_phone, address, belt, dojo_name, monthly_fee,
        registration_type, status, requested_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    const initialStatus = auto_approve ? 'APPROVED' : 'PENDING';
    const result = insertReq.run(
      masterId,
      student_name.trim(),
      dob || null,
      phone || null,
      email || null,
      guardian_name || null,
      guardian_phone || null,
      address || null,
      belt,
      dojoName,
      Number(monthly_fee) || 1000,
      registration_type,
      initialStatus
    );

    const reqId = Number(result.lastInsertRowid);

    // If auto_approve is true, immediately create student
    if (auto_approve) {
      // Generate student code
      const last = db.prepare('SELECT student_code FROM students WHERE master_id = ? ORDER BY id DESC LIMIT 1').get(masterId);
      let nextNum = 1;
      if (last && last.student_code) {
        const m = last.student_code.match(/(\d+)$/);
        if (m) nextNum = parseInt(m[1], 10) + 1;
      }
      const code = `KOMS-STU-${String(nextNum).padStart(3, '0')}`;

      const insertStudent = db.prepare(`
        INSERT INTO students (
          master_id, student_name, student_code, joining_date, status, rank,
          dob, phone, email, guardian_name, guardian_phone, address, monthly_fee
        ) VALUES (?, ?, ?, date('now'), 'active', ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const stuRes = insertStudent.run(
        masterId,
        student_name.trim(),
        code,
        belt,
        dob || null,
        phone || null,
        email || null,
        guardian_name || null,
        guardian_phone || null,
        address || null,
        Number(monthly_fee) || 1000
      );

      const createdStudent = db.prepare('SELECT * FROM students WHERE id = ?').get(Number(stuRes.lastInsertRowid));
      return res.json({
        success: true,
        message: `Student ${createdStudent.student_name} registered directly with code ${code}.`,
        student: createdStudent,
      });
    }

    res.json({
      success: true,
      message: 'Student registration request submitted and queued for Master review.',
      request_id: reqId,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create registration request: ' + err.message });
  }
});

// Approve Registration Request
router.post('/requests/:id/approve', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const { id } = req.params;

  const reqRow = db.prepare('SELECT * FROM student_registration_requests WHERE id = ? AND master_id = ?').get(id, masterId);
  if (!reqRow) {
    return res.status(404).json({ error: 'Registration request not found.' });
  }

  try {
    // Generate code
    const last = db.prepare('SELECT student_code FROM students WHERE master_id = ? ORDER BY id DESC LIMIT 1').get(masterId);
    let nextNum = 1;
    if (last && last.student_code) {
      const m = last.student_code.match(/(\d+)$/);
      if (m) nextNum = parseInt(m[1], 10) + 1;
    }
    const code = `KOMS-STU-${String(nextNum).padStart(3, '0')}`;

    const insertStudent = db.prepare(`
      INSERT INTO students (
        master_id, student_name, student_code, joining_date, status, rank,
        dob, phone, email, guardian_name, guardian_phone, address, monthly_fee
      ) VALUES (?, ?, ?, date('now'), 'active', ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const stuRes = insertStudent.run(
      masterId,
      reqRow.student_name,
      code,
      reqRow.belt,
      reqRow.dob,
      reqRow.phone,
      reqRow.email,
      reqRow.guardian_name,
      reqRow.guardian_phone,
      reqRow.address,
      reqRow.monthly_fee || 1000
    );

    db.prepare(`
      UPDATE student_registration_requests
      SET status = 'APPROVED', reviewed_at = datetime('now'), reviewed_by = ?
      WHERE id = ?
    `).run(masterId, id);

    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(Number(stuRes.lastInsertRowid));

    res.json({
      success: true,
      message: `Registration request approved. Student code ${code} generated.`,
      student,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve request: ' + err.message });
  }
});

// Reject Registration Request
router.post('/requests/:id/reject', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const { id } = req.params;
  const { reason = 'Details could not be verified' } = req.body;

  try {
    db.prepare(`
      UPDATE student_registration_requests
      SET status = 'REJECTED', reviewed_at = datetime('now'), reviewed_by = ?, review_notes = ?
      WHERE id = ? AND master_id = ?
    `).run(masterId, reason, id, masterId);

    res.json({ success: true, message: 'Registration request rejected.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject request: ' + err.message });
  }
});

// Full 7-Tab Student Profile
router.get('/:id/full-profile', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const studentId = Number(req.params.id);

  const student = db.prepare('SELECT * FROM students WHERE id = ? AND master_id = ?').get(studentId, masterId);
  if (!student) {
    return res.status(404).json({ error: 'Student not found in your dojo.' });
  }

  const master = db.prepare('SELECT name, dojo_name FROM masters WHERE id = ?').get(masterId);

  // Fee History
  const feePayments = db.prepare(`
    SELECT * FROM fee_payments
    WHERE student_id = ?
    ORDER BY payment_date DESC
  `).all(studentId);

  // Attendance History
  const attendanceRecords = db.prepare(`
    SELECT 
      ar.*,
      cs.class_date,
      cs.start_time,
      cs.end_time,
      cs.session_type,
      cs.title
    FROM attendance_records ar
    JOIN class_sessions cs ON ar.class_session_id = cs.id
    WHERE ar.student_id = ?
    ORDER BY cs.class_date DESC
  `).all(studentId);

  // Total attended / absent / leave
  const stats = {
    total_classes: attendanceRecords.length,
    present: attendanceRecords.filter((a) => a.attendance_status === 'PRESENT').length,
    absent: attendanceRecords.filter((a) => a.attendance_status === 'ABSENT').length,
    leave: attendanceRecords.filter((a) => a.attendance_status === 'LEAVE').length,
  };
  const attendancePercentage = stats.total_classes > 0
    ? Math.round((stats.present / stats.total_classes) * 1000) / 10
    : 0;

  // Announcements targeted at this student or all
  const announcements = db.prepare(`
    SELECT * FROM announcements
    WHERE master_id = ? AND status = 'PUBLISHED'
    ORDER BY publish_date DESC LIMIT 5
  `).all(masterId);

  res.json({
    personal_info: {
      id: student.id,
      name: student.student_name,
      code: student.student_code,
      dob: student.dob || '2010-01-12',
      gender: 'Male',
      blood_group: 'O+',
      phone: student.phone || '+91 98402 11223',
      email: student.email || `${student.student_code.toLowerCase()}@koms.in`,
      guardian_name: student.guardian_name || 'Parent / Guardian',
      guardian_phone: student.guardian_phone || student.phone || '+91 98402 11223',
      address: student.address || 'Chennai, Tamil Nadu',
      joining_date: student.joining_date,
      profile_image: student.profile_image || '/assets/card_student_gi.jpg',
    },
    training_info: {
      rank: student.rank,
      dojo_name: master?.dojo_name || 'Ranga Nagar Dojo',
      master_name: master?.name || 'Sensei Rubeshwaren',
      status: student.status,
      attendance_percentage: attendancePercentage,
      total_attended: stats.present,
      total_absent: stats.absent,
      total_leave: stats.leave,
    },
    fee_history: {
      monthly_fee: student.monthly_fee || 1000,
      payments: feePayments,
    },
    attendance_history: attendanceRecords,
    class_history: attendanceRecords.map((a) => ({
      class_date: a.class_date,
      timing: `${a.start_time} - ${a.end_time}`,
      session_type: a.session_type || 'Regular Training',
      status: a.attendance_status,
      title: a.title,
    })),
    announcements,
    account_info: {
      status: student.status,
      paused_date: student.paused_date,
      paused_reason: student.paused_reason,
      created_at: student.created_at,
    },
  });
});

// Update Student Info, Belt Rank, and Fee Settings
router.put('/:id', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const studentId = Number(req.params.id);
  const {
    student_name,
    dob,
    phone,
    email,
    guardian_name,
    guardian_phone,
    address,
    rank,
    monthly_fee,
    status,
  } = req.body;

  const existing = db.prepare('SELECT * FROM students WHERE id = ? AND master_id = ?').get(studentId, masterId);
  if (!existing) {
    return res.status(404).json({ error: 'Student not found in your dojo.' });
  }

  try {
    const updateStmt = db.prepare(`
      UPDATE students SET
        student_name = coalesce(?, student_name),
        dob = coalesce(?, dob),
        phone = coalesce(?, phone),
        email = coalesce(?, email),
        guardian_name = coalesce(?, guardian_name),
        guardian_phone = coalesce(?, guardian_phone),
        address = coalesce(?, address),
        rank = coalesce(?, rank),
        monthly_fee = coalesce(?, monthly_fee),
        status = coalesce(?, status)
      WHERE id = ? AND master_id = ?
    `);

    updateStmt.run(
      student_name ? student_name.trim() : null,
      dob || null,
      phone || null,
      email || null,
      guardian_name || null,
      guardian_phone || null,
      address || null,
      rank || null,
      monthly_fee !== undefined ? Number(monthly_fee) : null,
      status || null,
      studentId,
      masterId
    );

    const updated = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
    res.json({ success: true, message: 'Student information updated successfully.', student: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update student: ' + err.message });
  }
});

// Update Belt Rank
router.patch('/:id/belt', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const studentId = Number(req.params.id);
  const { rank } = req.body;

  if (!rank || !rank.trim()) {
    return res.status(400).json({ error: 'Belt rank is required.' });
  }

  try {
    db.prepare('UPDATE students SET rank = ? WHERE id = ? AND master_id = ?').run(rank.trim(), studentId, masterId);
    res.json({ success: true, message: `Belt rank updated to ${rank}.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update belt: ' + err.message });
  }
});

// Activate or Deactivate Account (Never permanently delete students with historical records)
router.patch('/:id/status', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const studentId = Number(req.params.id);
  const { status, reason } = req.body; // 'active' or 'inactive'

  if (!['active', 'inactive', 'paused', 'discontinued'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value.' });
  }

  try {
    const pausedDate = status !== 'active' ? new Date().toISOString().split('T')[0] : null;
    db.prepare(`
      UPDATE students SET
        status = ?,
        paused_date = ?,
        paused_reason = ?
      WHERE id = ? AND master_id = ?
    `).run(status, pausedDate, reason || null, studentId, masterId);

    res.json({ success: true, message: `Student status changed to ${status}.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change student status: ' + err.message });
  }
});
