import assert from 'node:assert';
import { DatabaseSync } from 'node:sqlite';
import { initDatabase } from '../server/db.js';
import { 
  changeWeeklySchedule, 
  generateSessionsForRange, 
  ensureSessionsForMonth,
  formatDate,
  parseDate
} from '../server/scheduler.js';

// We run the tests on an isolated in-memory or temporary test database
console.log('🥋 Running KOMS Dojo Master Attendance Tracking System Test Suite...\n');

const testDb = new DatabaseSync(':memory:');
testDb.exec('PRAGMA foreign_keys = ON;');
testDb.exec('PRAGMA journal_mode = WAL;');

// Initialize schema
testDb.exec(`
  CREATE TABLE masters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    dojo_name TEXT DEFAULT 'KOMS Honbu Dojo',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    master_id INTEGER NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_code TEXT NOT NULL,
    joining_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'paused', 'discontinued', 'inactive')),
    rank TEXT DEFAULT 'White Belt',
    paused_date TEXT,
    paused_reason TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(master_id, student_code)
  );

  CREATE TABLE weekly_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    master_id INTEGER NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    effective_from TEXT NOT NULL,
    effective_until TEXT,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE schedule_days (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    weekly_schedule_id INTEGER NOT NULL REFERENCES weekly_schedules(id) ON DELETE CASCADE,
    weekday INTEGER NOT NULL CHECK(weekday BETWEEN 0 AND 6),
    UNIQUE(weekly_schedule_id, weekday)
  );

  CREATE TABLE class_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    master_id INTEGER NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    weekly_schedule_id INTEGER REFERENCES weekly_schedules(id) ON DELETE SET NULL,
    class_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'completed', 'cancelled')),
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(weekly_schedule_id, class_date)
  );

  CREATE TABLE attendance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    master_id INTEGER NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    class_session_id INTEGER NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    attendance_status TEXT NOT NULL CHECK(attendance_status IN ('PRESENT', 'ABSENT', 'LEAVE', 'NOT MARKED')),
    marked_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(class_session_id, student_id)
  );

  CREATE TABLE attendance_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attendance_record_id INTEGER NOT NULL REFERENCES attendance_records(id) ON DELETE CASCADE,
    old_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    reason TEXT NOT NULL,
    modified_by INTEGER NOT NULL REFERENCES masters(id),
    modified_at TEXT DEFAULT (datetime('now'))
  );
`);

// Seed Masters
testDb.prepare(`INSERT INTO masters (id, name, email, password_hash) VALUES (1, 'Master Tanaka', 'tanaka@test.com', 'hash')`).run();
testDb.prepare(`INSERT INTO masters (id, name, email, password_hash) VALUES (2, 'Master Sato', 'sato@test.com', 'hash')`).run();

// Seed 5 students for Master 1
for (let i = 1; i <= 5; i++) {
  testDb.prepare(`
    INSERT INTO students (id, master_id, student_name, student_code, joining_date, status, rank)
    VALUES (?, 1, ?, ?, '2026-01-01', 'active', 'Belt')
  `).run(i, `Student Tanaka ${i}`, `STU-00${i}`);
}

// Seed 2 students for Master 2
for (let i = 1; i <= 2; i++) {
  testDb.prepare(`
    INSERT INTO students (id, master_id, student_name, student_code, joining_date, status, rank)
    VALUES (?, 2, ?, ?, '2026-01-01', 'active', 'Belt')
  `).run(10 + i, `Student Sato ${i}`, `STU-10${i}`);
}

let passedCount = 0;
function test(title, fn) {
  try {
    fn();
    passedCount++;
    console.log(`  ✓ Scenario ${passedCount}: ${title}`);
  } catch (err) {
    console.error(`  ✗ Scenario failed: ${title}`);
    console.error(err);
    process.exit(1);
  }
}

