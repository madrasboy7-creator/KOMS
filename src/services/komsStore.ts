import { approvedDojos, type PublicDojo } from '../home/commonData'
import { initialMasterProfile, type MasterProfileData } from '../admin/masterData'
import { devAnnouncements, devDojo, devEvents, devFees, devSchedule, devStudents } from '../data/devSampleData'
import type {
  Announcement,
  AttendanceRecord,
  FeeRecord,
  KomsEvent,
  Student,
  TrainingSession,
  AttendanceStatus,
  ClassType,
  SessionStatus,
  MonthlySchedule,
  ScheduleSession,
  StudentAttendance,
  AttendanceAuditLog,
  StudentMonthlyAttendanceSummary,
  SeniorAssignment,
  SeniorPermissionSet,
  StudentRegistrationRequest,
  BeltGradingRecord,
  GradingEvent,
  Tournament,
  TournamentStudentApplication,
  DojoFeeStructure,
  StudentFeeLedgerItem,
  SystemAuditLog,
} from '../models/koms'
import { assetConfig } from '../config/assets'
import {
  DOJO_OPTIONS,
  initialMonthlySchedules,
  initialScheduleSessions,
  generateInitialAttendanceRecords,
  initialAuditLogs,
  type DojoOption,
} from '../data/scheduleAttendanceData'

export interface RegisteredDojo {
  id: string
  name: string
  registrationId: string
  masterName: string
  masterEmail: string
  masterPhone: string
  area: string
  address: string
  karateStyle: string
  entryFee: number
  monthlyFee: number
  classTimings: string
  weeklySchedule: string[]
  achievements: string[]
  studentCount: number
  seniorCount: number
  registrationDate: string
  status: 'ACTIVE' | 'PENDING' | 'REJECTED' | 'SUSPENDED' | 'INACTIVE'
  rejectionReason?: string
  suspensionReason?: string
}

export interface DojoHoliday {
  id: string
  title: string
  date: string
  description: string
  dojoBranch: string
}

export type UserRole = 'guest' | 'student' | 'senior' | 'master' | 'grandmaster' | 'admin'

export interface UserSession {
  role: UserRole
  student?: Student
  userName?: string
  userEmail?: string
  masterName?: string
  assignedDojos?: string[]
}


export interface RegistrationEnquiry {
  id: string
  studentName: string
  dateOfBirth: string
  age: string
  gender: string
  bloodGroup: string
  fatherName?: string
  motherName?: string
  guardianPhone: string
  guardianWhatsapp?: string
  email: string
  address: string
  dojoId: string
  dojoName: string
  trainingCategory: string
  priorExperience?: string
  submittedAt: string
  status: 'pending_review' | 'approved' | 'rejected'
  reviewerNotes?: string
}

export interface GrandMasterCmsData {
  organizationName: string
  dojoBranding: string
  motto: string
  heroHeadline: string
  heroSubtext: string
  bannerImageUrl: string
  announcementIds: string[]
  featuredDojoIds: string[]
  contactPhone: string
  contactEmail: string
  contactAddress: string
  lastUpdated: string
}

const STORAGE_KEYS = {
  STUDENTS: 'koms_students_v2',
  ATTENDANCE: 'koms_attendance_v2',
  SCHEDULE: 'koms_schedule_v2',
  HOLIDAYS: 'koms_holidays_v2',
  FEES: 'koms_fees_v2',
  SESSION: 'koms_session_v2',
  ANNOUNCEMENTS: 'koms_announcements_v2',
  REGISTRATIONS: 'koms_registrations_v2',
  CMS: 'koms_cms_v2',
  MONTHLY_SCHEDULES: 'koms_monthly_schedules_v3',
  SCHEDULE_SESSIONS: 'koms_schedule_sessions_v3',
  STUDENT_ATTENDANCE: 'koms_student_attendance_v3',
  AUDIT_LOGS: 'koms_attendance_audit_logs_v3',
  DOJOS_REGISTRY: 'koms_dojos_registry_v1',
  SENIOR_ASSIGNMENTS: 'koms_senior_assignments_v1',
  TOURNAMENTS: 'koms_tournaments_v1',
  TOURNAMENT_APPLICATIONS: 'koms_tournament_applications_v1',
  BELT_GRADING: 'koms_belt_grading_v1',
  GRADING_EVENTS: 'koms_grading_events_v1',
  FEE_STRUCTURES: 'koms_fee_structures_v1',
  FEE_LEDGER: 'koms_fee_ledger_v1',
  SYSTEM_AUDIT_LOGS: 'koms_system_audit_logs_v1',
  STUDENT_REG_REQUESTS: 'koms_student_reg_requests_v1',
  MASTER_PROFILE: 'koms_master_profile_v3',
  PUBLIC_DOJOS: 'koms_public_dojos_v3',
}

export const initialRegisteredDojos: RegisteredDojo[] = [
  {
    id: 'dojo-ranganagar',
    name: 'MASS DRAGON DOJO — Ranga Nagar Dojo',
    registrationId: 'KOMS-DOJO-001',
    masterName: 'Kyoshi B. Mathan & Sensei Ashokan A.',
    masterEmail: 'mathan@koms.in',
    masterPhone: '+91 96001 03987',
    area: 'Mudichur, Chennai',
    address: '1/38 2nd Street, Ranga Nagar, Mudichur, Chennai - 600048',
    karateStyle: 'Okinawa Shorin Ryu & Kobudo',
    entryFee: 1000,
    monthlyFee: 800,
    classTimings: '06:00 PM – 07:30 PM',
    weeklySchedule: ['Saturday', 'Sunday'],
    achievements: ['Chennai District Kata Championship 2024', 'State Kobudo Gold Trophy 2025'],
    studentCount: 48,
    seniorCount: 2,
    registrationDate: '12 Jan 2020',
    status: 'ACTIVE',
  },
  {
    id: 'dojo-perungalathur',
    name: 'MASS DRAGON DOJO — Central Honbu Dojo',
    registrationId: 'KOMS-DOJO-002',
    masterName: 'Kyoshi B. Mathan (Chief Sensei)',
    masterEmail: 'honbu@koms.in',
    masterPhone: '+91 97908 97178',
    area: 'New Perungalathur, Chennai',
    address: 'No: 13, Velu Street, M.K.B. Nagar, New Perungalathur, Chennai - 600063',
    karateStyle: 'Okinawa Shorin Ryu Matsubayashi',
    entryFee: 1000,
    monthlyFee: 1000,
    classTimings: '06:30 PM – 08:00 PM',
    weeklySchedule: ['Friday', 'Saturday'],
    achievements: ['National Kobudo Gold 2023', 'South India Black Belt Champions 2025'],
    studentCount: 64,
    seniorCount: 3,
    registrationDate: '05 Aug 2018',
    status: 'ACTIVE',
  },
  {
    id: 'dojo-annanagar',
    name: 'MASS DRAGON DOJO — Anna Nagar Traditional Dojo',
    registrationId: 'KOMS-DOJO-003',
    masterName: 'Renshi R. Ravikanth',
    masterEmail: 'ravikanth@koms.in',
    masterPhone: '+91 98401 23456',
    area: 'Anna Nagar West, Chennai',
    address: 'W-Block, 4th Main Road, Anna Nagar West, Chennai - 600040',
    karateStyle: 'Shorin Ryu Traditional',
    entryFee: 1500,
    monthlyFee: 1200,
    classTimings: '05:30 PM – 07:00 PM',
    weeklySchedule: ['Monday', 'Wednesday', 'Friday'],
    achievements: ['Tamil Nadu Inter-Dojo Kata Trophy 2025'],
    studentCount: 38,
    seniorCount: 2,
    registrationDate: '15 Mar 2022',
    status: 'ACTIVE',
  },
  {
    id: 'dojo-tambaram',
    name: 'MASS DRAGON DOJO — Tambaram Sanatorium Branch',
    registrationId: 'KOMS-DOJO-004',
    masterName: 'Sensei S. Karthi',
    masterEmail: 'karthi@koms.in',
    masterPhone: '+91 97890 54321',
    area: 'Tambaram Sanatorium, Chennai',
    address: 'Near Railway Station, Tambaram Sanatorium, Chennai - 600047',
    karateStyle: 'Shorin Ryu Sports & Self-Defense',
    entryFee: 1000,
    monthlyFee: 800,
    classTimings: '06:00 PM – 07:30 PM',
    weeklySchedule: ['Tuesday', 'Thursday', 'Saturday'],
    achievements: ['Kumite Silver Medalist Hub 2025'],
    studentCount: 29,
    seniorCount: 1,
    registrationDate: '10 Nov 2023',
    status: 'ACTIVE',
  },
  {
    id: 'dojo-kilpauk',
    name: 'MASS DRAGON DOJO — Kilpauk Kobudo & Karate Academy',
    registrationId: 'KOMS-DOJO-005',
    masterName: 'Sensei Ashokan A.',
    masterEmail: 'ashokan@koms.in',
    masterPhone: '+91 98402 98765',
    area: 'Kilpauk, Chennai',
    address: 'Ormes Road, Kilpauk, Chennai - 600010',
    karateStyle: 'Traditional Kobudo Weapons & Kata',
    entryFee: 1200,
    monthlyFee: 1000,
    classTimings: '06:00 PM – 07:30 PM',
    weeklySchedule: ['Saturday', 'Sunday'],
    achievements: ['Kobudo Masters Demonstration Award 2024'],
    studentCount: 32,
    seniorCount: 1,
    registrationDate: '20 Feb 2023',
    status: 'ACTIVE',
  },
  {
    id: 'dojo-padappai',
    name: 'MASS DRAGON DOJO — Padappai Training Branch',
    registrationId: 'KOMS-DOJO-006',
    masterName: 'Sensei M. Vignesh',
    masterEmail: 'vignesh@koms.in',
    masterPhone: '+91 98840 11223',
    area: 'Padappai, Chennai',
    address: 'Main Road, Padappai, Kanchipuram / Chennai Outskirts',
    karateStyle: 'Okinawa Shorin Ryu',
    entryFee: 1000,
    monthlyFee: 800,
    classTimings: '05:00 PM – 06:30 PM',
    weeklySchedule: ['Wednesday', 'Sunday'],
    achievements: [],
    studentCount: 0,
    seniorCount: 0,
    registrationDate: '01 Nov 2026',
    status: 'PENDING',
  },
  {
    id: 'dojo-velachery',
    name: 'MASS DRAGON DOJO — Velachery Sports Dojo',
    registrationId: 'KOMS-DOJO-007',
    masterName: 'Sensei P. Rajesh',
    masterEmail: 'rajesh@koms.in',
    masterPhone: '+91 97100 88990',
    area: 'Velachery, Chennai',
    address: '100 Feet Bypass Road, Velachery, Chennai - 600042',
    karateStyle: 'Sports Karate & Fitness',
    entryFee: 1200,
    monthlyFee: 1000,
    classTimings: '06:00 PM – 07:30 PM',
    weeklySchedule: ['Monday', 'Wednesday', 'Saturday'],
    achievements: ['Junior State Kumite Bronze 2024'],
    studentCount: 18,
    seniorCount: 1,
    registrationDate: '14 May 2024',
    status: 'SUSPENDED',
    suspensionReason: 'Annual dojo tatami safety compliance renewal pending review.',
  },
]

