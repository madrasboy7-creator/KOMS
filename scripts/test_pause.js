import { db } from '../server/db.js';

try {
  db.exec('ALTER TABLE students ADD COLUMN paused_date TEXT;');
  db.exec('ALTER TABLE students ADD COLUMN paused_reason TEXT;');
  console.log('Columns paused_date and paused_reason added.');
} catch (e) {
  console.log('Add columns note:', e.message);
}

try {
  db.prepare("UPDATE students SET status = 'paused' WHERE id = 1").run();
  console.log('Status paused accepted!');
  db.prepare("UPDATE students SET status = 'active' WHERE id = 1").run();
} catch (e) {
  console.log('Status paused error:', e.message);
}

