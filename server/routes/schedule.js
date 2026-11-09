import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../auth.js';
import { 
  changeWeeklySchedule, 
  generateSessionsForRange, 
  WEEKDAY_NAMES,
  formatDate,
  parseDate
} from '../scheduler.js';

const router = express.Router();
router.use(authMiddleware);

// Get currently active weekly schedule
router.get('/active', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;

  const schedule = db.prepare(`
    SELECT * FROM weekly_schedules 
    WHERE master_id = ? AND is_active = 1
    ORDER BY id DESC LIMIT 1
  `).get(masterId);

  if (!schedule) {
    return res.json({
      active: false,
      schedule: null,
      weekTable: WEEKDAY_NAMES.map((name, index) => ({
        weekday: index,
        dayName: name,
        hasClass: false,
        timing: '—'
      }))
    });
  }

  const daysRows = db.prepare(`
    SELECT weekday FROM schedule_days WHERE weekly_schedule_id = ? ORDER BY weekday ASC
  `).all(schedule.id);

  const activeDays = daysRows.map(r => r.weekday);
  const activeDaysSet = new Set(activeDays);

  // Helper to format 24h '18:30' to '6:30 PM'
  function formatTime(t) {
    if (!t) return '—';
    const [hh, mm] = t.split(':').map(Number);
    const period = hh >= 12 ? 'PM' : 'AM';
    const hour12 = hh % 12 || 12;
    return `${hour12}:${String(mm).padStart(2, '0')} ${period}`;
  }

  const timingDisplay = `${formatTime(schedule.start_time)} – ${formatTime(schedule.end_time)}`;

  // Display week table ordered starting from Monday (1..6, 0) or Sunday (0..6)
  // Standard business order: Monday to Sunday
  const orderedWeekdays = [1, 2, 3, 4, 5, 6, 0];
  const weekTable = orderedWeekdays.map(dayIndex => ({
    weekday: dayIndex,
    dayName: WEEKDAY_NAMES[dayIndex],
    hasClass: activeDaysSet.has(dayIndex),
    timing: activeDaysSet.has(dayIndex) ? timingDisplay : '—'
  }));

  // Session summary for active schedule
  const sessionStats = db.prepare(`
    SELECT 
      COUNT(*) as total_sessions,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_sessions,
      SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled_sessions,
      MIN(class_date) as earliest_class,
      MAX(class_date) as latest_class
    FROM class_sessions
    WHERE master_id = ? AND weekly_schedule_id = ?
  `).get(masterId, schedule.id);

  res.json({
    active: true,
    schedule: {
      ...schedule,
      days: activeDays,
      timingDisplay,
      stats: sessionStats
    },
    weekTable
  });
});

// Get historical schedule changes
router.get('/history', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const schedules = db.prepare(`
    SELECT * FROM weekly_schedules 
    WHERE master_id = ? 
    ORDER BY id DESC
  `).all(masterId);

  const enriched = schedules.map(s => {
    const days = db.prepare('SELECT weekday FROM schedule_days WHERE weekly_schedule_id = ?').all(s.id).map(r => r.weekday);
    return {
      ...s,
      days,
      dayNames: days.map(d => WEEKDAY_NAMES[d]).join(', ')
    };
  });

  res.json({ history: enriched });
});

// Configure or update weekly schedule (Section 3 & Section 11)
router.post('/', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const {
    effective_from,
    start_time,
    end_time,
    days,
    replaceFutureUncompleted = true
  } = req.body;

  if (!effective_from || !start_time || !end_time || !Array.isArray(days) || days.length === 0) {
    return res.status(400).json({ 
      error: 'Please provide effective_from (YYYY-MM-DD), start_time (HH:MM), end_time (HH:MM), and at least one day.' 
    });
  }

  try {
    const result = changeWeeklySchedule(db, masterId, {
      effective_from,
      start_time,
      end_time,
      days: days.map(Number),
      replaceFutureUncompleted: Boolean(replaceFutureUncompleted)
    });

    res.json({
      success: true,
      message: 'Weekly schedule updated and sessions successfully generated.',
      ...result
    });
  } catch (err) {
    console.error('Error changing weekly schedule:', err);
    res.status(500).json({ error: 'Failed to update schedule: ' + err.message });
  }
});

// Idempotently generate sessions for arbitrary range (e.g., across future years or specific months)
router.post('/generate-range', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const { start_date, end_date } = req.body;

  if (!start_date || !end_date) {
    return res.status(400).json({ error: 'start_date and end_date are required (YYYY-MM-DD)' });
  }

  try {
    const createdCount = generateSessionsForRange(db, masterId, start_date, end_date);
    res.json({
      success: true,
      message: `Generated ${createdCount} class sessions for the period.`,
      createdCount
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate sessions: ' + err.message });
  }
});

export default router;