export const initialTournaments: Tournament[] = [
  {
    id: 'tourn-01',
    name: 'Chennai State Karate & Kobudo Championship 2026',
    category: 'Kata, Kumite & Kobudo (Nunchaku, Sai, Bo, Tekko)',
    date: '22 Nov 2026',
    venue: 'Jawaharlal Nehru Indoor Stadium, Periamet, Chennai',
    registrationDeadline: '15 Nov 2026',
    rules: 'WKF / Okinawa Kobudo Bukenkan Championship Rules. Full safety gear mandatory.',
    eligibility: 'Yellow Belt & above. Age 6 to 35. Verified Dojo Master nomination required.',
    ageCategories: ['Under-10 (Sub-Junior)', 'Under-14 (Junior)', 'Under-18 (Cadet)', 'Senior Open'],
    beltCategories: ['Beginner (Yellow-Orange)', 'Intermediate (Green-Purple)', 'Advanced (Brown-Black)'],
    eventTypes: ['Individual Kata', 'Individual Kumite', 'Kobudo Weapon Kata (Bo/Sai/Nunchaku)'],
    maxParticipants: 120,
    status: 'REGISTRATION_OPEN',
    createdBy: 'Hanshi Grand Master (9th Dan)',
    createdAt: '2026-10-15T10:00:00Z',
  },
  {
    id: 'tourn-02',
    name: 'South India Traditional Martial Arts Trophy 2026',
    category: 'Traditional Kata & Full Contact Kumite',
    date: '14 Dec 2026',
    venue: 'YMCA Ground, Nandanam, Chennai',
    registrationDeadline: '01 Dec 2026',
    rules: 'Traditional Shorin-Ryu Ippon Shobu & Kobudo standards.',
    eligibility: 'Green Belt and above.',
    ageCategories: ['Junior (12-16)', 'Senior (17+)'],
    beltCategories: ['Green-Brown', 'Black Belt Dan Ranks'],
    eventTypes: ['Kata', 'Kumite'],
    maxParticipants: 80,
    status: 'ANNOUNCED',
    createdBy: 'Hanshi Grand Master (9th Dan)',
    createdAt: '2026-10-25T11:00:00Z',
  },
]

export const initialSeniorAssignments: SeniorAssignment[] = [
  {
    id: 'sen-01',
    studentId: 'KOMS-2026-001',
    studentName: 'S. Tharun Kumar',
    memberId: 'KOMS001',
    dojoId: 'dojo-ranganagar',
    assignedByMaster: 'Kyoshi B. Mathan',
    assignedDate: '15 Aug 2025',
    permissions: {
      canViewStudents: true,
      canMarkAttendance: true,
      canViewAttendanceHistory: true,
      canVerifyStudentDetails: true,
      canViewBeltDetails: true,
      canRecommendGrading: true,
      canUploadPhotos: true,
      canViewClassSchedules: true,
      canViewAnnouncements: true,
    },
    status: 'active',
  },
  {
    id: 'sen-02',
    studentId: 'KOMS-2026-003',
    studentName: 'K. Meenakshi',
    memberId: 'KOMS003',
    dojoId: 'dojo-perungalathur',
    assignedByMaster: 'Kyoshi B. Mathan',
    assignedDate: '10 Jan 2026',
    permissions: {
      canViewStudents: true,
      canMarkAttendance: true,
      canViewAttendanceHistory: false,
      canVerifyStudentDetails: false,
      canViewBeltDetails: true,
      canRecommendGrading: false,
      canUploadPhotos: true,
      canViewClassSchedules: true,
      canViewAnnouncements: true,
    },
    status: 'active',
  },
]

export const initialGradingEvents: GradingEvent[] = [
  {
    id: 'grade-ev-01',
    title: 'Winter State Kyu & Dan Belt Examination 2026',
    examDate: '29 Nov 2026',
    venue: 'Central Honbu Dojo, New Perungalathur, Chennai',
    targetRanks: ['Yellow Belt', 'Orange Belt', 'Green Belt', 'Blue Belt', 'Purple Belt', 'Brown Belt', 'Shodan 1st Dan'],
    examiner: 'Hanshi Grand Master & Technical Board',
    status: 'UPCOMING',
    notes: 'Candidates must have minimum 85% attendance in preceding 3 months.',
  },
]

// Initial sample holidays for Chennai dojos
const initialHolidays: DojoHoliday[] = [
  {
    id: 'hol-1',
    title: 'Diwali Dojo Holiday',
    date: '31 Oct 2026 – 02 Nov 2026',
    description: 'Evening classes suspended. Morning fitness drills only.',
    dojoBranch: 'All Chennai Branches',
  },
  {
    id: 'hol-2',
    title: 'Dojo Annual Tatami Maintenance',
    date: '15 Nov 2026',
    description: 'Tatami mat sanitization & equipment inspection.',
    dojoBranch: 'New Perungalathur Central Dojo',
  },
]

const initialRegistrations: RegistrationEnquiry[] = [
  {
    id: 'KOMS-REQ-2026-1082',
    studentName: 'S. Tharun Kumar',
    dateOfBirth: '14/05/2015',
    age: '11 years',
    gender: 'Male',
    bloodGroup: 'B+ve',
    fatherName: 'P. Shanmugam',
    motherName: 'S. Bhuvaneshwari',
    guardianPhone: '9840221345',
    guardianWhatsapp: '9840221345',
    email: 'shanmugam.p@gmail.com',
    address: '2nd Cross Street, Ranga Nagar, Mudichur, Chennai - 600 048',
    dojoId: 'dojo-ranganagar',
    dojoName: 'MASS DRAGON DOJO - Ranga Nagar Dojo',
    trainingCategory: 'Junior Karate Batch (Mon, Wed, Fri)',
    priorExperience: 'Beginner / First time martial arts training',
    submittedAt: '22 Oct 2026',
    status: 'approved',
    reviewerNotes: 'Approved by Kyoshi B. Mathan. First trial class scheduled on 26 Oct.',
  },
  {
    id: 'KOMS-REQ-2026-1095',
    studentName: 'K. Meenakshi',
    dateOfBirth: '20/09/2017',
    age: '9 years',
    gender: 'Female',
    bloodGroup: 'O+ve',
    fatherName: 'V. Karthik',
    motherName: 'K. Divya',
    guardianPhone: '9789012345',
    email: 'karthik.v@yahoo.com',
    address: 'Velu Street, M.K.B. Nagar, New Perungalathur, Chennai',
    dojoId: 'dojo-perungalathur',
    dojoName: 'MASS DRAGON DOJO - Central Dojo, New Perungalathur',
    trainingCategory: 'Kids Karate & Kobudo Basics',
    priorExperience: 'None',
    submittedAt: '24 Oct 2026',
    status: 'pending_review',
  },
  {
    id: 'KOMS-REQ-2026-1102',
    studentName: 'R. Vigneshwar',
    dateOfBirth: '18/11/2012',
    age: '14 years',
    gender: 'Male',
    bloodGroup: 'A+ve',
    fatherName: 'M. Radhakrishnan',
    motherName: 'R. Jayanthi',
    guardianPhone: '9841098765',
    guardianWhatsapp: '9841098765',
    email: 'radhakrishnan.m@gmail.com',
    address: 'Plot 45, Ranga Nagar Main Road, Mudichur, Chennai - 600048',
    dojoId: 'dojo-ranganagar',
    dojoName: 'MASS DRAGON DOJO — Ranga Nagar Dojo',
    trainingCategory: 'Youth Karate & Kobudo Martial Arts',
    priorExperience: '1 year Shotokan basics in school',
    submittedAt: '26 Oct 2026',
    status: 'pending_review',
  },
]

const defaultCmsData: GrandMasterCmsData = {
  organizationName: 'Kobudo Renmei Bukenkan - India',
  dojoBranding: 'MASS DRAGON DOJO',
  motto: 'Discipline. Strength. Internal Peace.',
  heroHeadline: 'Kobudo Renmei Bukenkan — India',
  heroSubtext:
    'Dedicated to traditional Okinawan Shorin Ryu Karate Do & authentic Kobudo weapons arts under MASS DRAGON DOJO. Cultivating physical discipline, kata precision, and moral character across Chennai branches.',
  bannerImageUrl: assetConfig.dashboardBanner,
  announcementIds: ['ann-1', 'ann-2', 'ann-3', 'ann-4'],
  featuredDojoIds: ['dojo-ranganagar', 'dojo-perungalathur', 'dojo-annanagar'],
  contactPhone: '+91 96001 03987 / +91 97908 97178',
  contactEmail: 'contact@koms-karate.in',
  contactAddress:
    'Honbu Dojo: No: 13, Velu Street, M.K.B Nagar, New Perungalathur & 1/38 2nd Street, Ranga Nagar, Mudichur, Chennai',
  lastUpdated: '24 Oct 2026',
}

class KomsStore {
  private students: Student[] = []
  private attendanceMap: Record<string, AttendanceRecord[]> = {}
  private schedule: TrainingSession[] = []
  private holidays: DojoHoliday[] = []
  private feeMap: Record<string, FeeRecord[]> = {}
  private announcements: Announcement[] = []
  private session: UserSession = { role: 'guest' }
  private registrations: RegistrationEnquiry[] = []
  private cmsData: GrandMasterCmsData = defaultCmsData
  private monthlySchedules: MonthlySchedule[] = []
  private scheduleSessions: ScheduleSession[] = []
  private studentAttendance: StudentAttendance[] = []
  private auditLogs: AttendanceAuditLog[] = []
  private registeredDojos: RegisteredDojo[] = []
  private seniorAssignments: SeniorAssignment[] = []
  private tournaments: Tournament[] = []
  private tournamentApplications: TournamentStudentApplication[] = []
  private beltGradingRecords: BeltGradingRecord[] = []
  private gradingEvents: GradingEvent[] = []
  private feeStructures: DojoFeeStructure[] = []
  private feeLedger: StudentFeeLedgerItem[] = []
  private systemAuditLogs: SystemAuditLog[] = []
  private studentRegRequests: StudentRegistrationRequest[] = []
  private masterProfile: MasterProfileData = initialMasterProfile
  private publicDojos: PublicDojo[] = approvedDojos
  private listeners: Set<() => void> = new Set()

  constructor() {
    this.load()
  }

  private load() {
    try {
      const storedStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS)
      this.students = storedStudents ? JSON.parse(storedStudents) : devStudents

      // Assign dojos to devStudents if not set or legacy
      this.students = this.students.map((s, idx) => {
        let dojoId = s.dojoId
        if (!dojoId || dojoId === 'dojo-okinawa-chennai-01') {
          if (s.address?.includes('Mudichur') || s.address?.includes('Ranga Nagar')) {
            dojoId = 'dojo-ranganagar'
          } else if (s.address?.includes('New Perungalathur') || s.address?.includes('Perungalathur')) {
            dojoId = 'dojo-perungalathur'
          } else if (s.address?.includes('Anna Nagar')) {
            dojoId = 'dojo-annanagar'
          } else {
            dojoId = idx % 2 === 0 ? 'dojo-ranganagar' : 'dojo-perungalathur'
          }
        }
        return { ...s, dojoId }
      })

      const storedSched = localStorage.getItem(STORAGE_KEYS.SCHEDULE)
      this.schedule = storedSched ? JSON.parse(storedSched) : devSchedule

      const storedHolidays = localStorage.getItem(STORAGE_KEYS.HOLIDAYS)
      this.holidays = storedHolidays ? JSON.parse(storedHolidays) : initialHolidays

      const storedAnnounce = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)
      this.announcements = storedAnnounce ? JSON.parse(storedAnnounce) : devAnnouncements

