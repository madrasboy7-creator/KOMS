import type {
  MonthlySchedule,
  ScheduleSession,
  StudentAttendance,
  AttendanceAuditLog,
  ClassType,
} from '../models/koms'

export interface DojoOption {
  id: string
  name: string
  shortName: string
  area: string
  headSensei: string
}

export const DOJO_OPTIONS: DojoOption[] = [
  {
    id: 'dojo-ranganagar',
    name: 'MASS DRAGON DOJO — Ranga Nagar Dojo',
    shortName: 'Ranga Nagar Dojo',
    area: 'Mudichur, Chennai',
    headSensei: 'Sensei Ashokan A. & Kyoshi B. Mathan',
  },
  {
    id: 'dojo-perungalathur',
    name: 'MASS DRAGON DOJO — Central Honbu Dojo',
    shortName: 'Central Honbu (New Perungalathur)',
    area: 'New Perungalathur, Chennai',
    headSensei: 'Kyoshi B. Mathan (Chief Sensei)',
  },
  {
    id: 'dojo-annanagar',
    name: 'MASS DRAGON DOJO — Anna Nagar Traditional Dojo',
    shortName: 'Anna Nagar Dojo',
    area: 'Anna Nagar West, Chennai',
    headSensei: 'Renshi R. Ravikanth',
  },
  {
    id: 'dojo-tambaram',
    name: 'MASS DRAGON DOJO — Tambaram Sanatorium Branch',
    shortName: 'Tambaram Branch',
    area: 'Tambaram Sanatorium, Chennai',
    headSensei: 'Sensei S. Karthi',
  },
  {
    id: 'dojo-kilpauk',
    name: 'MASS DRAGON DOJO — Kilpauk Kobudo & Karate Academy',
    shortName: 'Kilpauk Academy',
    area: 'Kilpauk, Chennai',
    headSensei: 'Sensei Ashokan A.',
  },
]

export const initialMonthlySchedules: MonthlySchedule[] = [
  {
    id: 'sched-rn-2026-10',
    dojoId: 'dojo-ranganagar',
    month: 10,
    year: 2026,
    createdBy: 'Kyoshi B. Mathan',
    createdAt: '2026-09-28T09:00:00Z',
    published: true,
    notes: 'October 2026 regular schedule: Mon/Wed/Fri evening & Sun morning kobudo session.',
  },
  {
    id: 'sched-rn-2026-11',
    dojoId: 'dojo-ranganagar',
    month: 11,
    year: 2026,
    createdBy: 'Sensei Ashokan A.',
    createdAt: '2026-10-28T10:00:00Z',
    published: true,
    notes: 'November 2026 training cycle: Winter grading practice & conditioning.',
  },
  {
    id: 'sched-pg-2026-10',
    dojoId: 'dojo-perungalathur',
    month: 10,
    year: 2026,
    createdBy: 'Kyoshi B. Mathan',
    createdAt: '2026-09-27T08:30:00Z',
    published: true,
    notes: 'Honbu Dojo October training syllabus: Tue/Thu/Sat and Sunday Dan clinic.',
  },
  {
    id: 'sched-pg-2026-11',
    dojoId: 'dojo-perungalathur',
    month: 11,
    year: 2026,
    createdBy: 'Kyoshi B. Mathan',
    createdAt: '2026-10-29T11:00:00Z',
    published: true,
    notes: 'Honbu Dojo November 2026 training schedule.',
  },
]

/**
 * Pre-seeded realistic sessions for October & November 2026
 */
