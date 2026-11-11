import bcrypt from 'bcryptjs';
import { db } from './db.js';

export function seedData(database = db) {
  // 1. Ensure Grand Master account exists in users table
  try {
    const gmCheck = database.prepare("SELECT id FROM users WHERE role = 'grandmaster'").get();
    if (!gmCheck) {
      const passwordHash = bcrypt.hashSync('grandmaster123', 10);
      database.prepare(`
        INSERT INTO users (email, password_hash, name, role, status, member_id, phone)
        VALUES (?, ?, ?, 'grandmaster', 'active', 'KOMS-GM-001', '+91 98400 00001')
      `).run('grandmaster@koms.in', passwordHash, 'Hanshi Grand Master (9th Dan)');
      console.log('🥋 Provisioned Executive Grand Master account: grandmaster@koms.in');
    }
  } catch (err) {
    console.error('Grand Master provision check:', err.message);
  }

  // 2. Only seed demo students if SEED_DEMO_DATA=true is explicitly set in environment
  if (process.env.SEED_DEMO_DATA !== 'true') {
    console.log('🥋 Clean KOMS database initialized (Fresh Registration mode: 0 mock students, 0 fake records).');
    return;
  }

  const studentCheck = database.prepare('SELECT count(*) as count FROM students').get();
  if (studentCheck && studentCheck.count > 0) {
    return;
  }

  console.log('Seeding demo data (SEED_DEMO_DATA=true)...');
  const passwordHash = bcrypt.hashSync('master123', 10);

  // Insert Master
  database.prepare(`
    INSERT OR IGNORE INTO masters (id, name, email, password_hash, dojo_name)
    VALUES (?, ?, ?, ?, ?)
  `).run(1, 'Sensei Rubeshwaren', 'rubeshwaren@koms.dojo', passwordHash, 'Ranga Nagar');
}

export function seedMasterControlData(database = db) {
  // Fresh registration mode starts with clean registration requests
  if (process.env.SEED_DEMO_DATA !== 'true') {
    return;
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedData();
}