      const storedSession = localStorage.getItem(STORAGE_KEYS.SESSION)
      this.session = storedSession ? JSON.parse(storedSession) : { role: 'guest' }

      const storedReg = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)
      this.registrations = storedReg ? JSON.parse(storedReg) : initialRegistrations

      const storedCms = localStorage.getItem(STORAGE_KEYS.CMS)
      this.cmsData = storedCms ? JSON.parse(storedCms) : defaultCmsData

      // Load monthly schedules
      const storedScheds = localStorage.getItem(STORAGE_KEYS.MONTHLY_SCHEDULES)
      this.monthlySchedules = storedScheds ? JSON.parse(storedScheds) : initialMonthlySchedules

      // Load schedule sessions
      const storedSessions = localStorage.getItem(STORAGE_KEYS.SCHEDULE_SESSIONS)
      this.scheduleSessions = storedSessions ? JSON.parse(storedSessions) : initialScheduleSessions

      // Load audit logs
      const storedAudits = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)
      this.auditLogs = storedAudits ? JSON.parse(storedAudits) : initialAuditLogs

      // Load student attendance
      const storedStudentAtt = localStorage.getItem(STORAGE_KEYS.STUDENT_ATTENDANCE)
      if (storedStudentAtt) {
        this.studentAttendance = JSON.parse(storedStudentAtt)
      } else {
        const studentIds = [
          ...this.students.map((s) => s.id),
          'KOMS001',
          'KOMS002',
          'KOMS003',
          'KOMS004',
          'KOMS005',
          'KOMS006',
          'KOMS007',
          'KOMS008',
          'KOMS009',
          'KOMS010',
        ]
        this.studentAttendance = generateInitialAttendanceRecords(Array.from(new Set(studentIds)))
      }

      const storedAtt = localStorage.getItem(STORAGE_KEYS.ATTENDANCE)
      if (storedAtt) {
        this.attendanceMap = JSON.parse(storedAtt)
      } else {
        // Initialize attendance map for all students
        this.attendanceMap = {}
        for (const s of this.students) {
          this.attendanceMap[s.id] = [
            { id: `att-${s.id}-1`, date: '21 Oct 2026', className: 'Shorin Ryu Kata & Stances', instructor: 'Sensei B. Mathan', status: 'present' },
            { id: `att-${s.id}-2`, date: '19 Oct 2026', className: 'Basics & Kihon Drills', instructor: 'Sensei R. Ravikanth', status: 'present' },
            { id: `att-${s.id}-3`, date: '16 Oct 2026', className: 'Kumite Footwork & Conditioning', instructor: 'Sensei B. Mathan', status: 'present' },
            { id: `att-${s.id}-4`, date: '14 Oct 2026', className: 'Fukyugata Kata Mastery', instructor: 'Sensei R. Ravikanth', status: 'present' },
            { id: `att-${s.id}-5`, date: '12 Oct 2026', className: 'Open Mat Sparring', instructor: 'Sensei B. Mathan', status: 'late' },
          ]
        }
      }

      const storedFees = localStorage.getItem(STORAGE_KEYS.FEES)
      if (storedFees) {
        this.feeMap = JSON.parse(storedFees)
      } else {
        this.feeMap = {}
        for (const s of this.students) {
          this.feeMap[s.id] = [
            {
              id: `fee-${s.id}-01`,
              label: `Admission Entrance Fee (${s.name})`,
              amount: s.entranceFee || 1000,
              dueDate: s.joiningDate || '04 Jul 2026',
              paidDate: s.joiningDate || '04 Jul 2026',
              status: 'paid',
            },
            ...devFees.slice(1).map(f => ({ ...f, id: `${f.id}-${s.id}` })),
          ]
        }
      }

      // Load new multi-dojo enterprise entities
      const storedDojos = localStorage.getItem(STORAGE_KEYS.DOJOS_REGISTRY)
      this.registeredDojos = storedDojos ? JSON.parse(storedDojos) : initialRegisteredDojos

      const storedSeniors = localStorage.getItem(STORAGE_KEYS.SENIOR_ASSIGNMENTS)
      this.seniorAssignments = storedSeniors ? JSON.parse(storedSeniors) : initialSeniorAssignments

      const storedTournaments = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS)
      this.tournaments = storedTournaments ? JSON.parse(storedTournaments) : initialTournaments

      const storedTournApps = localStorage.getItem(STORAGE_KEYS.TOURNAMENT_APPLICATIONS)
      this.tournamentApplications = storedTournApps ? JSON.parse(storedTournApps) : []

      const storedBeltGrades = localStorage.getItem(STORAGE_KEYS.BELT_GRADING)
      this.beltGradingRecords = storedBeltGrades ? JSON.parse(storedBeltGrades) : []

      const storedGradingEvents = localStorage.getItem(STORAGE_KEYS.GRADING_EVENTS)
      this.gradingEvents = storedGradingEvents ? JSON.parse(storedGradingEvents) : initialGradingEvents

      const storedFeeStructs = localStorage.getItem(STORAGE_KEYS.FEE_STRUCTURES)
      this.feeStructures = storedFeeStructs ? JSON.parse(storedFeeStructs) : []

      const storedFeeLedger = localStorage.getItem(STORAGE_KEYS.FEE_LEDGER)
      this.feeLedger = storedFeeLedger ? JSON.parse(storedFeeLedger) : []

      const storedSysAudits = localStorage.getItem(STORAGE_KEYS.SYSTEM_AUDIT_LOGS)
      this.systemAuditLogs = storedSysAudits ? JSON.parse(storedSysAudits) : []

      const storedRegReqs = localStorage.getItem(STORAGE_KEYS.STUDENT_REG_REQUESTS)
      this.studentRegRequests = storedRegReqs ? JSON.parse(storedRegReqs) : []

      const storedMasterProfile = localStorage.getItem(STORAGE_KEYS.MASTER_PROFILE)
      this.masterProfile = storedMasterProfile ? JSON.parse(storedMasterProfile) : initialMasterProfile

      const storedPublicDojos = localStorage.getItem(STORAGE_KEYS.PUBLIC_DOJOS)
      this.publicDojos = storedPublicDojos ? JSON.parse(storedPublicDojos) : approvedDojos
    } catch {
      this.students = devStudents
      this.schedule = devSchedule
      this.holidays = initialHolidays
      this.announcements = devAnnouncements
      this.session = { role: 'guest' }
      this.registrations = initialRegistrations
      this.cmsData = defaultCmsData
      this.monthlySchedules = initialMonthlySchedules
      this.scheduleSessions = initialScheduleSessions
      this.auditLogs = initialAuditLogs
      this.studentAttendance = generateInitialAttendanceRecords(this.students.map((s) => s.id))
      this.registeredDojos = initialRegisteredDojos
      this.seniorAssignments = initialSeniorAssignments
      this.tournaments = initialTournaments
      this.tournamentApplications = []
      this.beltGradingRecords = []
      this.gradingEvents = initialGradingEvents
      this.feeStructures = []
      this.feeLedger = []
      this.systemAuditLogs = []
      this.studentRegRequests = []
      this.masterProfile = initialMasterProfile
      this.publicDojos = approvedDojos
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(this.students))
      localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(this.schedule))
      localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(this.holidays))
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(this.attendanceMap))
      localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(this.feeMap))
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(this.session))
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(this.announcements))
      localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(this.registrations))
      localStorage.setItem(STORAGE_KEYS.CMS, JSON.stringify(this.cmsData))
      localStorage.setItem(STORAGE_KEYS.MONTHLY_SCHEDULES, JSON.stringify(this.monthlySchedules))
      localStorage.setItem(STORAGE_KEYS.SCHEDULE_SESSIONS, JSON.stringify(this.scheduleSessions))
      localStorage.setItem(STORAGE_KEYS.STUDENT_ATTENDANCE, JSON.stringify(this.studentAttendance))
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs))
      localStorage.setItem(STORAGE_KEYS.DOJOS_REGISTRY, JSON.stringify(this.registeredDojos))
      localStorage.setItem(STORAGE_KEYS.SENIOR_ASSIGNMENTS, JSON.stringify(this.seniorAssignments))
      localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(this.tournaments))
      localStorage.setItem(STORAGE_KEYS.TOURNAMENT_APPLICATIONS, JSON.stringify(this.tournamentApplications))
      localStorage.setItem(STORAGE_KEYS.BELT_GRADING, JSON.stringify(this.beltGradingRecords))
      localStorage.setItem(STORAGE_KEYS.GRADING_EVENTS, JSON.stringify(this.gradingEvents))
      localStorage.setItem(STORAGE_KEYS.FEE_STRUCTURES, JSON.stringify(this.feeStructures))
      localStorage.setItem(STORAGE_KEYS.FEE_LEDGER, JSON.stringify(this.feeLedger))
      localStorage.setItem(STORAGE_KEYS.SYSTEM_AUDIT_LOGS, JSON.stringify(this.systemAuditLogs))
      localStorage.setItem(STORAGE_KEYS.STUDENT_REG_REQUESTS, JSON.stringify(this.studentRegRequests))
      localStorage.setItem(STORAGE_KEYS.MASTER_PROFILE, JSON.stringify(this.masterProfile))
      localStorage.setItem(STORAGE_KEYS.PUBLIC_DOJOS, JSON.stringify(this.publicDojos))
    } catch {
      // Ignore storage errors in restricted contexts
    }
    this.notify()
  }

  public subscribe(cb: () => void) {
    this.listeners.add(cb)
    return () => {
      this.listeners.delete(cb)
    }
  }

  private notify() {
    this.listeners.forEach((cb) => cb())
  }

  // Getters
  public getStudents(): Student[] {
    return this.students
  }

  public getStudent(id: string): Student | undefined {
    return this.students.find((s) => s.id === id || s.memberId === id)
  }

  public pauseStudent(studentId: string, reason?: string, effectiveDate?: string) {
    const s = this.students.find((st) => st.id === studentId || st.memberId === studentId)
    if (s) {
      s.status = 'paused'
      s.pausedDate = effectiveDate || new Date().toISOString().slice(0, 10)
      s.pauseReason = reason || 'Attendance paused by Dojo Master'
      this.save()
    }
  }

  public resumeStudent(studentId: string) {
    const s = this.students.find((st) => st.id === studentId || st.memberId === studentId)
    if (s) {
      s.status = 'active'
      s.pausedDate = undefined
      s.pauseReason = undefined
      this.save()
    }
  }

  public recordSingleAttendance(sessionId: string, studentId: string, status: AttendanceStatus, dojoId?: string) {
    const sess = this.scheduleSessions.find(s => s.id === sessionId)
    const classDate = sess?.classDate || new Date().toISOString().slice(0, 10)
    const targetDojo = dojoId || sess?.dojoId || 'dojo-ranganagar'
    const now = new Date().toISOString()

    const existingIdx = this.studentAttendance.findIndex(a => a.sessionId === sessionId && a.studentId === studentId)
    if (existingIdx >= 0) {
      this.studentAttendance[existingIdx].attendanceStatus = status
      this.studentAttendance[existingIdx].updatedAt = now
    } else {
      this.studentAttendance.push({
        id: `att-rec-${sessionId}-${studentId}-${Date.now()}`,
        sessionId,
        studentId,
        dojoId: targetDojo,
        classDate,
        attendanceStatus: status,
        markedBy: 'Sensei',
        markedAt: now,
        updatedAt: now
      })
    }
    this.save()
  }

  // --- DOJO MANAGEMENT ---
  public getDojos(): DojoOption[] {
    return DOJO_OPTIONS
  }

  public getDojo(id: string): DojoOption | undefined {
    return DOJO_OPTIONS.find((d) => d.id === id)
  }

  // --- MONTHLY SCHEDULE MANAGEMENT ---
  public getMonthlySchedules(dojoId?: string, year?: number, month?: number): MonthlySchedule[] {
    return this.monthlySchedules.filter((ms) => {
      if (dojoId && ms.dojoId !== dojoId) return false
      if (year && ms.year !== year) return false
      if (month && ms.month !== month) return false
      return true
    })
  }

  public getMonthlySchedule(id: string): MonthlySchedule | undefined {
    return this.monthlySchedules.find((ms) => ms.id === id)
  }

  public createMonthlySchedule(
    dojoId: string,
    year: number,
    month: number,
    createdBy: string,
    notes?: string
  ): MonthlySchedule {
    const existing = this.monthlySchedules.find(
      (ms) => ms.dojoId === dojoId && ms.year === year && ms.month === month
    )
    if (existing) {
      existing.notes = notes || existing.notes
      this.save()
      return existing
    }

    const newSchedule: MonthlySchedule = {
      id: `sched-${dojoId}-${year}-${String(month).padStart(2, '0')}-${Date.now()}`,
      dojoId,
      year,
      month,
      createdBy,
      createdAt: new Date().toISOString(),
      published: true,
      notes,
    }
    this.monthlySchedules.push(newSchedule)
    this.save()
    return newSchedule
  }

  // --- SCHEDULE SESSIONS MANAGEMENT ---
  public getScheduleSessions(params?: {
    dojoId?: string
    year?: number
    month?: number
    date?: string
    status?: SessionStatus
  }): ScheduleSession[] {
    return this.scheduleSessions
      .filter((s) => {
        if (params?.dojoId && s.dojoId !== params.dojoId) return false
        if (params?.date && s.classDate !== params.date) return false
        if (params?.status && s.sessionStatus !== params.status) return false
        if (params?.year && params?.month) {
          const prefix = `${params.year}-${String(params.month).padStart(2, '0')}`
          if (!s.classDate.startsWith(prefix)) return false
        } else if (params?.year) {
          if (!s.classDate.startsWith(String(params.year))) return false
        }
        return true
      })
      .sort((a, b) => a.classDate.localeCompare(b.classDate))
  }

  public getScheduleSession(id: string): ScheduleSession | undefined {
    return this.scheduleSessions.find((s) => s.id === id)
  }

  public addScheduleSession(session: Omit<ScheduleSession, 'id' | 'createdAt' | 'updatedAt'>): ScheduleSession {
    const now = new Date().toISOString()
    const newSession: ScheduleSession = {
      ...session,
      id: `sess-${session.dojoId}-${session.classDate}-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    }
    this.scheduleSessions.push(newSession)
    this.save()
    return newSession
  }

  public updateScheduleSession(
    id: string,
    patch: Partial<ScheduleSession>
  ): ScheduleSession | undefined {
    const idx = this.scheduleSessions.findIndex((s) => s.id === id)
    if (idx < 0) return undefined

    const old = this.scheduleSessions[idx]
    const updated: ScheduleSession = {
      ...old,
      ...patch,
      updatedAt: new Date().toISOString(),
    }
    this.scheduleSessions[idx] = updated

    // If date changed, update associated attendance records to keep sync
    if (patch.classDate && patch.classDate !== old.classDate) {
      this.studentAttendance = this.studentAttendance.map((a) =>
        a.sessionId === id ? { ...a, classDate: patch.classDate! } : a
      )
    }

    this.save()
    return updated
  }

  public deleteScheduleSession(
    id: string,
    force = false
  ): { success: boolean; hasAttendance?: boolean; attendanceCount?: number; message: string } {
    const attCount = this.studentAttendance.filter((a) => a.sessionId === id).length
    if (attCount > 0 && !force) {
      return {
        success: false,
        hasAttendance: true,
        attendanceCount: attCount,
        message: `This class session has ${attCount} recorded attendance entries. Modifying or deleting it requires explicit confirmation to preserve attendance history.`,
      }
    }

    this.scheduleSessions = this.scheduleSessions.filter((s) => s.id !== id)
    this.save()
    return { success: true, message: 'Class session removed successfully.' }
  }

  public generateMonthlyClasses(params: {
    dojoId: string
    year: number
    month: number
    daysOfWeek: number[] // 0 = Sun, 1 = Mon, ..., 6 = Sat
    startTime: string
    endTime: string
    classType: ClassType
    notes?: string
    instructor?: string
    createdBy: string
    title?: string
  }): { schedule: MonthlySchedule; sessions: ScheduleSession[] } {
    const schedule = this.createMonthlySchedule(
      params.dojoId,
      params.year,
      params.month,
      params.createdBy,
      params.notes
    )

    const now = new Date()
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    const daysInMonth = new Date(params.year, params.month, 0).getDate()
    const createdSessions: ScheduleSession[] = []

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(params.year, params.month - 1, day)
      const dayOfWeek = dateObj.getDay()

      if (params.daysOfWeek.includes(dayOfWeek)) {
        const dateStr = `${params.year}-${String(params.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

        // Check if session already exists for this dojo, date and time
        const exists = this.scheduleSessions.some(
          (s) => s.dojoId === params.dojoId && s.classDate === dateStr && s.startTime === params.startTime
        )

        if (!exists) {
          const isPast = dateStr < todayStr
          const newSession: ScheduleSession = {
            id: `sess-${params.dojoId}-${dateStr}-${Date.now()}-${day}`,
            scheduleId: schedule.id,
            dojoId: params.dojoId,
            classDate: dateStr,
            startTime: params.startTime,
            endTime: params.endTime,
            classType: params.classType,
            sessionStatus: isPast ? 'completed' : 'scheduled',
            notes: params.notes || '',
            instructor: params.instructor || 'Sensei',
            title: params.title || `${params.classType} (${params.startTime} - ${params.endTime})`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          this.scheduleSessions.push(newSession)
          createdSessions.push(newSession)
        }
      }
    }

    this.save()
    return { schedule, sessions: createdSessions }
  }

  // --- ATTENDANCE MANAGEMENT ---
  public getStudentAttendance(params?: {
    dojoId?: string
    sessionId?: string
    studentId?: string
    year?: number
    month?: number
    date?: string
  }): StudentAttendance[] {
    return this.studentAttendance.filter((a) => {
      if (params?.dojoId && a.dojoId !== params.dojoId) return false
      if (params?.sessionId && a.sessionId !== params.sessionId) return false
      if (params?.studentId && a.studentId !== params.studentId) return false
      if (params?.date && a.classDate !== params.date) return false
      if (params?.year && params?.month) {
        const prefix = `${params.year}-${String(params.month).padStart(2, '0')}`
        if (!a.classDate.startsWith(prefix)) return false
      }
      return true
    })
  }

  public hasAttendanceForSession(sessionId: string): boolean {
    return this.studentAttendance.some((a) => a.sessionId === sessionId)
  }

  public saveSessionAttendance(params: {
    sessionId: string
    dojoId: string
    classDate: string
    records: { studentId: string; status: AttendanceStatus; remarks?: string }[]
    markedBy: string
    modificationReason?: string
  }): void {
    const timestamp = new Date().toISOString()

    params.records.forEach((rec) => {
      // Find existing record by sessionId + studentId
      const existingIdx = this.studentAttendance.findIndex(
        (a) => (a.sessionId === params.sessionId || a.classDate === params.classDate) && a.studentId === rec.studentId
      )

      if (existingIdx >= 0) {
        const oldRecord = this.studentAttendance[existingIdx]
        if (oldRecord.attendanceStatus !== rec.status) {
          // Log audit entry
          const st = this.getStudent(rec.studentId)
          this.auditLogs.unshift({
            id: `audit-${Date.now()}-${rec.studentId}`,
            attendanceId: oldRecord.id,
            studentId: rec.studentId,
            studentName: st?.name || rec.studentId,
            sessionId: params.sessionId,
            classDate: params.classDate,
            oldStatus: oldRecord.attendanceStatus,
            newStatus: rec.status,
            modifiedBy: params.markedBy,
            modificationReason: params.modificationReason || 'Sensei manual attendance adjustment',
            modifiedAt: timestamp,
          })
        }

        this.studentAttendance[existingIdx] = {
          ...oldRecord,
          attendanceStatus: rec.status,
          remarks: rec.remarks !== undefined ? rec.remarks : oldRecord.remarks,
          markedBy: params.markedBy,
          updatedAt: timestamp,
        }
      } else {
        // Create new record
        const newRecord: StudentAttendance = {
          id: `att-${rec.studentId}-${params.classDate}-${Date.now()}`,
          sessionId: params.sessionId,
          studentId: rec.studentId,
          dojoId: params.dojoId,
          classDate: params.classDate,
          attendanceStatus: rec.status,
          remarks: rec.remarks,
          markedBy: params.markedBy,
          markedAt: timestamp,
          updatedAt: timestamp,
        }
        this.studentAttendance.push(newRecord)
      }

      // Also sync to legacy attendanceMap for backward compatibility
      const legacyStatus: 'present' | 'late' | 'absent' =
        rec.status === 'excused' ? 'absent' : rec.status
      this.markAttendance(rec.studentId, legacyStatus, 'Dojo Class Session')
    })

    // Update session status to completed if it was scheduled
    const sess = this.scheduleSessions.find((s) => s.id === params.sessionId)
    if (sess && sess.sessionStatus === 'scheduled') {
      sess.sessionStatus = 'completed'
      sess.updatedAt = timestamp
    }

    this.save()
  }

  public getAttendanceAuditLogs(params?: { studentId?: string; sessionId?: string }): AttendanceAuditLog[] {
    return this.auditLogs.filter((l) => {
      if (params?.studentId && l.studentId !== params.studentId) return false
      if (params?.sessionId && l.sessionId !== params.sessionId) return false
      return true
    })
  }

  public toIsoDate(dateStr: string): string {
    if (!dateStr) return ''
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
    const parts = dateStr.split(/[./-]/)
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
      }
    }
    return dateStr
  }

  public calculateStudentMonthlyAttendance(
    studentId: string,
    dojoId: string,
    year: number,
    month: number
  ): StudentMonthlyAttendanceSummary {
    const student = this.getStudent(studentId)
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`

    // 1. Get all scheduled sessions for this dojo and month
    const sessions = this.scheduleSessions.filter(
      (s) => s.dojoId === dojoId && s.classDate.startsWith(monthPrefix)
    )

    // 2. Identify eligible conducted sessions
    const studentJoiningDate = student?.joiningDate || '2020-01-01'
    const normalizedJoiningDate = this.toIsoDate(studentJoiningDate)
    const todayStr = '2026-11-02'

    const conductedSessions = sessions.filter((s) => {
      if (s.sessionStatus === 'cancelled' || s.sessionStatus === 'holiday') {
        return false
      }
      if (s.classDate > todayStr && s.sessionStatus === 'scheduled') {
        return false
      }
      if (normalizedJoiningDate && s.classDate < normalizedJoiningDate) {
        return false
      }
      return true
    })

    // 3. Get student attendance records
    const studentAtts = this.studentAttendance.filter(
      (a) => a.studentId === studentId && a.dojoId === dojoId && a.classDate.startsWith(monthPrefix)
    )

    let presentCount = 0
    let lateCount = 0
    let excusedCount = 0
    let absentCount = 0

    conductedSessions.forEach((s) => {
      const record = studentAtts.find((a) => a.sessionId === s.id || a.classDate === s.classDate)
      if (!record) {
        absentCount++
      } else if (record.attendanceStatus === 'present') {
        presentCount++
      } else if (record.attendanceStatus === 'late') {
        lateCount++
      } else if (record.attendanceStatus === 'excused') {
        excusedCount++
      } else if (record.attendanceStatus === 'absent') {
        absentCount++
      }
    })

    const totalConducted = conductedSessions.length
    const attendancePercentage =
      totalConducted > 0 ? Math.round((presentCount / totalConducted) * 100) : 100

    let rating: 'Excellent' | 'Good' | 'Needs Improvement' | 'Low Attendance' = 'Excellent'
    let ratingColor = '#16a34a'

    if (attendancePercentage >= 90) {
      rating = 'Excellent'
      ratingColor = '#16a34a'
    } else if (attendancePercentage >= 75) {
      rating = 'Good'
      ratingColor = '#2563eb'
    } else if (attendancePercentage >= 50) {
      rating = 'Needs Improvement'
      ratingColor = '#d97706'
    } else {
      rating = 'Low Attendance'
      ratingColor = '#dc2626'
    }

    return {
      studentId,
      studentName: student?.name || studentId,
      memberId: student?.memberId || studentId,
      rank: student?.rank || 'White Belt',
      avatar: student?.avatar?.url,
      dojoId,
      month,
      year,
      totalConducted,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      attendancePercentage,
      rating,
      ratingColor,
    }
  }

  public calculateDojoMonthlyAttendance(dojoId: string, year: number, month: number) {
    const dojoStudents = this.students.filter((s) => s.dojoId === dojoId)
    const summaries = dojoStudents.map((s) =>
      this.calculateStudentMonthlyAttendance(s.id, dojoId, year, month)
    )

    const totalStudents = summaries.length
    const avgAttendance =
      totalStudents > 0
        ? Math.round(summaries.reduce((acc, s) => acc + s.attendancePercentage, 0) / totalStudents)
        : 0

    const totalConducted = summaries.length > 0 ? summaries[0].totalConducted : 0
    const totalPresent = summaries.reduce((acc, s) => acc + s.presentCount, 0)
    const totalLate = summaries.reduce((acc, s) => acc + s.lateCount, 0)
    const totalExcused = summaries.reduce((acc, s) => acc + s.excusedCount, 0)
    const totalAbsent = summaries.reduce((acc, s) => acc + s.absentCount, 0)

    return {
      dojoId,
      year,
      month,
      totalStudents,
      totalConducted,
      avgAttendance,
      totalPresent,
      totalLate,
      totalExcused,
      totalAbsent,
      studentSummaries: summaries,
    }
  }

  public calculateYearlyAttendanceReport(year: number, dojoId?: string) {
    const months = Array.from({ length: 12 }, (_, i) => i + 1)
    const targetDojos = dojoId ? [dojoId] : DOJO_OPTIONS.map((d) => d.id)

    const monthlyBreakdown = months.map((m) => {
      let conducted = 0
      let present = 0
      let records = 0
      let totalPcts = 0
      let studentCount = 0

      targetDojos.forEach((dId) => {
        const stat = this.calculateDojoMonthlyAttendance(dId, year, m)
        conducted = Math.max(conducted, stat.totalConducted)
        present += stat.totalPresent
        records += stat.totalPresent + stat.totalLate + stat.totalExcused + stat.totalAbsent
        totalPcts += stat.avgAttendance * stat.totalStudents
        studentCount += stat.totalStudents
      })

      const avgPct = studentCount > 0 ? Math.round(totalPcts / studentCount) : 0
      const monthName = new Date(year, m - 1, 1).toLocaleString('en-US', { month: 'short' })

      return {
        month: m,
        monthName,
        conducted,
        present,
        records,
        avgAttendance: avgPct,
      }
    })

    const relevantStudents = this.students.filter((s) => !dojoId || s.dojoId === dojoId)
    const studentYearlyStats = relevantStudents.map((s) => {
      let totalConducted = 0
      let totalPresent = 0
      let totalLate = 0
      let totalExcused = 0
      let totalAbsent = 0

      months.forEach((m) => {
        const ms = this.calculateStudentMonthlyAttendance(s.id, s.dojoId || 'dojo-ranganagar', year, m)
        totalConducted += ms.totalConducted
        totalPresent += ms.presentCount
        totalLate += ms.lateCount
        totalExcused += ms.excusedCount
        totalAbsent += ms.absentCount
      })

      const yearlyPct = totalConducted > 0 ? Math.round((totalPresent / totalConducted) * 100) : 100

      return {
        student: s,
        totalConducted,
        totalPresent,
        totalLate,
        totalExcused,
        totalAbsent,
        yearlyPct,
      }
    })

    const sorted = [...studentYearlyStats].sort((a, b) => b.yearlyPct - a.yearlyPct)
    const highestAttendanceStudents = sorted.slice(0, 5)
    const lowAttendanceStudents = sorted.filter((s) => s.yearlyPct < 75)

    const totalConductedYear = monthlyBreakdown.reduce((acc, m) => acc + m.conducted, 0)
    const totalRecordsYear = monthlyBreakdown.reduce((acc, m) => acc + m.records, 0)
    const overallPct =
      studentYearlyStats.length > 0
        ? Math.round(
            studentYearlyStats.reduce((acc, s) => acc + s.yearlyPct, 0) / studentYearlyStats.length
          )
        : 0

    return {
      year,
      totalConductedYear,
      totalRecordsYear,
      overallPct,
      monthlyBreakdown,
      highestAttendanceStudents,
      lowAttendanceStudents,
    }
  }

  public getStudentFullAttendanceHistory(studentId: string) {
    const records = this.studentAttendance.filter((a) => a.studentId === studentId)

    return records
      .map((r) => {
        const session = this.scheduleSessions.find(
          (s) => s.id === r.sessionId || s.classDate === r.classDate
        )
        return {
          ...r,
          sessionTitle: session?.title || 'Karate Training Session',
          startTime: session?.startTime || '06:30 PM',
          endTime: session?.endTime || '08:00 PM',
          classType: session?.classType || 'Regular Training',
          instructor: session?.instructor || 'Sensei',
        }
      })
      .sort((a, b) => b.classDate.localeCompare(a.classDate))
  }

  public getSession(): UserSession {
    return this.session
  }

  public getSchedule(): TrainingSession[] {
    return this.schedule
  }

  public getHolidays(): DojoHoliday[] {
    return this.holidays
  }

  public getAnnouncements(): Announcement[] {
    return this.announcements
  }

  public getAttendance(studentId: string): AttendanceRecord[] {
    return this.attendanceMap[studentId] || []
  }

  public getFees(studentId: string): FeeRecord[] {
    return this.feeMap[studentId] || []
  }

  // Authentication
  public normalizeDob(val: string): string {
    return val.replace(/[^0-9]/g, '')
  }

  public loginStudent(nameOrId: string, dobPassword: string): { success: boolean; message: string; student?: Student } {
    const query = nameOrId.trim().toLowerCase()
    const cleanPass = this.normalizeDob(dobPassword)

    const found = this.students.find((s) => {
      const matchName = s.name.toLowerCase().includes(query) || query.includes(s.name.toLowerCase())
      const matchId = s.memberId.toLowerCase() === query || s.id.toLowerCase() === query
      return matchName || matchId
    })

    if (!found) {
      return { success: false, message: 'No student found with that name or Member ID.' }
    }

    const studentDobClean = this.normalizeDob(found.dateOfBirth)
    if (cleanPass !== studentDobClean && dobPassword.trim() !== found.dateOfBirth.trim()) {
      return {
        success: false,
        message: `Incorrect password. Password must be the Date of Birth (e.g. ${found.dateOfBirth}).`,
      }
    }

    this.session = { role: 'student', student: found }
    this.save()
    return { success: true, message: `Welcome back, ${found.name}!`, student: found }
  }

  public loginAdmin(password: string): { success: boolean; message: string } {
    const clean = password.trim().toLowerCase()
    if (clean === 'sensei' || clean === 'admin' || clean === 'koms2026') {
      this.session = { role: 'admin' }
      this.save()
      return { success: true, message: 'Welcome, Sensei.' }
    }
    return { success: false, message: 'Incorrect Admin password. (Default is "sensei" or "koms2026")' }
  }

  public logout() {
    this.session = { role: 'guest' }
    this.save()
  }

  // Admin Attendance Taking
  public markAttendance(studentId: string, status: 'present' | 'late' | 'absent', className = 'Okinawa Shorin Ryu Batch') {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const records = this.attendanceMap[studentId] || []
    
    // Check if attendance already recorded today for this session
    const existingIndex = records.findIndex((r) => r.date === today)
    if (existingIndex >= 0) {
      records[existingIndex].status = status
    } else {
      records.unshift({
        id: `att-${studentId}-${Date.now()}`,
        date: today,
        className,
        instructor: 'Sensei B. Mathan',
        status,
      })
    }
    this.attendanceMap[studentId] = [...records]
    this.save()
  }

  public markBatchAttendance(status: 'present' | 'late' | 'absent') {
    for (const s of this.students) {
      this.markAttendance(s.id, status)
    }
  }

  // QR Scanning
  public scanQrPass(rawToken: string): { success: boolean; message: string; student?: Student; status?: string } {
    const token = rawToken.trim()
    const student = this.students.find(
      (s) =>
        token.includes(s.memberId) ||
        token.includes(s.id) ||
        token.toLowerCase().includes(s.name.toLowerCase()) ||
        s.memberId.toLowerCase() === token.toLowerCase()
    )

    if (!student) {
      return { success: false, message: `Invalid pass token: "${token}". Student not recognized.` }
    }

    // Mark student present
    this.markAttendance(student.id, 'present', 'Dojo Tatami Check-In (QR Pass)')
    return {
      success: true,
      message: `Pass Verified! Attendance recorded as Present for ${student.name} (${student.memberId}).`,
      student,
      status: 'VERIFIED_ACTIVE',
    }
  }

  // Schedule & Holidays
  public addTrainingScheduleSession(session: Omit<TrainingSession, 'id'>) {
    const newSession: TrainingSession = {
      ...session,
      id: `sch-${Date.now()}`,
    }
    this.schedule = [...this.schedule, newSession]
    this.save()
  }

  public deleteTrainingScheduleSession(id: string) {
    this.schedule = this.schedule.filter((s) => s.id !== id)
    this.save()
  }

  public addHoliday(holiday: Omit<DojoHoliday, 'id'>) {
    const newHoliday: DojoHoliday = {
      ...holiday,
      id: `hol-${Date.now()}`,
    }
    this.holidays = [newHoliday, ...this.holidays]
    this.save()
  }

  public deleteHoliday(id: string) {
    this.holidays = this.holidays.filter((h) => h.id !== id)
    this.save()
  }

  // Fee management
  public recordPayment(studentId: string, label: string, amount: number) {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const records = this.feeMap[studentId] || []
    records.unshift({
      id: `fee-${studentId}-${Date.now()}`,
      label,
      amount,
      dueDate: today,
      paidDate: today,
      status: 'paid',
    })
    this.feeMap[studentId] = [...records]
    this.save()
  }

  // Registration Enquiries
  public getRegistrations(): RegistrationEnquiry[] {
    return this.registrations
  }

  public submitRegistrationEnquiry(
    input: Omit<RegistrationEnquiry, 'id' | 'submittedAt' | 'status'>
  ): RegistrationEnquiry {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const newEnquiry: RegistrationEnquiry = {
      ...input,
      id: `KOMS-REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      submittedAt: today,
      status: 'pending_review',
    }
    this.registrations = [newEnquiry, ...this.registrations]
    this.save()
    return newEnquiry
  }

  public checkEnquiryStatus(query: string): RegistrationEnquiry | undefined {
    const clean = query.trim().toLowerCase()
    if (!clean) return undefined
    return this.registrations.find(
      (r) =>
        r.id.toLowerCase() === clean ||
        r.guardianPhone.replace(/\D/g, '') === clean.replace(/\D/g, '') ||
        r.studentName.toLowerCase().includes(clean)
    )
  }

  public updateEnquiryStatus(id: string, status: 'approved' | 'rejected', notes?: string) {
    this.registrations = this.registrations.map((r) =>
      r.id === id ? { ...r, status, reviewerNotes: notes || r.reviewerNotes } : r
    )
    this.save()
  }

  // Grand Master CMS Data
  public getCmsData(): GrandMasterCmsData {
    return this.cmsData
  }

  public updateCmsData(patch: Partial<GrandMasterCmsData>) {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    this.cmsData = {
      ...this.cmsData,
      ...patch,
      lastUpdated: today,
    }
    this.save()
  }

  // Role Authentication
  public loginWithCredentials(
    identifier: string,
    passwordInput: string
  ): { success: boolean; message: string; role?: UserRole; student?: Student } {
    const cleanId = identifier.trim().toLowerCase()
    const cleanPass = passwordInput.trim().toLowerCase()

    // 1. Grand Master Credentials
    if (
      (cleanId === 'grandmaster@koms.in' || cleanId === 'grandmaster' || cleanId === 'soke') &&
      (cleanPass === 'sensei' || cleanPass === 'koms2026' || cleanPass === 'grandmaster')
    ) {
      this.session = {
        role: 'grandmaster',
        userName: 'Hanshi Grand Master (9th Dan)',
        userEmail: 'grandmaster@koms.in',
      }
      this.save()
      return { success: true, message: 'Welcome to Grand Master Portal.', role: 'grandmaster' }
    }

    // 2. Master Credentials (Rubeshwaren & Janathanan for Ranga Nagar Dojo)
    if (
      (cleanId === 'rubeshwaren@koms.in' || cleanId === 'rubeshwaren' || cleanId === 'rubesh' ||
       cleanId === 'janathanan@koms.in' || cleanId === 'janathanan' ||
       cleanId === 'mathan@koms.in' || cleanId === 'master' || cleanId === 'sensei mathan' || cleanId === 'ravikanth@koms.in') &&
      (cleanPass === 'sensei' || cleanPass === 'koms2026' || cleanPass === 'master' || cleanPass === '123456')
    ) {
      const isJanathanan = cleanId.includes('janathanan')
      const masterName = isJanathanan ? 'Sensei Janathanan' : 'Sensei Rubeshwaren'
      const userEmail = isJanathanan ? 'janathanan@koms.in' : 'rubeshwaren@koms.in'
      this.session = {
        role: 'master',
        userName: `${masterName} (Ranga Nagar)`,
        userEmail,
        masterName,
        assignedDojos: ['dojo-ranganagar', 'dojo-perungalathur'],
      }
      this.save()
      return { success: true, message: `Welcome, ${masterName}.`, role: 'master' }
    }

    // 3. Senior Instructor Credentials
    if (
      (cleanId === 'ashokan@koms.in' || cleanId === 'senior' || cleanId === 'karthi@koms.in') &&
      (cleanPass === 'sensei' || cleanPass === 'koms2026' || cleanPass === 'senior')
    ) {
      this.session = {
        role: 'senior',
        userName: 'Sensei Ashokan A. (3rd Dan)',
        userEmail: 'ashokan@koms.in',
        masterName: 'Sensei Ashokan A.',
        assignedDojos: ['dojo-ranganagar'],
      }
      this.save()
      return { success: true, message: 'Welcome to Senior Instructor Portal.', role: 'senior' }
    }

    // 4. General Admin override
    if (cleanPass === 'sensei' || cleanPass === 'admin' || cleanPass === 'koms2026') {
      if (cleanId === 'admin' || cleanId === 'admin@koms.in') {
        this.session = { role: 'admin', userName: 'Administrator' }
        this.save()
        return { success: true, message: 'Welcome, Sensei Administrator.', role: 'admin' }
      }
    }

    // 5. Student matching by email, member ID, or name
    const foundStudent = this.students.find((s) => {
      const matchEmail = s.email?.toLowerCase() === cleanId
      const matchId = s.memberId?.toLowerCase() === cleanId || s.id.toLowerCase() === cleanId
      const matchName = s.name.toLowerCase().includes(cleanId) || cleanId.includes(s.name.toLowerCase())
      return matchEmail || matchId || matchName
    })

    if (foundStudent) {
      const studentDobClean = this.normalizeDob(foundStudent.dateOfBirth)
      const inputPassClean = this.normalizeDob(passwordInput)
      if (inputPassClean === studentDobClean || passwordInput.trim() === foundStudent.dateOfBirth.trim() || cleanPass === 'koms' || cleanPass === 'student') {
        this.session = { role: 'student', student: foundStudent, userName: foundStudent.name, userEmail: foundStudent.email }
        this.save()
        return { success: true, message: `Welcome back, ${foundStudent.name}!`, role: 'student', student: foundStudent }
      } else {
        return {
          success: false,
          message: `Incorrect password. For students, enter Date of Birth (e.g. ${foundStudent.dateOfBirth}).`,
        }
      }
    }

    return {
      success: false,
      message: 'No account recognized with those credentials. Please check your email/User ID and password.',
    }
  }

  public loginAsRole(role: UserRole, studentId?: string, customName?: string) {
    if (role === 'student') {
      const s = studentId ? this.getStudent(studentId) : this.students[0]
      this.session = { role: 'student', student: s, userName: s?.name, userEmail: s?.email }
    } else if (role === 'grandmaster') {
      this.session = { role: 'grandmaster', userName: 'Hanshi Grand Master (9th Dan)', userEmail: 'grandmaster@koms.in' }
    } else if (role === 'master') {
      const name = customName || 'Sensei Rubeshwaren'
      const isJanathanan = name.toLowerCase().includes('janathanan')
      this.session = {
        role: 'master',
        userName: isJanathanan ? 'Sensei Janathanan (Ranga Nagar)' : 'Sensei Rubeshwaren (Ranga Nagar)',
        userEmail: isJanathanan ? 'janathanan@koms.in' : 'rubeshwaren@koms.in',
        masterName: isJanathanan ? 'Sensei Janathanan' : 'Sensei Rubeshwaren',
        assignedDojos: ['dojo-ranganagar', 'dojo-perungalathur'],
      }
    } else if (role === 'senior') {
      const name = customName || 'Sensei Janathanan'
      this.session = {
        role: 'senior',
        userName: `${name} (Ranga Nagar)`,
        userEmail: 'janathanan@koms.in',
        masterName: name,
        assignedDojos: ['dojo-ranganagar'],
      }
    } else if (role === 'admin') {
      this.session = { role: 'admin', userName: 'KOMS Administrator' }
    } else {
      this.session = { role: 'guest' }
    }
    this.save()
  }

  /* =========================================================================
     MULTI-DOJO & GRAND MASTER MANAGEMENT
     ========================================================================= */
  public getRegisteredDojos(includeAll = false): RegisteredDojo[] {
    if (includeAll || this.session.role === 'grandmaster' || this.session.role === 'admin') {
      return this.registeredDojos
    }
    // Public directory only returns ACTIVE dojos
    return this.registeredDojos.filter((d) => d.status === 'ACTIVE')
  }

  public getRegisteredDojo(id: string): RegisteredDojo | undefined {
    return this.registeredDojos.find((d) => d.id === id)
  }

  public registerNewDojo(data: Omit<RegisteredDojo, 'id' | 'registrationId' | 'status' | 'studentCount' | 'seniorCount' | 'registrationDate'>): RegisteredDojo {
    const id = `dojo-${data.name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 16)}-${Date.now().toString().slice(-4)}`
    const regId = `KOMS-DOJO-${String(this.registeredDojos.length + 1).padStart(3, '0')}`
    const newDojo: RegisteredDojo = {
      ...data,
      id,
      registrationId: regId,
      status: 'PENDING',
      studentCount: 0,
      seniorCount: 0,
      registrationDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    }
    this.registeredDojos.push(newDojo)
    this.logAudit('REGISTER_DOJO_SUBMITTED', 'DOJO', id, `New dojo registered: ${data.name} by Master ${data.masterName}`)
    this.save()
    return newDojo
  }

  public approveDojo(dojoId: string): boolean {
    const d = this.registeredDojos.find((dojo) => dojo.id === dojoId)
    if (!d) return false
    d.status = 'ACTIVE'
    delete d.rejectionReason
    this.logAudit('APPROVE_DOJO', 'DOJO', dojoId, `Grand Master approved dojo "${d.name}" (${d.registrationId})`)
    this.save()
    return true
  }

  public rejectDojo(dojoId: string, reason: string): boolean {
    const d = this.registeredDojos.find((dojo) => dojo.id === dojoId)
    if (!d) return false
    d.status = 'REJECTED'
    d.rejectionReason = reason
    this.logAudit('REJECT_DOJO', 'DOJO', dojoId, `Grand Master rejected dojo "${d.name}": ${reason}`, reason)
    this.save()
    return true
  }

  public suspendDojo(dojoId: string, reason: string): boolean {
    const d = this.registeredDojos.find((dojo) => dojo.id === dojoId)
    if (!d) return false
    d.status = 'SUSPENDED'
    d.suspensionReason = reason
    this.logAudit('SUSPEND_DOJO', 'DOJO', dojoId, `Grand Master suspended dojo "${d.name}": ${reason}`, reason)
    this.save()
    return true
  }

  public reactivateDojo(dojoId: string): boolean {
    const d = this.registeredDojos.find((dojo) => dojo.id === dojoId)
    if (!d) return false
    d.status = 'ACTIVE'
    delete d.suspensionReason
    this.logAudit('REACTIVATE_DOJO', 'DOJO', dojoId, `Grand Master reactivated dojo "${d.name}"`)
    this.save()
    return true
  }

  /* =========================================================================
     MASTER PROFILE & COMMON UI DOJO SYNCHRONIZATION
     ========================================================================= */
  public getMasterProfile(): MasterProfileData {
    return this.masterProfile
  }

  public updateMasterProfile(updates: Partial<MasterProfileData>): MasterProfileData {
    this.masterProfile = {
      ...this.masterProfile,
      ...updates,
    }

    // Bidirectional Synchronization: Automatically update associated Dojo in Common UI directory!
    const targetDojoId = updates.dojoId || this.masterProfile.dojoId || 'dojo-ranganagar'
    const dojoIndex = this.publicDojos.findIndex(
      (d) => d.id === targetDojoId || d.name.toLowerCase().includes('ranga nagar')
    )

    if (dojoIndex >= 0) {
      const current = this.publicDojos[dojoIndex]
      const updatedDojo: PublicDojo = {
        ...current,
        headInstructor: updates.name || current.headInstructor,
        instructorRank: updates.danRank || updates.rank || current.instructorRank,
        instructorExperience: updates.experience || current.instructorExperience,
        instructorAvatar: updates.avatar || current.instructorAvatar,
        instructorBio: updates.biography || current.instructorBio,
        instructorQualifications: updates.qualifications || current.instructorQualifications,
        instructorAchievements: updates.achievements || current.instructorAchievements,
        phone: updates.phone || current.phone,
        email: updates.email || current.email,
      }
      this.publicDojos[dojoIndex] = updatedDojo
    }

    // Also synchronize registered dojos list
    const regIndex = this.registeredDojos.findIndex((d) => d.id === targetDojoId)
    if (regIndex >= 0) {
      this.registeredDojos[regIndex].masterName = updates.name || this.registeredDojos[regIndex].masterName
      this.registeredDojos[regIndex].masterPhone = updates.phone || this.registeredDojos[regIndex].masterPhone
      this.registeredDojos[regIndex].masterEmail = updates.email || this.registeredDojos[regIndex].masterEmail
      if (updates.achievements) {
        this.registeredDojos[regIndex].achievements = updates.achievements
      }
    }

    this.logAudit(
      'UPDATE_MASTER_PROFILE',
      'PROFILE',
      this.masterProfile.id || 'master-1',
      `Master Profile updated for ${this.masterProfile.name}: Dan Rank ${this.masterProfile.danRank || this.masterProfile.rank}`
    )

    this.save()
    return this.masterProfile
  }

  public getPublicDojos(includeAll = false): PublicDojo[] {
    if (includeAll) return this.publicDojos
    return this.publicDojos.filter((d) => d.status !== 'INACTIVE')
  }

  public getPublicDojo(id: string): PublicDojo | undefined {
    return this.publicDojos.find((d) => d.id === id)
  }

  public updatePublicDojo(dojoId: string, updates: Partial<PublicDojo>): PublicDojo | null {
    const idx = this.publicDojos.findIndex((d) => d.id === dojoId)
    if (idx < 0) return null

    this.publicDojos[idx] = {
      ...this.publicDojos[idx],
      ...updates,
    }

    // Also update registered dojos registry if matching
    const regIdx = this.registeredDojos.findIndex((d) => d.id === dojoId)
    if (regIdx >= 0) {
      if (updates.name) this.registeredDojos[regIdx].name = updates.name
      if (updates.address) this.registeredDojos[regIdx].address = updates.address
      if (updates.area) this.registeredDojos[regIdx].area = updates.area
      if (updates.phone) this.registeredDojos[regIdx].masterPhone = updates.phone
      if (updates.monthlyFee) this.registeredDojos[regIdx].monthlyFee = updates.monthlyFee
      if (updates.entryFee) this.registeredDojos[regIdx].entryFee = updates.entryFee
      if (updates.trainingDays) this.registeredDojos[regIdx].weeklySchedule = updates.trainingDays
      if (updates.status) this.registeredDojos[regIdx].status = updates.status
    }

    this.logAudit('UPDATE_DOJO_PROFILE', 'DOJO', dojoId, `Dojo profile updated: ${this.publicDojos[idx].name}`)
    this.save()
    return this.publicDojos[idx]
  }

  /* =========================================================================
     JOIN REQUESTS (FROM COMMON UI -> MASTER PANEL)
     ========================================================================= */
  public getJoinRequests(dojoId?: string): RegistrationEnquiry[] {
    if (!dojoId) return this.registrations
    return this.registrations.filter((r) => r.dojoId === dojoId || !r.dojoId)
  }

  public submitJoinRequest(input: Omit<RegistrationEnquiry, 'id' | 'submittedAt' | 'status'>): RegistrationEnquiry {
    return this.submitRegistrationEnquiry(input)
  }

  public approveJoinRequest(requestId: string, options?: { monthlyFee?: number; rank?: string }): Student | null {
    const req = this.registrations.find((r) => r.id === requestId)
    if (!req) return null

    req.status = 'approved'

    // Automatically create Student in Student Management
    const studentCode = `KOMS-${new Date().getFullYear()}-${String(this.students.length + 1).padStart(3, '0')}`
    const newStudent: Student = {
      id: studentCode,
      name: req.studentName,
      belt: (options?.rank || 'White Belt (Beginner)') as any,
      rank: options?.rank || 'White Belt (Beginner)',
      dojoId: req.dojoId || 'dojo-ranganagar',
      phone: req.guardianPhone || '',
      email: req.email || '',
      address: req.address || 'Chennai, Tamil Nadu',
      joiningDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'active',
      monthlyFee: options?.monthlyFee || 1000,
      avatar: req.gender === 'Female' ? '/students/image7.jpeg' : '/students/image1.jpeg',
      gender: (req.gender as any) || 'Not Specified',
      age: req.age ? parseInt(req.age, 10) : 12,
      guardianName: req.fatherName || req.motherName || 'Parent / Guardian',
      guardianPhone: req.guardianPhone || '',
      attendancePercentage: 100,
    }

    this.students.unshift(newStudent)
    this.logAudit('APPROVE_JOIN_REQUEST', 'STUDENT', studentCode, `Master approved join request for ${req.studentName} (${studentCode})`)

    this.save()
    return newStudent
  }

  public rejectJoinRequest(requestId: string, reason?: string): boolean {
    const req = this.registrations.find((r) => r.id === requestId)
    if (!req) return false

    req.status = 'rejected'
    if (reason) {
      req.reviewerNotes = reason
    }

    this.logAudit('REJECT_JOIN_REQUEST', 'STUDENT', requestId, `Master rejected join request for ${req.studentName}: ${reason || 'Capacity full'}`)
    this.save()
    return true
  }

  /* =========================================================================
     SENIOR SUB-ADMINISTRATOR MANAGEMENT
     ========================================================================= */
  public getSeniors(dojoId?: string): SeniorAssignment[] {
    if (!dojoId) return this.seniorAssignments
    return this.seniorAssignments.filter((s) => s.dojoId === dojoId && s.status === 'active')
  }

  public assignSenior(
    dojoId: string,
    studentId: string,
    permissions: SeniorPermissionSet,
    assignedBy = 'Dojo Master'
  ): SeniorAssignment | null {
    const student = this.getStudent(studentId)
    if (!student) return null

    const existing = this.seniorAssignments.find((s) => s.studentId === studentId && s.dojoId === dojoId)
    if (existing) {
      existing.status = 'active'
      existing.permissions = { ...permissions }
      this.logAudit('UPDATE_SENIOR_PERMISSIONS', 'SENIOR', existing.id, `Updated permissions for Senior ${student.name}`)
      this.save()
      return existing
    }

    const assignment: SeniorAssignment = {
      id: `sen-${Date.now()}`,
      studentId,
      studentName: student.name,
      memberId: student.memberId,
      dojoId,
      assignedByMaster: assignedBy,
      assignedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      permissions,
      status: 'active',
    }
    this.seniorAssignments.push(assignment)
    this.logAudit('ASSIGN_SENIOR', 'SENIOR', assignment.id, `Assigned ${student.name} as Senior in dojo ${dojoId}`)
    this.save()
    return assignment
  }

  public updateSeniorPermissions(assignmentId: string, permissions: SeniorPermissionSet): boolean {
    const s = this.seniorAssignments.find((sa) => sa.id === assignmentId)
    if (!s) return false
    s.permissions = { ...permissions }
    this.logAudit('UPDATE_SENIOR_PERMISSIONS', 'SENIOR', assignmentId, `Permissions updated for Senior ${s.studentName}`)
    this.save()
    return true
  }

  public revokeSenior(assignmentId: string): boolean {
    const s = this.seniorAssignments.find((sa) => sa.id === assignmentId)
    if (!s) return false
    s.status = 'revoked'
    this.logAudit('REVOKE_SENIOR', 'SENIOR', assignmentId, `Senior privileges revoked for ${s.studentName}`)
    this.save()
    return true
  }

  /* =========================================================================
     STUDENT REGISTRATIONS (METHOD 1: NEW & METHOD 2: EXISTING TRANSFER)
     ========================================================================= */
  public getRegistrationRequests(dojoId?: string): StudentRegistrationRequest[] {
    if (!dojoId) return this.studentRegRequests
    return this.studentRegRequests.filter((r) => r.targetDojoId === dojoId)
  }

  public submitStudentRegistration(request: Omit<StudentRegistrationRequest, 'id' | 'status' | 'submittedAt'>): StudentRegistrationRequest {
    const id = `KOMS-REQ-${Date.now().toString().slice(-6)}`
    const newReq: StudentRegistrationRequest = {
      ...request,
      id,
      status: 'PENDING',
      submittedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    }
    this.studentRegRequests.unshift(newReq)
    this.logAudit(
      request.isTransfer ? 'STUDENT_TRANSFER_REQUEST' : 'NEW_STUDENT_REGISTRATION',
      'STUDENT',
      id,
      `${request.isTransfer ? 'Transfer request' : 'New student application'} for ${request.fullName} to ${request.targetDojoName}`
    )
    this.save()
    return newReq
  }

  public approveStudentRegistration(requestId: string, reviewerName: string): { success: boolean; student?: Student; message: string } {
    const req = this.studentRegRequests.find((r) => r.id === requestId)
    if (!req) return { success: false, message: 'Registration request not found.' }

    req.status = 'APPROVED'
    req.reviewedAt = new Date().toISOString()
    req.reviewedBy = reviewerName

    let memberId = req.existingMemberId
    if (!memberId) {
      const year = new Date().getFullYear()
      const seq = String(this.students.length + 1).padStart(3, '0')
      memberId = `KOMS-${year}-${seq}`
    }

    const newStudent: Student = {
      id: `std-${Date.now()}`,
      name: req.fullName,
      memberId,
      email: `${req.fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@koms.in`,
      phone: req.mobile,
      dateOfBirth: req.dob,
      age: req.age,
      gender: req.gender,
      bloodGroup: req.bloodGroup,
      joiningDate: req.dateOfJoining || new Date().toISOString().slice(0, 10),
      fatherName: req.fatherName,
      motherName: req.motherName,
      whatsapp: req.whatsapp || req.mobile,
      alternatePhone: req.alternatePhone,
      address: req.address,
      dojoId: req.targetDojoId,
      entranceFee: req.entryFeeExempt ? 0 : 1000,
      rank: req.currentBeltGrade || req.previousBeltGrade || 'White Belt',
      status: 'active',
      emergencyContact: req.fatherName ? `${req.fatherName} (${req.mobile})` : req.mobile,
    }

    this.students.push(newStudent)

    // Add entry fee record if not exempt
    if (!req.entryFeeExempt) {
      this.feeLedger.push({
        id: `fee-entry-${newStudent.id}`,
        studentId: newStudent.id,
        studentName: newStudent.name,
        memberId: newStudent.memberId,
        dojoId: newStudent.dojoId,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        feeType: 'ENTRY_FEE',
        amountDue: 1000,
        amountPaid: 0,
        balance: 1000,
        status: 'PENDING',
        recordedBy: reviewerName,
      })
    }

    this.logAudit(
      'APPROVE_STUDENT_REGISTRATION',
      'STUDENT',
      newStudent.id,
      `Approved ${req.fullName} (${memberId}) into dojo ${req.targetDojoId} by ${reviewerName}`
    )
    this.save()
    return { success: true, student: newStudent, message: `Student approved! Generated Student ID: ${memberId}` }
  }

  public rejectStudentRegistration(requestId: string, reason: string, reviewerName: string): boolean {
    const req = this.studentRegRequests.find((r) => r.id === requestId)
    if (!req) return false
    req.status = 'REJECTED'
    req.rejectionReason = reason
    req.reviewedAt = new Date().toISOString()
    req.reviewedBy = reviewerName
    this.logAudit('REJECT_STUDENT_REGISTRATION', 'STUDENT', requestId, `Rejected application for ${req.fullName}: ${reason}`, reason)
    this.save()
    return true
  }

  /* =========================================================================
     BELT GRADING & PROGRESSION
     ========================================================================= */
  public getGradingEvents(): GradingEvent[] {
    return this.gradingEvents
  }

  public createGradingEvent(event: Omit<GradingEvent, 'id'>): GradingEvent {
    const newEvent: GradingEvent = {
      ...event,
      id: `grade-ev-${Date.now()}`,
    }
    this.gradingEvents.unshift(newEvent)
    this.logAudit('CREATE_GRADING_EVENT', 'GRADING', newEvent.id, `Created grading event: ${event.title}`)
    this.save()
    return newEvent
  }

  public getBeltGradingHistory(studentId?: string): BeltGradingRecord[] {
    if (!studentId) return this.beltGradingRecords
    return this.beltGradingRecords.filter((b) => b.studentId === studentId)
  }

  public recordBeltPromotion(record: Omit<BeltGradingRecord, 'id'>): BeltGradingRecord {
    const id = `grade-rec-${Date.now()}`
    const fullRecord: BeltGradingRecord = { ...record, id }
    this.beltGradingRecords.push(fullRecord)

    // Update student's current rank
    const student = this.students.find((s) => s.id === record.studentId || s.memberId === record.memberId)
    if (student) {
      student.rank = record.newBelt
    }
    this.logAudit('BELT_PROMOTION_RECORDED', 'GRADING', id, `Promoted ${record.studentName} from ${record.previousBelt} to ${record.newBelt}`)
    this.save()
    return fullRecord
  }

  /* =========================================================================
     TOURNAMENT MANAGEMENT
     ========================================================================= */
  public getTournaments(): Tournament[] {
    return this.tournaments
  }

  public createTournament(t: Omit<Tournament, 'id' | 'createdAt'>): Tournament {
    const newTourn: Tournament = {
      ...t,
      id: `tourn-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    }
    this.tournaments.unshift(newTourn)
    this.logAudit('CREATE_TOURNAMENT', 'TOURNAMENT', newTourn.id, `Grand Master created tournament: ${t.name}`)
    this.save()
    return newTourn
  }

  public getTournamentApplications(tournamentId?: string, dojoId?: string): TournamentStudentApplication[] {
    return this.tournamentApplications.filter((app) => {
      if (tournamentId && app.tournamentId !== tournamentId) return false
      if (dojoId && app.dojoId !== dojoId) return false
      return true
    })
  }

  public registerStudentForTournament(tournamentId: string, studentId: string, category: string, eventType: string): TournamentStudentApplication | null {
    const tourn = this.tournaments.find((t) => t.id === tournamentId)
    const student = this.getStudent(studentId)
    if (!tourn || !student) return null

    const existing = this.tournamentApplications.find((a) => a.tournamentId === tournamentId && a.studentId === student.id)
    if (existing) return existing

    const app: TournamentStudentApplication = {
      id: `tapp-${Date.now()}`,
      tournamentId,
      tournamentName: tourn.name,
      studentId: student.id,
      studentName: student.name,
      memberId: student.memberId,
      dojoId: student.dojoId || 'dojo-ranganagar',
      category,
      eventType,
      appliedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      masterSelectionStatus: 'PENDING',
      grandMasterApprovalStatus: 'PENDING',
    }
    this.tournamentApplications.push(app)
    this.logAudit('STUDENT_TOURNAMENT_APPLIED', 'TOURNAMENT', app.id, `${student.name} applied for tournament "${tourn.name}"`)
    this.save()
    return app
  }

  public nominateTournamentParticipant(applicationId: string, status: 'SELECTED' | 'REPLACED' | 'REJECTED', remarks?: string): boolean {
    const app = this.tournamentApplications.find((a) => a.id === applicationId)
    if (!app) return false
    app.masterSelectionStatus = status
    app.masterRemarks = remarks
    this.logAudit('MASTER_TOURNAMENT_NOMINATION', 'TOURNAMENT', applicationId, `Master updated nomination status to ${status} for ${app.studentName}`)
    this.save()
    return true
  }

  public grandMasterApproveTournamentNomination(applicationId: string, status: 'APPROVED' | 'REJECTED', remarks?: string): boolean {
    const app = this.tournamentApplications.find((a) => a.id === applicationId)
    if (!app) return false
    app.grandMasterApprovalStatus = status
    app.grandMasterRemarks = remarks
    this.logAudit('GM_TOURNAMENT_APPROVAL', 'TOURNAMENT', applicationId, `Grand Master set approval status to ${status} for ${app.studentName}`)
    this.save()
    return true
  }

  /* =========================================================================
     FEE STRUCTURE & IMMUTABLE LEDGER
     ========================================================================= */
  public getDojoFeeStructure(dojoId: string): DojoFeeStructure {
    const found = this.feeStructures.find((f) => f.dojoId === dojoId)
    if (found) return found

    const dojo = this.getRegisteredDojo(dojoId)
    return {
      id: `fee-struct-${dojoId}`,
      dojoId,
      effectiveFromMonth: new Date().getMonth() + 1,
      effectiveFromYear: new Date().getFullYear(),
      entryFee: dojo?.entryFee || 1000,
      monthlyFee: dojo?.monthlyFee || 800,
      dueDay: 5,
      gracePeriodDays: 10,
    }
  }

  public updateFutureFeeStructure(dojoId: string, patch: Partial<DojoFeeStructure>): DojoFeeStructure {
    let current = this.feeStructures.find((f) => f.dojoId === dojoId)
    if (!current) {
      current = {
        id: `fee-struct-${dojoId}-${Date.now()}`,
        dojoId,
        effectiveFromMonth: patch.effectiveFromMonth || new Date().getMonth() + 2, // Next month
        effectiveFromYear: patch.effectiveFromYear || new Date().getFullYear(),
        entryFee: patch.entryFee || 1000,
        monthlyFee: patch.monthlyFee || 800,
        dueDay: patch.dueDay || 5,
        gracePeriodDays: patch.gracePeriodDays || 10,
      }
      this.feeStructures.push(current)
    } else {
      Object.assign(current, patch)
    }
    this.logAudit('UPDATE_FEE_STRUCTURE', 'FEE', dojoId, `Updated future fee structure for dojo ${dojoId} (Monthly: ₹${patch.monthlyFee || current.monthlyFee})`)
    this.save()
    return current
  }

  public getFeeLedger(params?: { dojoId?: string; studentId?: string; month?: number; year?: number }): StudentFeeLedgerItem[] {
    return this.feeLedger.filter((item) => {
      if (params?.dojoId && item.dojoId !== params.dojoId) return false
      if (params?.studentId && item.studentId !== params.studentId) return false
      if (params?.month && item.month !== params.month) return false
      if (params?.year && item.year !== params.year) return false
      return true
    })
  }

  public recordFeePayment(
    itemId: string,
    amount: number,
    paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card',
    receiptNumber: string,
    recordedBy: string
  ): boolean {
    const item = this.feeLedger.find((f) => f.id === itemId)
    if (!item) return false

    item.amountPaid += amount
    item.balance = Math.max(0, item.amountDue - item.amountPaid)
    item.status = item.balance === 0 ? 'PAID' : 'PARTIALLY_PAID'
    item.paymentDate = new Date().toISOString().slice(0, 10)
    item.paymentMethod = paymentMethod
    item.receiptNumber = receiptNumber
    item.recordedBy = recordedBy

    this.logAudit('RECORD_FEE_PAYMENT', 'FEE', itemId, `Recorded payment of ₹${amount} for ${item.studentName} (${item.feeType})`, `Receipt #${receiptNumber}`)
    this.save()
    return true
  }

  /* =========================================================================
     SYSTEM AUDIT LOGS
     ========================================================================= */
  public logAudit(action: string, entityType: 'DOJO' | 'STUDENT' | 'ATTENDANCE' | 'FEE' | 'TOURNAMENT' | 'SENIOR' | 'GRADING', entityId: string, details: string, reason?: string) {
    const log: SystemAuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId: this.session.userEmail || this.session.userName || 'system',
      userName: this.session.userName || 'System Administrator',
      userRole: this.session.role,
      dojoId: this.session.assignedDojos?.[0] || 'global',
      action,
      entityType,
      entityId,
      details,
      reason,
    }
    this.systemAuditLogs.unshift(log)
    // Keep max 200 logs
    if (this.systemAuditLogs.length > 200) {
      this.systemAuditLogs.pop()
    }
  }

  public getSystemAuditLogs(dojoId?: string): SystemAuditLog[] {
    if (!dojoId || this.session.role === 'grandmaster' || this.session.role === 'admin') {
      return this.systemAuditLogs
    }
    return this.systemAuditLogs.filter((l) => l.dojoId === dojoId || l.dojoId === 'global')
  }

  // Profile update
  public updateStudent(studentId: string, patch: Partial<Student>) {
    this.students = this.students.map((s) => (s.id === studentId ? { ...s, ...patch } : s))
    if (this.session.student?.id === studentId) {
      this.session.student = { ...this.session.student, ...patch }
    }
    this.save()
  }
}

export const komsStore = new KomsStore()
