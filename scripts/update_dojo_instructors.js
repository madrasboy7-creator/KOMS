import { db } from '../server/db.js';

console.log('🔄 Updating Dojo name and Instructors in koms.db...');

db.exec('BEGIN IMMEDIATE;');

try {
  // 1. Update Master 1 to Sensei Rubeshwaren at Ranga Nagar
  db.prepare(`
    UPDATE masters 
    SET name = 'Sensei Rubeshwaren', 
        email = 'rubeshwaren@koms.dojo', 
        dojo_name = 'Ranga Nagar' 
    WHERE id = 1
  `).run();

  // 2. Update Master 2 to Sensei Janathanan at Ranga Nagar
  db.prepare(`
    UPDATE masters 
    SET name = 'Sensei Janathanan', 
        email = 'janathanan@koms.dojo', 
        dojo_name = 'Ranga Nagar' 
    WHERE id = 2
  `).run();

  // 3. Move any students previously under master_id 2 to master_id 1 so all belong to Ranga Nagar
  const movedStudents = db.prepare(`
    UPDATE students 
    SET master_id = 1 
    WHERE master_id = 2
  `).run();
  console.log(`Moved ${movedStudents.changes} student(s) to Ranga Nagar (master_id 1)`);

  // 4. Clean up any obsolete schedules/sessions that belonged to master_id 2
  const delSessions = db.prepare(`DELETE FROM class_sessions WHERE master_id = 2`).run();
  console.log(`Cleaned up ${delSessions.changes} old master 2 session(s)`);

  const delSchedules = db.prepare(`DELETE FROM weekly_schedules WHERE master_id = 2`).run();
  console.log(`Cleaned up ${delSchedules.changes} old master 2 schedule(s)`);

  db.exec('COMMIT;');
  console.log('✅ Dojo and Instructors successfully updated in koms.db!');
} catch (err) {
  db.exec('ROLLBACK;');
  console.error('❌ Failed to update:', err);
  process.exit(1);
}

// Print updated masters and counts
const masters = db.prepare('SELECT id, name, email, dojo_name FROM masters').all();
console.log('\nUpdated Masters:');
console.table(masters);

const studentCount = db.prepare('SELECT count(*) as count FROM students WHERE master_id = 1').get();
console.log(`Total active/managed students for Ranga Nagar: ${studentCount.count}`);

const sessionCount = db.prepare('SELECT count(*) as count FROM class_sessions WHERE master_id = 1').get();
console.log(`Total class sessions for Ranga Nagar: ${sessionCount.count}`);

