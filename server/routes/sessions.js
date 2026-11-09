import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../auth.js';
import { 
  ensureSessionsForMonth, 
  ensureUpcomingSessions, 
  WEEKDAY_NAMES,
  parseDate,
  formatDate
} from '../scheduler.js';

const router = express.Router();
router.use(authMiddleware);

// Helper to format date display
function formatFullDate(dateStr) {
  const d = parseDate(dateStr);
  const weekday = WEEKDAY_NAMES[d.getDay()];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${weekday}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// Helper for 12h time
function formatTime12(t) {
  if (!t) return '';
  const [hh, mm] = t.split(':').map(Number);
  const period = hh >= 12 ? 'PM' : 'AM';
  const hour12 = hh % 12 || 12;
  return `${hour12}:${String(mm).padStart(2, '0')} ${period}`;
}

// List sessions for master
router.get('/', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const { month, from, to, status } = req.query;

  // If a month (YYYY-MM) is specified, ensure it is generated
  let startDate = from;
  let endDate = to;

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split('-').map(Number);
    ensureSessionsForMonth(db, masterId, y, m);
    startDate = `${month}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    endDate = `${month}-${String(lastDay).padStart(2, '0')}`;
  } else if (!startDate && !endDate) {
    // Default to current rolling window
    ensureUpcomingSessions(db, masterId, 2);
    const now = new Date();
    const currMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    startDate = `${currMonth}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    endDate = `${currMonth}-${String(lastDay).padStart(2, '0')}`;
  }

  let query = `
    SELECT 
      cs.*,
      (SELECT COUNT(*) FROM students WHERE master_id = ? AND status = 'active') as active_students_count,
      (SELECT COUNT(*) FROM attendance_records WHERE class_session_id = cs.id AND attendance_status = 'PRESENT') as present_count,
      (SELECT COUNT(*) FROM attendance_records WHERE class_session_id = cs.id AND attendance_status = 'ABSENT') as absent_count,
      (SELECT COUNT(*) FROM attendance_records WHERE class_session_id = cs.id AND attendance_status = 'LEAVE') as leave_count,
      (SELECT COUNT(*) FROM attendance_records WHERE class_session_id = cs.id) as total_marked
    FROM class_sessions cs
    WHERE cs.master_id = ?
  `;
  const params = [masterId, masterId];

  if (startDate) {
    query += ` AND cs.class_date >= ?`;
    params.push(startDate);
  }
  if (endDate) {
    query += ` AND cs.class_date <= ?`;
    params.push(endDate);
  }
  if (status) {
    query += ` AND cs.status = ?`;
    params.push(status);
  }

  query += ` ORDER BY cs.class_date ASC, cs.start_time ASC`;

  const sessions = db.prepare(query).all(...params);

  // Today's date reference
  const todayStr = formatDate(new Date());

  const enriched = sessions.map(s => {
    const d = parseDate(s.class_date);
    const weekday = d.getDay();
    const isToday = s.class_date === todayStr;
    const isPast = s.class_date < todayStr;
    const isFuture = s.class_date > todayStr;

    const unmarked_count = Math.max(0, s.active_students_count - s.total_marked);

    let completionStatus = 'UPCOMING';
    if (s.status === 'cancelled') {
      completionStatus = 'CANCELLED';
    } else if (s.status === 'completed' || s.total_marked > 0) {
      completionStatus = 'COMPLETED';
    } else if (isPast || isToday) {
      completionStatus = 'PENDING';
    }

    return {
      ...s,
      weekday,
      weekday_name: WEEKDAY_NAMES[weekday],
      formatted_date: formatFullDate(s.class_date),
      timing_display: `${formatTime12(s.start_time)} – ${formatTime12(s.end_time)}`,
      is_today: isToday,
      is_past: isPast,
      is_future: isFuture,
      unmarked_count,
      completion_status: completionStatus
    };
  });

  res.json({
    sessions: enriched,
    range: { startDate, endDate }
  });
});

// Get upcoming classes (next 14 days)
router.get('/upcoming', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const todayStr = formatDate(new Date());

  const sessions = db.prepare(`
    SELECT cs.*,
      (SELECT COUNT(*) FROM students WHERE master_id = ? AND status = 'active') as active_students_count,
      (SELECT COUNT(*) FROM attendance_records WHERE class_session_id = cs.id AND attendance_status = 'PRESENT') as present_count
    FROM class_sessions cs
    WHERE cs.master_id = ? AND cs.class_date >= ? AND cs.status != 'cancelled'
    ORDER BY cs.class_date ASC, cs.start_time ASC
    LIMIT 10
  `).all(masterId, masterId, todayStr);

  const enriched = sessions.map(s => ({
    ...s,
    weekday_name: WEEKDAY_NAMES[parseDate(s.class_date).getDay()],
    formatted_date: formatFullDate(s.class_date),
    timing_display: `${formatTime12(s.start_time)} – ${formatTime12(s.end_time)}`,
    is_today: s.class_date === todayStr
  }));

  res.json({ upcoming: enriched });
});

