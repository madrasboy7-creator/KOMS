import bcrypt from 'bcryptjs';
import { db } from '../server/db.js';

console.log('🧹 Performing Clean Database Reset (Zero Mock Data)...');

db.exec(`
  DELETE FROM attendance_records;
  DELETE FROM attendance_audit_logs;
  DELETE FROM fee_payments;
  DELETE FROM fee_waivers;
  DELETE FROM student_registration_requests;
  DELETE FROM join_requests;
  DELETE FROM master_applications;
  DELETE FROM student_profiles;
  DELETE FROM students;
  DELETE FROM users;
`);

const hash = bcrypt.hashSync('grandmaster123', 10);
db.prepare(`
  INSERT INTO users (email, password_hash, name, role, status, member_id, phone)
  VALUES ('grandmaster@koms.in', ?, 'Hanshi Grand Master (9th Dan)', 'grandmaster', 'active', 'KOMS-GM-001', '+91 98400 00001')
`).run(hash);

console.log('✅ Clean reset complete:');
console.log('  Students count:', db.prepare('SELECT count(*) as c FROM students').get().c);
console.log('  Attendance records:', db.prepare('SELECT count(*) as c FROM attendance_records').get().c);
console.log('  Fee payments:', db.prepare('SELECT count(*) as c FROM fee_payments').get().c);
console.log('  Join requests:', db.prepare('SELECT count(*) as c FROM join_requests').get().c);
console.log('  Active Users:', db.prepare('SELECT email, role, status FROM users').all());