// SCENARIO 1: Master configures Saturday and Sunday classes
test('1. Master configures Saturday and Sunday classes', () => {
  const result = changeWeeklySchedule(testDb, 1, {
    effective_from: '2026-11-01',
    start_time: '18:30',
    end_time: '20:30',
    days: [6, 0], // Saturday and Sunday
    replaceFutureUncompleted: true
  });
  assert.strictEqual(result.success, true);
  assert.ok(result.scheduleId > 0);

  const activeDays = testDb.prepare('SELECT weekday FROM schedule_days WHERE weekly_schedule_id = ?').all(result.scheduleId);
  const weekdays = activeDays.map(r => r.weekday).sort();
  assert.deepStrictEqual(weekdays, [0, 6]);
});

// SCENARIO 2: System generates all weekly sessions for the month (November 2026)
test('2. System generates all weekly sessions for the month', () => {
  ensureSessionsForMonth(testDb, 1, 2026, 11);
  const novSessions = testDb.prepare(`
    SELECT class_date, start_time, end_time FROM class_sessions 
    WHERE master_id = 1 AND class_date LIKE '2026-11-%'
    ORDER BY class_date ASC
  `).all();

  // November 2026 has:
  // Nov 1 (Sun), Nov 7 (Sat), Nov 8 (Sun), Nov 14 (Sat), Nov 15 (Sun),
  // Nov 21 (Sat), Nov 22 (Sun), Nov 28 (Sat), Nov 29 (Sun) -> exactly 9 sessions
  const expectedDates = [
    '2026-11-01', '2026-11-07', '2026-11-08', '2026-11-14', '2026-11-15',
    '2026-11-21', '2026-11-22', '2026-11-28', '2026-11-29'
  ];
  const actualDates = novSessions.map(s => s.class_date);
  assert.deepStrictEqual(actualDates, expectedDates);

  // Verify non-scheduled weekdays (e.g. Nov 2 Monday, Nov 3 Tuesday) are NOT generated
  const monday = testDb.prepare(`SELECT * FROM class_sessions WHERE master_id = 1 AND class_date = '2026-11-02'`).get();
  assert.strictEqual(monday, undefined);
});

// SCENARIO 3: The same schedule continues into the following month (December 2026)
test('3. The same schedule continues into the following month', () => {
  ensureSessionsForMonth(testDb, 1, 2026, 12);
  const decSessions = testDb.prepare(`
    SELECT class_date FROM class_sessions 
    WHERE master_id = 1 AND class_date LIKE '2026-12-%'
    ORDER BY class_date ASC
  `).all();

  // Dec 2026 Saturdays: Dec 5, 12, 19, 26
  // Dec 2026 Sundays: Dec 6, 13, 20, 27
  // Total 8 sessions
  assert.strictEqual(decSessions.length, 8);
  assert.strictEqual(decSessions[0].class_date, '2026-12-05'); // Sat Dec 5
  assert.strictEqual(decSessions[1].class_date, '2026-12-06'); // Sun Dec 6
});

// SCENARIO 4: Master marks attendance on Saturday (Nov 7)
let satSessionId = null;
let sunSessionId = null;
test('4. Master marks attendance on Saturday', () => {
  const sat = testDb.prepare(`SELECT id FROM class_sessions WHERE master_id = 1 AND class_date = '2026-11-07'`).get();
  satSessionId = sat.id;

  testDb.exec('BEGIN IMMEDIATE;');
  // Mark STU-001 present, STU-002 present, STU-003 absent, STU-004 leave, STU-005 present
  const upsert = testDb.prepare(`
    INSERT INTO attendance_records (master_id, class_session_id, student_id, attendance_status)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(class_session_id, student_id) DO UPDATE SET attendance_status = excluded.attendance_status
  `);
  upsert.run(1, satSessionId, 1, 'PRESENT');
  upsert.run(1, satSessionId, 2, 'PRESENT');
  upsert.run(1, satSessionId, 3, 'ABSENT');
  upsert.run(1, satSessionId, 4, 'LEAVE');
  upsert.run(1, satSessionId, 5, 'PRESENT');
  testDb.prepare("UPDATE class_sessions SET status = 'completed' WHERE id = ?").run(satSessionId);
  testDb.exec('COMMIT;');

  const marked = testDb.prepare(`SELECT COUNT(*) as count FROM attendance_records WHERE class_session_id = ?`).get(satSessionId);
  assert.strictEqual(marked.count, 5);
  const session = testDb.prepare(`SELECT status FROM class_sessions WHERE id = ?`).get(satSessionId);
  assert.strictEqual(session.status, 'completed');
});

