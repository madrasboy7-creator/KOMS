/**
 * KOMS Recurring Weekly Scheduling Engine
 * Idempotent, robust class session generator and schedule manager
 */

// Format Date object to 'YYYY-MM-DD'
export function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Parse 'YYYY-MM-DD' safely at noon to avoid DST edge cases
export function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

// Day of week names mapping
export const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

/**
 * Generate class sessions for a specific master over a date range.
 * Idempotent: uses database-level UNIQUE (weekly_schedule_id, class_date)
 * and does not overwrite existing or completed sessions.
 */
export function generateSessionsForRange(db, masterId, startDateStr, endDateStr) {
  // Query all schedules overlapping with [startDateStr, endDateStr]
  const schedulesStmt = db.prepare(`
    SELECT * FROM weekly_schedules 
    WHERE master_id = ? 
      AND effective_from <= ? 
      AND (effective_until IS NULL OR effective_until >= ?)
    ORDER BY effective_from ASC
  `);
  const schedules = schedulesStmt.all(masterId, endDateStr, startDateStr);

  const getDaysStmt = db.prepare(`
    SELECT weekday FROM schedule_days WHERE weekly_schedule_id = ?
  `);

  const insertSessionStmt = db.prepare(`
    INSERT OR IGNORE INTO class_sessions 
      (master_id, weekly_schedule_id, class_date, start_time, end_time, status)
    VALUES (?, ?, ?, ?, ?, 'scheduled')
  `);

  let createdCount = 0;

  for (const schedule of schedules) {
    const daysRows = getDaysStmt.all(schedule.id);
    const activeWeekdays = new Set(daysRows.map(r => r.weekday));

    if (activeWeekdays.size === 0) continue;

    // Determine bounds for this schedule within the requested window
    const windowStart = schedule.effective_from > startDateStr ? schedule.effective_from : startDateStr;
    const windowEnd = (schedule.effective_until && schedule.effective_until < endDateStr) 
      ? schedule.effective_until 
      : endDateStr;

    const curr = parseDate(windowStart);
    const end = parseDate(windowEnd);

    while (curr <= end) {
      const dayOfWeek = curr.getDay(); // 0 = Sunday, 6 = Saturday
      if (activeWeekdays.has(dayOfWeek)) {
        const dateStr = formatDate(curr);
        const res = insertSessionStmt.run(
          masterId,
          schedule.id,
          dateStr,
          schedule.start_time,
          schedule.end_time
        );
        if (res.changes > 0) {
          createdCount++;
        }
      }
      curr.setDate(curr.getDate() + 1);
    }
  }

  return createdCount;
}

/**
 * Ensures sessions exist for the current month and upcoming months.
 * By default generates for current month and next 3 months.
 */
export function ensureUpcomingSessions(db, masterId, monthsAhead = 3) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 12, 0, 0);
  const endOfTargetMonth = new Date(now.getFullYear(), now.getMonth() + monthsAhead + 1, 0, 12, 0, 0);

  return generateSessionsForRange(
    db,
    masterId,
    formatDate(startOfMonth),
    formatDate(endOfTargetMonth)
  );
}

/**
 * Ensures sessions exist for a specific year and month (1-indexed).
 */
export function ensureSessionsForMonth(db, masterId, year, month) {
  const startOfMonth = new Date(year, month - 1, 1, 12, 0, 0);
  const endOfMonth = new Date(year, month, 0, 12, 0, 0);

  return generateSessionsForRange(
    db,
    masterId,
    formatDate(startOfMonth),
    formatDate(endOfMonth)
  );
}

/**
 * Change or configure weekly schedule with an effective date.
 * Enforces Section 11 requirements:
 * - Preserves previous class sessions and completed attendance.
 * - Handles future uncompleted sessions cleanly.
 * - Idempotently generates future sessions from effective_from onwards.
 * - Executes in a single database transaction.
 */
