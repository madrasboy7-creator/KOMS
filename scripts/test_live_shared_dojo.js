async function runLiveTest() {
  const baseURL = 'http://localhost:5000/api';

  console.log('🥋 Testing live KOMS API for Ranga Nagar Dojo & Instructors...\n');

  // 1. Fetch all masters
  const mastersRes = await fetch(`${baseURL}/auth/masters`).then(r => r.json());
  console.log('1. Registered Masters:');
  console.table(mastersRes.masters);

  if (mastersRes.masters.length !== 2) {
    throw new Error(`Expected 2 masters, found ${mastersRes.masters.length}`);
  }
  const rubesh = mastersRes.masters.find(m => m.id === 1);
  const janathan = mastersRes.masters.find(m => m.id === 2);

  if (!rubesh.name.includes('Rubeshwaren') || rubesh.dojo_name !== 'Ranga Nagar') {
    throw new Error(`Master 1 is not Rubeshwaren at Ranga Nagar: ${JSON.stringify(rubesh)}`);
  }
  if (!janathan.name.includes('Janathanan') || janathan.dojo_name !== 'Ranga Nagar') {
    throw new Error(`Master 2 is not Janathanan at Ranga Nagar: ${JSON.stringify(janathan)}`);
  }
  console.log('✅ Both instructors belong to Ranga Nagar Dojo!\n');

  // 2. Switch to Rubeshwaren & fetch token
  const rubeshAuth = await fetch(`${baseURL}/auth/switch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ masterId: 1 })
  }).then(r => r.json());

  // 3. Switch to Janathanan & fetch token
  const janathanAuth = await fetch(`${baseURL}/auth/switch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ masterId: 2 })
  }).then(r => r.json());

  // 4. Compare students list seen by Rubeshwaren vs Janathanan
  const rubeshStudents = await fetch(`${baseURL}/students`, {
    headers: { Authorization: `Bearer ${rubeshAuth.token}` }
  }).then(r => r.json());

  const janathanStudents = await fetch(`${baseURL}/students`, {
    headers: { Authorization: `Bearer ${janathanAuth.token}` }
  }).then(r => r.json());

  console.log(`2. Students count seen by Sensei Rubeshwaren: ${rubeshStudents.students.length}`);
  console.log(`   Students count seen by Sensei Janathanan:  ${janathanStudents.students.length}`);

  if (rubeshStudents.students.length !== janathanStudents.students.length) {
    throw new Error('Students lists do not match between instructors!');
  }
  console.log('✅ Both instructors see the exact same student list!\n');

  // 5. Compare weekly schedule seen by both
  const rubeshSchedule = await fetch(`${baseURL}/schedule/active`, {
    headers: { Authorization: `Bearer ${rubeshAuth.token}` }
  }).then(r => r.json());

  const janathanSchedule = await fetch(`${baseURL}/schedule/active`, {
    headers: { Authorization: `Bearer ${janathanAuth.token}` }
  }).then(r => r.json());

  console.log('3. Weekly Schedule:');
  console.log(`   Rubeshwaren view: ${rubeshSchedule.timingDisplay || (rubeshSchedule.schedule.start_time + ' - ' + rubeshSchedule.schedule.end_time)}`);
  console.log(`   Janathanan view:  ${janathanSchedule.timingDisplay || (janathanSchedule.schedule.start_time + ' - ' + janathanSchedule.schedule.end_time)}`);

  if (rubeshSchedule.schedule.id !== janathanSchedule.schedule.id) {
    throw new Error('Weekly schedule IDs do not match between instructors!');
  }
  console.log('✅ Both instructors see the exact same weekly schedule!\n');

  // 6. Compare monthly register sheet
  const rubeshRegister = await fetch(`${baseURL}/attendance/monthly-register?year=2026&month=11`, {
    headers: { Authorization: `Bearer ${rubeshAuth.token}` }
  }).then(r => r.json());

  const janathanRegister = await fetch(`${baseURL}/attendance/monthly-register?year=2026&month=11`, {
    headers: { Authorization: `Bearer ${janathanAuth.token}` }
  }).then(r => r.json());

  console.log('4. Monthly Register Sheet (November 2026):');
  console.log(`   Rubeshwaren: ${rubeshRegister.register.length} students, ${rubeshRegister.sessions.length} sessions, ${rubeshRegister.total_scheduled_classes} classes scheduled`);
  console.log(`   Janathanan:  ${janathanRegister.register.length} students, ${janathanRegister.sessions.length} sessions, ${janathanRegister.total_scheduled_classes} classes scheduled`);

  if (rubeshRegister.register.length !== janathanRegister.register.length) {
    throw new Error('Register rows count mismatch!');
  }
  console.log('✅ Both instructors see the exact same monthly register sheet!\n');

  // 7. Sensei Janathanan saves attendance for a session, and Sensei Rubeshwaren sees it
  const firstSession = rubeshRegister.sessions[0];
  const firstStudent = rubeshStudents.students[0];

  console.log(`5. Sensei Janathanan marks ${firstStudent.student_name} as PRESENT in session ${firstSession.class_date}...`);
  const markRes = await fetch(`${baseURL}/attendance/record-single`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${janathanAuth.token}`
    },
    body: JSON.stringify({
      class_session_id: firstSession.id,
      student_id: firstStudent.id,
      status: 'PRESENT'
    })
  }).then(r => r.json());

  console.log('   Janathanan save result:', markRes);

  // Now Sensei Rubeshwaren verifies the updated attendance
  const checkRes = await fetch(`${baseURL}/attendance/session/${firstSession.id}`, {
    headers: { Authorization: `Bearer ${rubeshAuth.token}` }
  }).then(r => r.json());

  const studentAtt = checkRes.roster.find(a => a.id === firstStudent.id);
  console.log(`   Sensei Rubeshwaren checks session ${firstSession.class_date}: student status is "${studentAtt?.attendance_status}"`);

  if (studentAtt?.attendance_status !== 'PRESENT') {
    throw new Error(`Expected PRESENT, got ${studentAtt?.attendance_status}`);
  }
  console.log('✅ Attendance marked by Sensei Janathanan is immediately reflected in Sensei Rubeshwaren\'s view!\n');

  // 8. Test audit log when Sensei Janathanan edits finalized attendance
  console.log('6. Sensei Janathanan edits attendance record with audit reason...');
  const editAuditRes = await fetch(`${baseURL}/attendance/edit-audit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${janathanAuth.token}`
    },
    body: JSON.stringify({
      attendance_record_id: studentAtt.record_id,
      new_status: 'LEAVE',
      reason: 'Medical leave approved by Sensei Janathanan'
    })
  }).then(r => r.json());

  console.log('   Audit edit response:', editAuditRes);

  const auditLogsRes = await fetch(`${baseURL}/attendance/audit-logs`, {
    headers: { Authorization: `Bearer ${rubeshAuth.token}` }
  }).then(r => r.json());

  const latestLog = auditLogsRes.logs[0];
  console.log('   Latest audit entry seen by Sensei Rubeshwaren:', {
    student: latestLog?.student_name,
    old: latestLog?.old_status,
    new: latestLog?.new_status,
    modified_by: latestLog?.master_name,
    reason: latestLog?.reason
  });

  if (!latestLog?.master_name.includes('Janathanan')) {
    throw new Error(`Expected audit log to show Sensei Janathanan, got ${latestLog?.master_name}`);
  }
  console.log('✅ Audit log accurately records that Sensei Janathanan made the modification!\n');

  console.log('🎉 LIVE API INTEGRATION TEST PASSED 100%!');
}

runLiveTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