// Get today's classes
router.get('/today', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const todayStr = formatDate(new Date());

  const sessions = db.prepare(`
    SELECT cs.*,
      (SELECT COUNT(*) FROM students WHERE master_id = ? AND status = 'active') as active_students_count,
      (SELECT COUNT(*) FROM attendance_records WHERE class_session_id = cs.id AND attendance_status = 'PRESENT') as present_count,
      (SELECT COUNT(*) FROM attendance_records WHERE class_session_id = cs.id AND attendance_status = 'ABSENT') as absent_count,
      (SELECT COUNT(*) FROM attendance_records WHERE class_session_id = cs.id AND attendance_status = 'LEAVE') as leave_count,
      (SELECT COUNT(*) FROM attendance_records WHERE class_session_id = cs.id) as total_marked
    FROM class_sessions cs
    WHERE cs.master_id = ? AND cs.class_date = ?
    ORDER BY cs.start_time ASC
  `).all(masterId, masterId, todayStr);

  const enriched = sessions.map(s => ({
    ...s,
    weekday_name: WEEKDAY_NAMES[parseDate(s.class_date).getDay()],
    formatted_date: formatFullDate(s.class_date),
    timing_display: `${formatTime12(s.start_time)} – ${formatTime12(s.end_time)}`
  }));

  res.json({ today: enriched, todayDate: todayStr });
});

// Get single session details with ownership verification
router.get('/:id', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const sessionId = Number(req.params.id);

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

  const d = parseDate(session.class_date);
  res.json({
    session: {
      ...session,
      weekday_name: WEEKDAY_NAMES[d.getDay()],
      formatted_date: formatFullDate(session.class_date),
      timing_display: `${formatTime12(session.start_time)} – ${formatTime12(session.end_time)}`
    }
  });
});

// Cancel a session
router.post('/:id/cancel', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const sessionId = Number(req.params.id);

  const session = db.prepare('SELECT * FROM class_sessions WHERE id = ?').get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Class session not found' });
  }
  if (session.master_id !== masterId) {
    return res.status(403).json({ error: 'Access denied: Class session belongs to another Master' });
  }

  db.prepare("UPDATE class_sessions SET status = 'cancelled' WHERE id = ?").run(sessionId);
  res.json({ success: true, message: 'Class session cancelled successfully' });
});

// Restore / uncancel a session
router.post('/:id/uncancel', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const sessionId = Number(req.params.id);

  const session = db.prepare('SELECT * FROM class_sessions WHERE id = ?').get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Class session not found' });
  }
  if (session.master_id !== masterId) {
    return res.status(403).json({ error: 'Access denied: Class session belongs to another Master' });
  }

  db.prepare("UPDATE class_sessions SET status = 'scheduled' WHERE id = ?").run(sessionId);
  res.json({ success: true, message: 'Class session restored' });
});

// Create ad-hoc or past class session
router.post('/create-ad-hoc', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const { class_date, start_time = '18:30', end_time = '20:30' } = req.body;

  if (!class_date || !/^\d{4}-\d{2}-\d{2}$/.test(class_date)) {
    return res.status(400).json({ error: 'Valid class_date is required (YYYY-MM-DD)' });
  }

  // Check if session already exists on this date
  const existing = db.prepare('SELECT id FROM class_sessions WHERE master_id = ? AND class_date = ?').get(masterId, class_date);
  if (existing) {
    return res.json({
      success: true,
      message: 'Class session already exists on this date',
      session_id: existing.id
    });
  }

  const result = db.prepare(`
    INSERT INTO class_sessions (master_id, class_date, start_time, end_time, status)
    VALUES (?, ?, ?, ?, 'scheduled')
  `).run(masterId, class_date, start_time, end_time);

  res.json({
    success: true,
    message: 'Class session created successfully.',
    session_id: Number(result.lastInsertRowid)
  });
});

export default router;


// Reschedule a session
router.patch('/:id/reschedule', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const sessionId = Number(req.params.id);
  const { new_date, new_start_time, new_end_time, reason = 'Master rescheduled session' } = req.body;

  if (!new_date || !/^\d{4}-\d{2}-\d{2}$/.test(new_date)) {
    return res.status(400).json({ error: 'Valid new_date (YYYY-MM-DD) is required.' });
  }

  const session = db.prepare('SELECT * FROM class_sessions WHERE id = ? AND master_id = ?').get(sessionId, masterId);
  if (!session) {
    return res.status(404).json({ error: 'Class session not found.' });
  }

  try {
    db.prepare(`
      UPDATE class_sessions SET
        class_date = ?,
        start_time = coalesce(?, start_time),
        end_time = coalesce(?, end_time),
        reschedule_reason = ?
      WHERE id = ? AND master_id = ?
    `).run(new_date, new_start_time || null, new_end_time || null, reason, sessionId, masterId);

    const updated = db.prepare('SELECT * FROM class_sessions WHERE id = ?').get(sessionId);
    res.json({ success: true, message: `Class rescheduled to ${new_date}.`, session: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reschedule session: ' + err.message });
  }
});

// Add one-off class without modifying weekly schedule
router.post('/one-off', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const { class_date, start_time = '18:30', end_time = '20:30', title = 'Special Training Session', session_type = 'Special Training', notes = '' } = req.body;

  if (!class_date || !/^\d{4}-\d{2}-\d{2}$/.test(class_date)) {
    return res.status(400).json({ error: 'Valid class_date is required (YYYY-MM-DD).' });
  }

  try {
    const insertStmt = db.prepare(`
      INSERT INTO class_sessions (master_id, class_date, start_time, end_time, session_type, title, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')
    `);
    const result = insertStmt.run(masterId, class_date, start_time, end_time, session_type, title, notes);
    const created = db.prepare('SELECT * FROM class_sessions WHERE id = ?').get(Number(result.lastInsertRowid));

    res.json({ success: true, message: `Special session '${title}' added for ${class_date}.`, session: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add one-off class: ' + err.message });
  }
});