export function changeWeeklySchedule(db, masterId, {
  effective_from,
  start_time,
  end_time,
  days, // Array of weekday numbers, e.g. [6, 0] or [5, 6, 0]
  replaceFutureUncompleted = true
}) {
  if (!effective_from || !start_time || !end_time || !Array.isArray(days) || days.length === 0) {
    throw new Error('Missing required schedule parameters (effective_from, start_time, end_time, days)');
  }

  // Calculate day prior to effective_from for effective_until of previous schedule
  const effDate = parseDate(effective_from);
  const prevDate = new Date(effDate);
  prevDate.setDate(prevDate.getDate() - 1);
  const effectiveUntilPrev = formatDate(prevDate);

  db.exec('BEGIN IMMEDIATE;');

  try {
    // 1. Get current active schedule(s) for this master
    const activeSchedulesStmt = db.prepare(`
      SELECT id, effective_from FROM weekly_schedules 
      WHERE master_id = ? AND is_active = 1
    `);
    const activeSchedules = activeSchedulesStmt.all(masterId);

    // 2. Terminate active schedules prior to the new effective date
    const updateActiveStmt = db.prepare(`
      UPDATE weekly_schedules 
      SET effective_until = ?, is_active = 0 
      WHERE id = ?
    `);
    for (const active of activeSchedules) {
      updateActiveStmt.run(effectiveUntilPrev, active.id);
    }

    // 3. Handle existing future uncompleted sessions if requested
    if (replaceFutureUncompleted) {
      // Never delete sessions that have attendance records!
      const deleteFutureStmt = db.prepare(`
        DELETE FROM class_sessions 
        WHERE master_id = ? 
          AND class_date >= ? 
          AND status = 'scheduled'
          AND id NOT IN (SELECT DISTINCT class_session_id FROM attendance_records)
      `);
      deleteFutureStmt.run(masterId, effective_from);
    }

    // 4. Insert the new active schedule
    const insertScheduleStmt = db.prepare(`
      INSERT INTO weekly_schedules 
        (master_id, effective_from, effective_until, start_time, end_time, is_active)
      VALUES (?, ?, NULL, ?, ?, 1)
    `);
    const scheduleRes = insertScheduleStmt.run(masterId, effective_from, start_time, end_time);
    const newScheduleId = Number(scheduleRes.lastInsertRowid);

    // 5. Insert schedule days
    const insertDayStmt = db.prepare(`
      INSERT INTO schedule_days (weekly_schedule_id, weekday) VALUES (?, ?)
    `);
    for (const d of days) {
      const weekdayNum = Number(d);
      if (weekdayNum >= 0 && weekdayNum <= 6) {
        insertDayStmt.run(newScheduleId, weekdayNum);
      }
    }

    // 6. Generate sessions for the new schedule from effective_from up to 4 months ahead
    const targetEnd = new Date(effDate);
    targetEnd.setMonth(targetEnd.getMonth() + 4);
    const targetEndStr = formatDate(targetEnd);

    // Internal generate call inside the open transaction
    const getDaysStmt = db.prepare(`
      SELECT weekday FROM schedule_days WHERE weekly_schedule_id = ?
    `);
    const activeWeekdays = new Set(getDaysStmt.all(newScheduleId).map(r => r.weekday));

    const insertSessionStmt = db.prepare(`
      INSERT OR IGNORE INTO class_sessions 
        (master_id, weekly_schedule_id, class_date, start_time, end_time, status)
      VALUES (?, ?, ?, ?, ?, 'scheduled')
    `);

    let generatedCount = 0;
    const curr = parseDate(effective_from);
    const end = parseDate(targetEndStr);

    while (curr <= end) {
      if (activeWeekdays.has(curr.getDay())) {
        const dateStr = formatDate(curr);
        const res = insertSessionStmt.run(
          masterId,
          newScheduleId,
          dateStr,
          start_time,
          end_time
        );
        if (res.changes > 0) {
          generatedCount++;
        }
      }
      curr.setDate(curr.getDate() + 1);
    }

    db.exec('COMMIT;');

    return {
      success: true,
      scheduleId: newScheduleId,
      effective_from,
      generatedCount
    };
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

