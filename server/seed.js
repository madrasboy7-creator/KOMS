import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { changeWeeklySchedule } from './scheduler.js';

export function seedData(database = db) {
  const masterCheck = database.prepare('SELECT count(*) as count FROM masters').get();
  if (masterCheck && masterCheck.count > 0) {
    console.log('Database already seeded. Skipping initial seed.');
    return;
  }

  console.log('Seeding KOMS Dojo Master data...');
  const passwordHash = bcrypt.hashSync('master123', 10);

  // 1. Insert Masters for Ranga Nagar Dojo
  const insertMaster = database.prepare(`
    INSERT INTO masters (id, name, email, password_hash, dojo_name)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertMaster.run(1, 'Sensei Rubeshwaren', 'rubeshwaren@koms.dojo', passwordHash, 'Ranga Nagar');
  insertMaster.run(2, 'Sensei Janathanan', 'janathanan@koms.dojo', passwordHash, 'Ranga Nagar');

  // 2. Insert Students for Ranga Nagar Dojo (master_id 1 is shared dataset)
  const insertStudent = database.prepare(`
    INSERT INTO students (master_id, student_name, student_code, joining_date, status, rank)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const rangaNagarStudents = [
    [1, 'Kenjiro Takahashi', 'KOMS-STU-001', '2026-01-10', 'active', 'Black Belt (1st Dan)'],
    [1, 'Aoi Nakamura', 'KOMS-STU-002', '2026-02-15', 'active', 'Brown Belt (1st Kyu)'],
    [1, 'Daiki Sato', 'KOMS-STU-003', '2026-03-01', 'active', 'Brown Belt (2nd Kyu)'],
    [1, 'Haruto Ito', 'KOMS-STU-004', '2026-03-20', 'active', 'Green Belt (3rd Kyu)'],
    [1, 'Yuna Watanabe', 'KOMS-STU-005', '2026-04-05', 'active', 'Green Belt (4th Kyu)'],
    [1, 'Ren Kobayashi', 'KOMS-STU-006', '2026-05-12', 'active', 'Yellow Belt (5th Kyu)'],
    [1, 'Sakura Yamamoto', 'KOMS-STU-007', '2026-06-01', 'active', 'Yellow Belt (6th Kyu)'],
    [1, 'Sota Saito', 'KOMS-STU-008', '2026-06-25', 'active', 'Yellow Belt (6th Kyu)'],
    [1, 'Riko Kato', 'KOMS-STU-009', '2026-07-10', 'active', 'White Belt (Beginner)'],
    [1, 'Kaito Yoshida', 'KOMS-STU-010', '2026-08-01', 'active', 'White Belt (Beginner)'],
    [1, 'Mei Yamada', 'KOMS-STU-011', '2026-08-15', 'active', 'White Belt (Beginner)'],
    [1, 'Hayato Sasaki', 'KOMS-STU-012', '2026-09-01', 'active', 'White Belt (Beginner)'],
    [1, 'Hinata Yamaguchi', 'KOMS-STU-013', '2026-09-20', 'active', 'White Belt (Beginner)'],
    [1, 'Asahi Matsumoto', 'KOMS-STU-014', '2026-10-05', 'active', 'White Belt (Beginner)'],
    // Inactive student to verify history remains accessible even when inactive
    [1, 'Koki Inoue', 'KOMS-STU-015', '2026-02-01', 'inactive', 'Yellow Belt (5th Kyu)'],
    // Additional Ranga Nagar Dojo students
    [1, 'Takumi Fujiwara', 'KOMS-STU-101', '2026-01-15', 'active', 'Green Belt'],
    [1, 'Rin Shima', 'KOMS-STU-102', '2026-03-10', 'active', 'Yellow Belt'],
    [1, 'Tsubasa Ozora', 'KOMS-STU-103', '2026-05-20', 'active', 'White Belt'],
    [1, 'Genzo Wakabayashi', 'KOMS-STU-104', '2026-07-12', 'active', 'Brown Belt'],
    [1, 'Kojiro Hyuga', 'KOMS-STU-105', '2026-09-01', 'active', 'Black Belt'],
  ];

  for (const s of rangaNagarStudents) {
    insertStudent.run(...s);
  }

  // 3. Configure initial Weekly Schedule for Ranga Nagar Dojo
  // Saturday & Sunday, 6:30 PM - 8:30 PM (18:30 - 20:30), effective 2026-11-01
  changeWeeklySchedule(database, 1, {
    effective_from: '2026-11-01',
    start_time: '18:30',
    end_time: '20:30',
    days: [6, 0], // Saturday and Sunday
    replaceFutureUncompleted: true
  });

  // 4. Seed attendance for Sunday, Nov 1, 2026 for Ranga Nagar Dojo
  const nov1Session = database.prepare(`
    SELECT id FROM class_sessions 
    WHERE master_id = 1 AND class_date = '2026-11-01'
  `).get();

  if (nov1Session) {
    const students = database.prepare('SELECT id FROM students WHERE master_id = 1').all();
    const insertAtt = database.prepare(`
      INSERT INTO attendance_records 
        (master_id, class_session_id, student_id, attendance_status, marked_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    // Let's mark attendance: mostly PRESENT, 2 ABSENT, 1 LEAVE
    database.exec('BEGIN IMMEDIATE;');
    for (let i = 0; i < students.length; i++) {
      let status = 'PRESENT';
      if (i === 2) status = 'ABSENT';
      else if (i === 5) status = 'LEAVE';
      else if (i === 8) status = 'ABSENT';
      insertAtt.run(1, nov1Session.id, students[i].id, status);
    }
    // Update session status to completed
    database.prepare("UPDATE class_sessions SET status = 'completed' WHERE id = ?").run(nov1Session.id);
    database.exec('COMMIT;');
  }

  console.log('KOMS Database seeded successfully!');
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedData();
}


export function seedMasterControlData(database = db) {
  try {
    // 1. Seed Registration Requests
    const reqCount = database.prepare('SELECT count(*) as count FROM student_registration_requests').get()?.count || 0;
    if (reqCount === 0) {
      const insertReq = database.prepare(`
        INSERT INTO student_registration_requests (
          master_id, student_name, dob, phone, email, guardian_name,
          guardian_phone, address, belt, dojo_name, monthly_fee,
          registration_type, status, requested_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);

      insertReq.run(1, 'Priya S', '2012-05-05', '+91 98765 43211', 'priya@email.com', 'Suresh Kumar', '+91 98765 43211', 'Mudichur, Chennai', 'Yellow Belt (5th Kyu)', 'Ranga Nagar Dojo', 1000, 'STUDENT_SUBMITTED', 'PENDING');
      insertReq.run(1, 'Vikram M', '2009-08-22', '+91 98765 43212', 'vikram@email.com', 'Mani V', '+91 98765 43212', 'Tambaram, Chennai', 'Orange Belt (6th Kyu)', 'Ranga Nagar Dojo', 1000, 'MASTER_CREATED', 'PENDING');
      insertReq.run(1, 'Lavanya P', '2010-09-19', '+91 98765 43215', 'lavanya@email.com', 'Prasath K', '+91 98765 43215', 'Chromepet, Chennai', 'Purple Belt (2nd Kyu)', 'Ranga Nagar Dojo', 1200, 'STUDENT_SUBMITTED', 'APPROVED');
    }

    // 2. Seed Fee Payments for 2026-11
    const paymentCount = database.prepare('SELECT count(*) as count FROM fee_payments').get()?.count || 0;
    if (paymentCount === 0) {
      const students = database.prepare('SELECT id, student_name, student_code FROM students WHERE master_id = 1 LIMIT 8').all();
      const insertPayment = database.prepare(`
        INSERT INTO fee_payments (
          master_id, student_id, receipt_number, billing_month, amount_due,
          amount_paid, payment_method, transaction_ref, payment_date, remarks,
          status, recorded_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      // 6 full payments, 2 partial payments
      students.forEach((st, idx) => {
        const isPartial = idx >= 6;
        const paid = isPartial ? 500 : 1000;
        const status = isPartial ? 'PARTIAL' : 'PAID';
        const method = idx % 2 === 0 ? 'UPI' : 'CASH';
        const rcp = `RCP-202611-${String(st.id).padStart(3, '0')}-${1000 + idx}`;
        insertPayment.run(
          1,
          st.id,
          rcp,
          '2026-11',
          1000,
          paid,
          method,
          method === 'UPI' ? `UPI${Date.now() + idx}` : null,
          `2026-11-0${idx + 1}`,
          isPartial ? 'First installment paid' : 'Full monthly fee received',
          status,
          1
        );
      });
    }

    // 3. Seed Announcements
    const annCount = database.prepare('SELECT count(*) as count FROM announcements').get()?.count || 0;
    if (annCount === 0) {
      const insertAnn = database.prepare(`
        INSERT INTO announcements (
          master_id, title, message, category, priority, target_audience,
          publish_date, expiry_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?, ?)
      `);

      insertAnn.run(
        1,
        'Winter Belt Grading Examination 2026',
        'Official belt grading examination for Kyu ranks will be conducted on Saturday, Nov 28 at Central Honbu Dojo. All candidates must complete syllabus requirements.',
        'Grading',
        'High',
        'all',
        '2026-11-30',
        'PUBLISHED'
      );

      insertAnn.run(
        1,
        'Summer & Winter Gasshuku Training Camp',
        'Special 3-day weapons kata and kumite clinic. Registrations open for green belt and above.',
        'Special Camp',
        'Medium',
        'belt',
        '2026-12-15',
        'PUBLISHED'
      );

      insertAnn.run(
        1,
        'Dojo Schedule Adjustment for Deepavali',
        'Evening sessions on Friday and Saturday will be rescheduled to morning 6:30 AM.',
        'Schedule',
        'Urgent',
        'all',
        '2026-11-15',
        'PUBLISHED'
      );
    }
  } catch (e) {
    console.error('seedMasterControlData error:', e.message);
  }
}