export const initialScheduleSessions: ScheduleSession[] = [
  // --- OCTOBER 2026 (Ranga Nagar) ---
  {
    id: 'sess-rn-2026-10-02',
    scheduleId: 'sched-rn-2026-10',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-10-02',
    startTime: '06:30 PM',
    endTime: '08:00 PM',
    classType: 'Regular Training',
    sessionStatus: 'completed',
    title: 'Kihon Basics & Stance Foundation',
    instructor: 'Sensei Ashokan A.',
    notes: 'Zenkutsu dachi & Shiko dachi focus',
    createdAt: '2026-09-28T09:00:00Z',
    updatedAt: '2026-10-02T20:15:00Z',
  },
  {
    id: 'sess-rn-2026-10-04',
    scheduleId: 'sched-rn-2026-10',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-10-04',
    startTime: '06:30 AM',
    endTime: '08:30 AM',
    classType: 'Special Training',
    sessionStatus: 'completed',
    title: 'Sunday Kobudo & Weapons Masterclass',
    instructor: 'Kyoshi B. Mathan',
    notes: 'Rokushaku Bo staff drills',
    createdAt: '2026-09-28T09:00:00Z',
    updatedAt: '2026-10-04T08:45:00Z',
  },
  {
    id: 'sess-rn-2026-10-05',
    scheduleId: 'sched-rn-2026-10',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-10-05',
    startTime: '06:30 PM',
    endTime: '08:00 PM',
    classType: 'Regular Training',
    sessionStatus: 'completed',
    title: 'Fukyugata Kata Mastery',
    instructor: 'Sensei Ashokan A.',
    notes: 'Fukyugata I & II precision timing',
    createdAt: '2026-09-28T09:00:00Z',
    updatedAt: '2026-10-05T20:10:00Z',
  },
  {
    id: 'sess-rn-2026-10-07',
    scheduleId: 'sched-rn-2026-10',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-10-07',
    startTime: '06:30 PM',
    endTime: '08:00 PM',
    classType: 'Regular Training',
    sessionStatus: 'completed',
    title: 'Kumite Sparring & Target Pads',
    instructor: 'Kyoshi B. Mathan',
    notes: 'Gyaku-zuki counter punches',
    createdAt: '2026-09-28T09:00:00Z',
    updatedAt: '2026-10-07T20:20:00Z',
  },
  {
    id: 'sess-rn-2026-10-09',
    scheduleId: 'sched-rn-2026-10',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-10-09',
    startTime: '06:30 PM',
    endTime: '08:00 PM',
    classType: 'Regular Training',
    sessionStatus: 'completed',
    title: 'Speed & Agility Footwork Drills',
    instructor: 'Sensei Ashokan A.',
    notes: 'Dojo sprint ladders and evasion',
    createdAt: '2026-09-28T09:00:00Z',
    updatedAt: '2026-10-09T20:15:00Z',
  },
  {
    id: 'sess-rn-2026-10-11',
    scheduleId: 'sched-rn-2026-10',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-10-11',
    startTime: '06:30 AM',
    endTime: '08:30 AM',
    classType: 'Special Training',
    sessionStatus: 'completed',
    title: 'Kobudo Sai & Nunchaku Basics',
    instructor: 'Kyoshi B. Mathan',
    notes: 'Weapon safety & flip rotations',
    createdAt: '2026-09-28T09:00:00Z',
    updatedAt: '2026-10-11T08:40:00Z',
  },
  {
    id: 'sess-rn-2026-10-12',
    scheduleId: 'sched-rn-2026-10',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-10-12',
    startTime: '06:30 PM',
    endTime: '08:00 PM',
    classType: 'Regular Training',
    sessionStatus: 'completed',
    title: 'Pinan Shodan & Nidan Rehearsal',
    instructor: 'Sensei Ashokan A.',
    notes: 'Kata symmetry and breathing',
    createdAt: '2026-09-28T09:00:00Z',
    updatedAt: '2026-10-12T20:15:00Z',
  },
  {
    id: 'sess-rn-2026-10-14',
    scheduleId: 'sched-rn-2026-10',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-10-14',
    startTime: '06:30 PM',
    endTime: '08:00 PM',
    classType: 'Tournament Practice',
    sessionStatus: 'completed',
    title: 'Chennai Championship Rules & Kumite',
    instructor: 'Kyoshi B. Mathan',
    notes: 'WKF score refereeing simulation',
    createdAt: '2026-09-28T09:00:00Z',
    updatedAt: '2026-10-14T20:25:00Z',
  },
  {
    id: 'sess-rn-2026-10-16',
    scheduleId: 'sched-rn-2026-10',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-10-16',
    startTime: '06:30 PM',
    endTime: '08:00 PM',
    classType: 'Regular Training',
    sessionStatus: 'cancelled',
    title: 'Regular Conditioning Class',
    instructor: 'Sensei Ashokan A.',
    notes: 'Class cancelled due to Chennai Red Alert Heavy Rain / Cyclone',
    createdAt: '2026-09-28T09:00:00Z',
    updatedAt: '2026-10-16T14:00:00Z',
  },
  {
    id: 'sess-rn-2026-10-18',
    scheduleId: 'sched-rn-2026-10',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-10-18',
    startTime: '06:30 AM',
    endTime: '08:30 AM',
    classType: 'Special Training',
    sessionStatus: 'completed',
    title: 'Outdoor Endurance & Stance Drills',
    instructor: 'Kyoshi B. Mathan',
    notes: 'Breathing exercises & endurance kicking',
    createdAt: '2026-09-28T09:00:00Z',
    updatedAt: '2026-10-18T08:45:00Z',
  },
  {
    id: 'sess-rn-2026-10-19',
    scheduleId: 'sched-rn-2026-10',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-10-19',
    startTime: '06:30 PM',
    endTime: '08:00 PM',
    classType: 'Grading Practice',
    sessionStatus: 'completed',
    title: 'Belt Syllabus Examination Check',
    instructor: 'Sensei Ashokan A.',
    notes: 'Mock grading for Yellow and Orange belts',
    createdAt: '2026-09-28T09:00:00Z',
    updatedAt: '2026-10-19T20:20:00Z',
  },
  {
    id: 'sess-rn-2026-10-21',
    scheduleId: 'sched-rn-2026-10',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-10-21',
    startTime: '06:30 PM',
    endTime: '08:00 PM',
    classType: 'Regular Training',
    sessionStatus: 'completed',
    title: 'Self-Defense Joint Locks & Escape',
    instructor: 'Sensei Ashokan A.',
    notes: 'Wrist releases and tactical anti-bullying defense',
    createdAt: '2026-09-28T09:00:00Z',
    updatedAt: '2026-10-21T20:15:00Z',
  },
  {
    id: 'sess-rn-2026-10-23',
    scheduleId: 'sched-rn-2026-10',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-10-23',
    startTime: '06:30 PM',
    endTime: '08:00 PM',
    classType: 'Regular Training',
    sessionStatus: 'completed',
    title: 'Combination Striking & Sweeps',
    instructor: 'Sensei Ashokan A.',
    notes: 'Mawashi-geri & Deashi-barai combinations',
    createdAt: '2026-09-28T09:00:00Z',
    updatedAt: '2026-10-23T20:15:00Z',
  },
  {
    id: 'sess-rn-2026-10-25',
    scheduleId: 'sched-rn-2026-10',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-10-25',
    startTime: '06:30 AM',
    endTime: '08:30 AM',
    classType: 'Special Training',
    sessionStatus: 'completed',
    title: 'Passai Dai Kata Clinic',
    instructor: 'Kyoshi B. Mathan',
    notes: 'Senior Kata bunkai and body conditioning',
    createdAt: '2026-09-28T09:00:00Z',
    updatedAt: '2026-10-25T08:50:00Z',
  },
  {
    id: 'sess-rn-2026-10-26',
    scheduleId: 'sched-rn-2026-10',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-10-26',
    startTime: '06:30 PM',
    endTime: '08:00 PM',
    classType: 'Regular Training',
    sessionStatus: 'completed',
    title: 'Target Sparring & Reflex Drills',
    instructor: 'Sensei Ashokan A.',
    notes: 'Focus mitts reaction time test',
    createdAt: '2026-09-28T09:00:00Z',
    updatedAt: '2026-10-26T20:15:00Z',
  },
  {
    id: 'sess-rn-2026-10-28',
    scheduleId: 'sched-rn-2026-10',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-10-28',
    startTime: '06:30 PM',
    endTime: '08:00 PM',
    classType: 'Regular Training',
    sessionStatus: 'completed',
    title: 'Pre-Holiday Fitness & Makiwara',
    instructor: 'Sensei Ashokan A.',
    notes: 'Core strength and knuckle pushups',
    createdAt: '2026-09-28T09:00:00Z',
    updatedAt: '2026-10-28T20:15:00Z',
  },
  {
    id: 'sess-rn-2026-10-30',
    scheduleId: 'sched-rn-2026-10',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-10-30',
    startTime: '06:30 PM',
    endTime: '08:00 PM',
    classType: 'Regular Training',
    sessionStatus: 'completed',
    title: 'Monthly Review & Sparring Circle',
    instructor: 'Kyoshi B. Mathan',
    notes: 'End of month review',
    createdAt: '2026-09-28T09:00:00Z',
    updatedAt: '2026-10-30T20:20:00Z',
  },
  {
    id: 'sess-rn-2026-10-31',
    scheduleId: 'sched-rn-2026-10',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-10-31',
    startTime: '06:30 AM',
    endTime: '08:30 AM',
    classType: 'Regular Training',
    sessionStatus: 'holiday',
    title: 'Diwali Dojo Holiday',
    instructor: 'All Instructors',
    notes: 'Dojo closed for Diwali Celebrations (Oct 31 - Nov 02)',
    createdAt: '2026-09-28T09:00:00Z',
    updatedAt: '2026-10-29T10:00:00Z',
  },

  // --- NOVEMBER 2026 (Ranga Nagar - Current Month) ---
  {
    id: 'sess-rn-2026-11-01',
    scheduleId: 'sched-rn-2026-11',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-11-01',
    startTime: '06:30 AM',
    endTime: '08:30 AM',
    classType: 'Special Training',
    sessionStatus: 'completed',
    title: 'Sunday Morning Conditioning & Kobudo',
    instructor: 'Kyoshi B. Mathan',
    notes: 'Post-Diwali warm-up & Bo basics',
    createdAt: '2026-10-28T10:00:00Z',
    updatedAt: '2026-11-01T08:45:00Z',
  },
  {
    id: 'sess-rn-2026-11-02',
    scheduleId: 'sched-rn-2026-11',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-11-02',
    startTime: '06:30 PM',
    endTime: '08:00 PM',
    classType: 'Regular Training',
    sessionStatus: 'scheduled',
    title: 'Belt Training & Kihon Drills (Today)',
    instructor: 'Sensei Ashokan A.',
    notes: 'Focus on stances and kick recovery',
    createdAt: '2026-10-28T10:00:00Z',
    updatedAt: '2026-11-02T06:00:00Z',
  },
  {
    id: 'sess-rn-2026-11-04',
    scheduleId: 'sched-rn-2026-11',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-11-04',
    startTime: '06:30 PM',
    endTime: '08:00 PM',
    classType: 'Regular Training',
    sessionStatus: 'scheduled',
    title: 'Kumite Sparring & Counter Punching',
    instructor: 'Sensei Ashokan A.',
    notes: 'Chest protector & mouthguard mandatory',
    createdAt: '2026-10-28T10:00:00Z',
    updatedAt: '2026-10-28T10:00:00Z',
  },
  {
    id: 'sess-rn-2026-11-06',
    scheduleId: 'sched-rn-2026-11',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-11-06',
    startTime: '06:30 PM',
    endTime: '08:00 PM',
    classType: 'Regular Training',
    sessionStatus: 'scheduled',
    title: 'Fukyugata & Pinan Kata Synchronization',
    instructor: 'Sensei Ashokan A.',
    notes: 'Detailed step-by-step bunkai review',
    createdAt: '2026-10-28T10:00:00Z',
    updatedAt: '2026-10-28T10:00:00Z',
  },
  {
    id: 'sess-rn-2026-11-08',
    scheduleId: 'sched-rn-2026-11',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-11-08',
    startTime: '06:30 AM',
    endTime: '08:30 AM',
    classType: 'Special Training',
    sessionStatus: 'scheduled',
    title: 'Kobudo Weapons Mastery: Bo & Sai',
    instructor: 'Kyoshi B. Mathan',
    notes: 'Intermediate and advanced weapon sets',
    createdAt: '2026-10-28T10:00:00Z',
    updatedAt: '2026-10-28T10:00:00Z',
  },
  {
    id: 'sess-rn-2026-11-09',
    scheduleId: 'sched-rn-2026-11',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-11-09',
    startTime: '06:30 PM',
    endTime: '08:00 PM',
    classType: 'Regular Training',
    sessionStatus: 'scheduled',
    title: 'Speed Boxing & Dynamic Kicking',
    instructor: 'Sensei Ashokan A.',
    notes: 'Cardio endurance and balance drills',
    createdAt: '2026-10-28T10:00:00Z',
    updatedAt: '2026-10-28T10:00:00Z',
  },
  {
    id: 'sess-rn-2026-11-11',
    scheduleId: 'sched-rn-2026-11',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-11-11',
    startTime: '06:30 PM',
    endTime: '08:00 PM',
    classType: 'Grading Practice',
    sessionStatus: 'scheduled',
    title: 'Winter Grading Syllabus Inspection',
    instructor: 'Kyoshi B. Mathan',
    notes: 'Kyu grading qualification check',
    createdAt: '2026-10-28T10:00:00Z',
    updatedAt: '2026-10-28T10:00:00Z',
  },
  {
    id: 'sess-rn-2026-11-13',
    scheduleId: 'sched-rn-2026-11',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-11-13',
    startTime: '06:30 PM',
    endTime: '08:00 PM',
    classType: 'Regular Training',
    sessionStatus: 'scheduled',
    title: 'Self-Defense Maneuvers & Anti-Grab',
    instructor: 'Sensei Ashokan A.',
    notes: 'Wrist, shirt, and bear hug counters',
    createdAt: '2026-10-28T10:00:00Z',
    updatedAt: '2026-10-28T10:00:00Z',
  },
  {
    id: 'sess-rn-2026-11-15',
    scheduleId: 'sched-rn-2026-11',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-11-15',
    startTime: '06:30 AM',
    endTime: '08:30 AM',
    classType: 'Regular Training',
    sessionStatus: 'holiday',
    title: 'Tatami Deep Sanitization & Maintenance',
    instructor: 'Dojo Committee',
    notes: 'Dojo annual tatami mat disinfection & equipment maintenance',
    createdAt: '2026-10-28T10:00:00Z',
    updatedAt: '2026-10-28T10:00:00Z',
  },
  {
    id: 'sess-rn-2026-11-16',
    scheduleId: 'sched-rn-2026-11',
    dojoId: 'dojo-ranganagar',
    classDate: '2026-11-16',
    startTime: '06:30 PM',
    endTime: '08:00 PM',
    classType: 'Regular Training',
    sessionStatus: 'scheduled',
    title: 'Kihon & Stance Deepening',
    instructor: 'Sensei Ashokan A.',
    notes: 'Posture correction',
    createdAt: '2026-10-28T10:00:00Z',
    updatedAt: '2026-10-28T10:00:00Z',
  },
]