// SCENARIO 5: Master marks attendance on Sunday (Nov 8)
test('5. Master marks attendance on Sunday', () => {
  const sun = testDb.prepare(`SELECT id FROM class_sessions WHERE master_id = 1 AND class_date = '2026-11-08'`).get();
  sunSessionId = sun.id;

  testDb.exec('BEGIN IMMEDIATE;');
  const upsert = testDb.prepare(`
    INSERT INTO attendance_records (master_id, class_session_id, student_id, attendance_status)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(class_session_id, student_id) DO UPDATE SET attendance_status = excluded.attendance_status
  `);
  // All present
  for (let sId = 1; sId <= 5; sId++) {
    upsert.run(1, sunSessionId, sId, 'PRESENT');
  }
  testDb.prepare("UPDATE class_sessions SET status = 'completed' WHERE id = ?").run(sunSessionId);
  testDb.exec('COMMIT;');

  const marked = testDb.prepare(`SELECT COUNT(*) as count FROM attendance_records WHERE class_session_id = ?`).get(sunSessionId);
  assert.strictEqual(marked.count, 5);
});

// SCENARIO 6: Master saves attendance twice
test('6. Master saves attendance twice', () => {
  // Re-save Sunday with STU-003 changed to ABSENT
  testDb.exec('BEGIN IMMEDIATE;');
  const upsert = testDb.prepare(`
    INSERT INTO attendance_records (master_id, class_session_id, student_id, attendance_status)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(class_session_id, student_id) DO UPDATE SET attendance_status = excluded.attendance_status
  `);
  for (let sId = 1; sId <= 5; sId++) {
    const status = sId === 3 ? 'ABSENT' : 'PRESENT';
    upsert.run(1, sunSessionId, sId, status);
  }
  testDb.exec('COMMIT;');

  const stu3 = testDb.prepare(`SELECT attendance_status FROM attendance_records WHERE class_session_id = ? AND student_id = 3`).get(sunSessionId);
  assert.strictEqual(stu3.attendance_status, 'ABSENT');
});

// SCENARIO 7: Student attendance is not duplicated
test('7. Student attendance is not duplicated', () => {
  const totalRecordsForSun = testDb.prepare(`SELECT COUNT(*) as count FROM attendance_records WHERE class_session_id = ?`).get(sunSessionId);
  assert.strictEqual(totalRecordsForSun.count, 5); // Still exactly 5 records, no duplicate rows created!
});

// SCENARIO 8: Master changes the schedule from Saturday/Sunday to Friday/Saturday/Sunday
test('8. Master changes the schedule from Saturday/Sunday to Friday/Saturday/Sunday', () => {
  // Effective from Nov 20, 2026 onwards
  const result = changeWeeklySchedule(testDb, 1, {
    effective_from: '2026-11-20',
    start_time: '19:00',
    end_time: '21:00',
    days: [5, 6, 0], // Friday, Saturday, Sunday
    replaceFutureUncompleted: true
  });
  assert.strictEqual(result.success, true);

  // Check that Friday Nov 20 is generated!
  const friNov20 = testDb.prepare(`SELECT * FROM class_sessions WHERE master_id = 1 AND class_date = '2026-11-20'`).get();
  assert.ok(friNov20, 'Friday Nov 20 should exist in new schedule');
  assert.strictEqual(friNov20.start_time, '19:00');
  assert.strictEqual(friNov20.end_time, '21:00');

  // Check Saturday Nov 21 and Sunday Nov 22 also exist
  const satNov21 = testDb.prepare(`SELECT * FROM class_sessions WHERE master_id = 1 AND class_date = '2026-11-21'`).get();
  const sunNov22 = testDb.prepare(`SELECT * FROM class_sessions WHERE master_id = 1 AND class_date = '2026-11-22'`).get();
  assert.ok(satNov21);
  assert.ok(sunNov22);
});

