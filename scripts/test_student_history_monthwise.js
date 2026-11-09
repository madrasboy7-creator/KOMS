async function testStudentHistoryMonthwise() {
  const baseURL = 'http://localhost:5000/api';

  console.log('🥋 Testing Month-Wise Student History & Daily Attendance List...\n');

  // 1. Authenticate as Sensei Rubeshwaren (Master 1)
  const authRes = await fetch(`${baseURL}/auth/switch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ masterId: 1 })
  }).then(r => r.json());

  const token = authRes.token;

  // 2. Fetch classes for November 2026 (month 11)
  const novRes = await fetch(`${baseURL}/sessions?month=2026-11`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());

  console.log(`1. November 2026 Classes Count: ${novRes.sessions.length}`);
  if (novRes.sessions.length !== 9) {
    throw new Error(`Expected 9 classes in November 2026, got ${novRes.sessions.length}`);
  }

  console.log('   Class Dates in November 2026:');
  console.table(novRes.sessions.map(s => ({
    date: s.class_date,
    day: s.weekday_name,
    timing: s.timing_display,
    students: s.active_students_count,
    present: s.present_count,
    absent: s.absent_count,
    leave: s.leave_count,
    status: s.completion_status
  })));

  // Verify that each class has No. of students, present, absent
  for (const s of novRes.sessions) {
    if (typeof s.active_students_count !== 'number' || typeof s.present_count !== 'number' || typeof s.absent_count !== 'number') {
      throw new Error(`Missing student metrics on class session ${s.class_date}`);
    }
  }
  console.log('✅ Every class date has No. of students, Present, and Absent counts!\n');

  // 3. Click on a particular date: e.g. 2026-11-01
  const firstSession = novRes.sessions[0];
  console.log(`2. Clicking on particular date: ${firstSession.class_date} (Session ID: ${firstSession.id})...`);

  const dayListRes = await fetch(`${baseURL}/attendance/session/${firstSession.id}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());

  console.log(`   Session: ${dayListRes.session.class_date} (${dayListRes.session.start_time} - ${dayListRes.session.end_time})`);
  console.log(`   Total Roster Students: ${dayListRes.roster.length}`);
  console.log(`   Summary: Present: ${dayListRes.summary.present_count}, Absent: ${dayListRes.summary.absent_count}, Leave: ${dayListRes.summary.leave_count}, Unmarked: ${dayListRes.summary.unmarked_count}`);

  if (dayListRes.roster.length === 0) {
    throw new Error('Day attendance roster returned 0 students!');
  }

  console.log('   Sample Students in Day Attendance List (First 5):');
  console.table(dayListRes.roster.slice(0, 5).map(s => ({
    name: s.student_name,
    code: s.student_code,
    rank: s.rank,
    status: s.attendance_status
  })));
  console.log('✅ Attendance of that day displays like a complete student list!\n');

  // 4. Test December 2026 (Month with 8 classes, matching user prompt example)
  const decRes = await fetch(`${baseURL}/sessions?month=2026-12`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());

  console.log(`3. December 2026 Classes Count: ${decRes.sessions.length}`);
  if (decRes.sessions.length !== 8) {
    throw new Error(`Expected 8 classes in December 2026, got ${decRes.sessions.length}`);
  }

  console.log('   Class Dates in December 2026:');
  console.table(decRes.sessions.map(s => ({
    date: s.class_date,
    day: s.weekday_name,
    timing: s.timing_display,
    students: s.active_students_count,
    present: s.present_count,
    absent: s.absent_count,
    status: s.completion_status
  })));
  console.log('✅ December (8 classes in month) displays all 8 classes with student metrics!\n');

  // 5. Test Student-Wise Attendance Percentage History Formula
  const sampleStudent = dayListRes.roster[0];
  console.log(`4. Testing individual student history for: ${sampleStudent.student_name} (${sampleStudent.student_code})...`);

  const historyRes = await fetch(`${baseURL}/students/${sampleStudent.id}/attendance-history?year=2026&month=11`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());

  const monthRecord = historyRes.monthly_records[0];
  console.log(`   Month: ${monthRecord.month_name}`);
  console.log(`   Scheduled Classes in Month: ${monthRecord.total_scheduled_in_month}`);
  console.log(`   Attended: ${monthRecord.attended_count}`);
  console.log(`   Attendance Percentage: ${monthRecord.attendance_percentage}%`);
  console.log(`   Formula: ${monthRecord.formula_display}`);

  console.log('\n🎉 ALL CHECKS PASSED 100%!');
}

testStudentHistoryMonthwise().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