/**
 * Generate seed attendance records for October 2026 & early Nov 2026
 */
export function generateInitialAttendanceRecords(
  studentIds: string[]
): StudentAttendance[] {
  const records: StudentAttendance[] = []

  // Completed sessions in October (16 completed sessions: 1 cancelled on Oct 16, 1 holiday on Oct 31)
  const completedOctoberSessionDates = [
    '2026-10-02',
    '2026-10-04',
    '2026-10-05',
    '2026-10-07',
    '2026-10-09',
    '2026-10-11',
    '2026-10-12',
    '2026-10-14',
    '2026-10-18',
    '2026-10-19',
    '2026-10-21',
    '2026-10-23',
    '2026-10-25',
    '2026-10-26',
    '2026-10-28',
    '2026-10-30',
  ]

  studentIds.forEach((sId, sIdx) => {
    // Distribute varied attendance patterns to realistically test all 4 rating tiers:
    // sIdx % 4 === 0: 95-100% (Excellent)
    // sIdx % 4 === 1: 80-88% (Good)
    // sIdx % 4 === 2: 60-70% (Needs Improvement)
    // sIdx % 4 === 3: 40-48% (Low Attendance)

    completedOctoberSessionDates.forEach((dateStr, dIdx) => {
      let status: 'present' | 'absent' | 'late' | 'excused' = 'present'
      let remarks: string | undefined = undefined

      const tier = sIdx % 4

      if (tier === 0) {
        // High performer
        if (dIdx === 7) {
          status = 'late'
          remarks = 'Arrived 15 mins late due to school bus delay'
        } else if (dIdx === 12) {
          status = 'excused'
          remarks = 'Prior leave application for school exam'
        }
      } else if (tier === 1) {
        // Good performer (~80%)
        if (dIdx === 3 || dIdx === 11) {
          status = 'absent'
          remarks = 'Unexcused absence'
        } else if (dIdx === 6) {
          status = 'late'
          remarks = 'Traffic delay at Mudichur junction'
        } else if (dIdx === 9) {
          status = 'excused'
          remarks = 'Family function notice submitted'
        }
      } else if (tier === 2) {
        // Needs Improvement (~60%)
        if (dIdx % 3 === 0) {
          status = 'absent'
          remarks = 'Absent without prior intimation'
        } else if (dIdx === 5) {
          status = 'late'
          remarks = 'Late check-in by 25 mins'
        } else if (dIdx === 8) {
          status = 'excused'
          remarks = 'Doctor appointment'
        }
      } else {
        // Low Attendance (< 50%)
        if (dIdx % 2 === 0 || dIdx % 5 === 0) {
          status = 'absent'
          remarks = 'Repeated unexcused absence'
        } else if (dIdx === 3) {
          status = 'excused'
          remarks = 'Medical leave with doctor certificate'
        } else if (dIdx === 9) {
          status = 'late'
          remarks = 'Late by 30 mins'
        }
      }

      records.push({
        id: `att-seed-${sId}-${dateStr}`,
        sessionId: `sess-rn-${dateStr}`,
        studentId: sId,
        dojoId: 'dojo-ranganagar',
        classDate: dateStr,
        attendanceStatus: status,
        remarks,
        markedBy: 'Sensei Ashokan A.',
        markedAt: `${dateStr}T20:15:00Z`,
        updatedAt: `${dateStr}T20:15:00Z`,
      })
    })

    // Also add Sunday Nov 1 completed session
    records.push({
      id: `att-seed-${sId}-2026-11-01`,
      sessionId: 'sess-rn-2026-11-01',
      studentId: sId,
      dojoId: 'dojo-ranganagar',
      classDate: '2026-11-01',
      attendanceStatus: sIdx % 5 === 0 ? 'late' : 'present',
      remarks: sIdx % 5 === 0 ? 'Arrived 10 mins late' : 'Punctual check-in',
      markedBy: 'Kyoshi B. Mathan',
      markedAt: '2026-11-01T08:45:00Z',
      updatedAt: '2026-11-01T08:45:00Z',
    })
  })

  return records
}

export const initialAuditLogs: AttendanceAuditLog[] = [
  {
    id: 'audit-log-001',
    attendanceId: 'att-seed-KOMS002-2026-10-14',
    studentId: 'KOMS002',
    studentName: 'Karthik S',
    sessionId: 'sess-rn-2026-10-14',
    classDate: '2026-10-14',
    oldStatus: 'absent',
    newStatus: 'excused',
    modifiedBy: 'Kyoshi B. Mathan',
    modificationReason: 'Parent produced school tournament permission letter',
    modifiedAt: '2026-10-15T11:20:00Z',
  },
  {
    id: 'audit-log-002',
    attendanceId: 'att-seed-KOMS005-2026-10-21',
    studentId: 'KOMS005',
    studentName: 'Divya S',
    sessionId: 'sess-rn-2026-10-21',
    classDate: '2026-10-21',
    oldStatus: 'absent',
    newStatus: 'late',
    modifiedBy: 'Sensei Ashokan A.',
    modificationReason: 'Corrected attendance entry; student was on tatami for second half sparring',
    modifiedAt: '2026-10-22T09:15:00Z',
  },
]
