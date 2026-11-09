import { db } from '../server/db.js';

try {
  db.exec('PRAGMA foreign_keys = OFF;');
  db.exec('BEGIN IMMEDIATE;');
  db.exec(`
    CREATE TABLE IF NOT EXISTS students_new (
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

    INSERT INTO students_new (id, master_id, student_name, student_code, joining_date, status, rank, paused_date, paused_reason, created_at)
    SELECT id, master_id, student_name, student_code, joining_date, status, rank, paused_date, paused_reason, created_at FROM students;

    DROP TABLE students;
    ALTER TABLE students_new RENAME TO students;
    CREATE INDEX IF NOT EXISTS idx_students_master ON students(master_id, status);
  `);
  db.exec('COMMIT;');
  db.exec('PRAGMA foreign_keys = ON;');
  console.log('Students table migrated successfully to allow paused and discontinued status.');

  // Test updating status to paused
  db.prepare("UPDATE students SET status = 'paused', paused_date = '2026-11-20', paused_reason = 'Discontinued class' WHERE id = 15").run();
  const st15 = db.prepare('SELECT id, student_name, status, paused_date, paused_reason FROM students WHERE id = 15').get();
  console.log('Student 15 test:', st15);
  // Restore
  db.prepare("UPDATE students SET status = 'inactive', paused_date = NULL, paused_reason = NULL WHERE id = 15").run();
} catch (e) {
  try { db.exec('ROLLBACK;'); } catch (r) {}
  console.error('Migration failed:', e);
}