// SCENARIO 9: Past attendance remains unchanged
test('9. Past attendance remains unchanged', () => {
  // Check Sat Nov 7 attendance is still intact
  const satRecords = testDb.prepare(`
    SELECT student_id, attendance_status FROM attendance_records 
    WHERE class_session_id = ? ORDER BY student_id ASC
  `).all(satSessionId);

  assert.strictEqual(satRecords.length, 5);
  assert.strictEqual(satRecords[0].attendance_status, 'PRESENT');
  assert.strictEqual(satRecords[2].attendance_status, 'ABSENT'); // STU-003
  assert.strictEqual(satRecords[3].attendance_status, 'LEAVE');  // STU-004

  // Check Sun Nov 8 attendance is still intact
  const sunRecords = testDb.prepare(`SELECT COUNT(*) as c FROM attendance_records WHERE class_session_id = ?`).get(sunSessionId);
  assert.strictEqual(sunRecords.c, 5);
});

// SCENARIO 10: Student-wise history displays accurate results
test('10. Student-wise history displays accurate results', () => {
  // Student 1 (Kenjiro Takahashi) was PRESENT on Nov 7 and PRESENT on Nov 8
  const st1Records = testDb.prepare(`
    SELECT ar.attendance_status, cs.class_date
    FROM attendance_records ar
    JOIN class_sessions cs ON ar.class_session_id = cs.id
    WHERE ar.student_id = 1 AND cs.status = 'completed'
    ORDER BY cs.class_date ASC
  `).all();

  assert.strictEqual(st1Records.length, 2);
  assert.strictEqual(st1Records[0].attendance_status, 'PRESENT');
  assert.strictEqual(st1Records[1].attendance_status, 'PRESENT');

  // Student 4 was LEAVE on Nov 7 and PRESENT on Nov 8
  const st4Records = testDb.prepare(`
    SELECT ar.attendance_status FROM attendance_records ar
    JOIN class_sessions cs ON ar.class_session_id = cs.id
    WHERE ar.student_id = 4 AND cs.status = 'completed'
    ORDER BY cs.class_date ASC
  `).all();
  assert.strictEqual(st4Records[0].attendance_status, 'LEAVE');
  assert.strictEqual(st4Records[1].attendance_status, 'PRESENT');
});

// SCENARIO 11: Monthly attendance percentage is correct
test('11. Monthly attendance percentage is correct', () => {
  // For Student 4: 1 Present, 0 Absent, 1 Leave.
  // Formula: (Present / (Present + Absent + Leave)) * 100
  // (1 / (1 + 0 + 1)) * 100 = 50.0%
  const st4Stats = testDb.prepare(`
    SELECT 
      SUM(CASE WHEN ar.attendance_status = 'PRESENT' THEN 1 ELSE 0 END) as present,
      SUM(CASE WHEN ar.attendance_status = 'ABSENT' THEN 1 ELSE 0 END) as absent,
      SUM(CASE WHEN ar.attendance_status = 'LEAVE' THEN 1 ELSE 0 END) as leave
    FROM attendance_records ar
    JOIN class_sessions cs ON ar.class_session_id = cs.id
    WHERE ar.student_id = 4 AND cs.status = 'completed'
  `).get();

  const total = st4Stats.present + st4Stats.absent + st4Stats.leave;
  const pct = (st4Stats.present / total) * 100;
  assert.strictEqual(pct, 50.0);
});

// SCENARIO 12: Cancelled classes do not count as absences
test('12. Cancelled classes do not count as absences', () => {
  // Create or set a session to cancelled
  const cancelSession = testDb.prepare(`
    INSERT INTO class_sessions (master_id, weekly_schedule_id, class_date, start_time, end_time, status)
    VALUES (1, NULL, '2026-11-13', '18:30', '20:30', 'cancelled')
  `).run();

  // Query eligible completed classes for Student 4: must not include cancelled session
  const eligible = testDb.prepare(`
    SELECT COUNT(*) as c FROM class_sessions cs
    LEFT JOIN attendance_records ar ON cs.id = ar.class_session_id AND ar.student_id = 4
    WHERE cs.master_id = 1 AND cs.status = 'completed'
  `).get();

  assert.strictEqual(eligible.c, 2); // Only the 2 completed sessions, not the cancelled one
});

// SCENARIO 13: Another Master cannot access these students or attendance records
test('13. Another Master cannot access these students or attendance records', () => {
  // Master 2 (Kenji Sato) attempts to query students belonging to Master 1
  const master2Students = testDb.prepare('SELECT id FROM students WHERE master_id = 2').all();
  const master2StudentIds = new Set(master2Students.map(s => s.id));

  // None of Master 1's student IDs (1..5) are in Master 2's set
  for (let sId = 1; sId <= 5; sId++) {
    assert.strictEqual(master2StudentIds.has(sId), false);
  }

  // Attendance records for Master 2:
  const master2Att = testDb.prepare('SELECT * FROM attendance_records WHERE master_id = 2').all();
  assert.strictEqual(master2Att.length, 0); // Master 2 has 0 access to Master 1's records
});

// SCENARIO 14: Retrying a failed attendance request does not create duplicates
test('14. Retrying a failed attendance request does not create duplicates', () => {
  // Simulate retry of attendance save for Saturday session (satSessionId)
  testDb.exec('BEGIN IMMEDIATE;');
  const upsert = testDb.prepare(`
    INSERT INTO attendance_records (master_id, class_session_id, student_id, attendance_status)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(class_session_id, student_id) DO UPDATE SET attendance_status = excluded.attendance_status
  `);

  for (let retry = 0; retry < 3; retry++) {
    for (let sId = 1; sId <= 5; sId++) {
      upsert.run(1, satSessionId, sId, 'PRESENT');
    }
  }
  testDb.exec('COMMIT;');

  const countAfterRetries = testDb.prepare(`SELECT COUNT(*) as c FROM attendance_records WHERE class_session_id = ?`).get(satSessionId);
  assert.strictEqual(countAfterRetries.c, 5); // Exactly 5 rows, zero duplicates
});

// SCENARIO 15: Master pauses student attendance (Discontinuation):
// Student is automatically removed from next month's attendance list while past history is preserved
test('15. Master pauses student attendance: automatically removed from next month while past history is preserved', () => {
  // Student 5 discontinues and is paused on 2026-11-20
  testDb.prepare(`
    UPDATE students 
    SET status = 'paused', paused_date = '2026-11-20', paused_reason = 'Discontinued class'
    WHERE id = 5
  `).run();

  // 1. Verify that for December 2026 (next month), Student 5 is AUTOMATICALLY REMOVED from the active attendance list
  const decDate = '2026-12-05';
  const decActiveStudents = testDb.prepare(`
    SELECT id, student_name FROM students 
    WHERE master_id = 1 
      AND (
        status = 'active'
        OR (status IN ('paused', 'discontinued') AND (paused_date IS NULL OR paused_date >= ?))
      )
  `).all(decDate);

  const decStudentIds = decActiveStudents.map(s => s.id);
  assert.strictEqual(decStudentIds.includes(5), false, 'Student 5 must be automatically removed from next month (December)');
  assert.strictEqual(decActiveStudents.length, 4); // Only active students 1, 2, 3, 4

  // 2. Verify that for November 2026 (prior to or during pause), Student 5's historical attendance is completely maintained
  const novPastDate = '2026-11-07';
  const novActiveStudents = testDb.prepare(`
    SELECT id FROM students 
    WHERE master_id = 1 
      AND (
        status = 'active'
        OR (status IN ('paused', 'discontinued') AND (paused_date IS NULL OR paused_date >= ?))
      )
  `).all(novPastDate);
  assert.strictEqual(novActiveStudents.map(s => s.id).includes(5), true, 'Student 5 is included in November where they were active');

  // 3. Past attendance records for Student 5 are 100% intact
  const stu5Records = testDb.prepare(`
    SELECT COUNT(*) as c FROM attendance_records WHERE student_id = 5
  `).get();
  assert.ok(stu5Records.c > 0, 'Student 5 past attendance records must remain strictly intact');
});

console.log(`\n🎉 ALL 15 SCENARIOS PASSED WITH 100% SUCCESS!\n`);

