export type Id = string

export interface ImageReference {
  id: Id
  url: string
  alt: string
  storageKey?: string
}

export interface Student {
  id: Id
  name: string
  memberId: string
  email: string
  phone: string
  dateOfBirth: string
  emergencyContact: string
  avatar?: ImageReference
  dojoId: Id
  age?: string | number
  joiningDate?: string
  gender?: 'Male' | 'Female' | 'Other'
  bloodGroup?: string
  fatherName?: string
  motherName?: string
  whatsapp?: string
  alternatePhone?: string
  address?: string
  entranceFee?: number
  rank?: string
  status?: 'active' | 'inactive' | 'pending' | 'paused'
  pausedDate?: string
  pauseReason?: string
}

export interface Dojo {
  id: Id
  name: string
  address: string
  phone: string
  email: string
  instructor: string
  description: string
  logo?: ImageReference
  banner?: ImageReference
}

export interface Membership {
  id: Id
  status: 'active' | 'expired' | 'pending'
  plan: string
  startDate: string
  renewalDate: string
}

export interface BeltProgress {
  currentRank: string
  nextRank: string
  progressPercent: number
  awardedDate: string
  requirements: { label: string; complete: boolean }[]
}

export interface AttendanceRecord {
  id: Id
  date: string
  className: string
  instructor: string
  status: 'present' | 'absent' | 'late'
}

export interface FeeRecord {
  id: Id
  label: string
  amount: number
  dueDate: string
  status: 'paid' | 'due' | 'overdue'
  paidDate?: string
}

export interface TrainingSession {
  id: Id
  title: string
  day: string
  startTime: string
  endTime: string
  instructor: string
  level: string
}

export interface Announcement {
  id: Id
  title: string
  body: string
  publishedAt: string
  category: string
}

export interface KomsEvent {
  id: Id
  title: string
  date: string
  location: string
  description: string
  eligibility: string
  image?: ImageReference
}

export interface StudentDashboard {
  student: Student
  dojo: Dojo
  membership: Membership
  belt: BeltProgress
  attendanceRate: number
  upcomingSessions: TrainingSession[]
  announcements: Announcement[]
  events: KomsEvent[]
}

/* =========================================================================
   MONTHLY CLASS SCHEDULE & ATTENDANCE MANAGEMENT SYSTEM TYPES
   ========================================================================= */

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | 'not_marked'

export type ClassType =
  | 'Regular Training'
  | 'Special Training'
  | 'Grading Practice'
  | 'Tournament Practice'

export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'holiday'

export interface MonthlySchedule {
  id: Id
  dojoId: Id
  month: number // 1 to 12
  year: number // e.g. 2026
  createdBy: string
  createdAt: string
  published: boolean
  notes?: string
}

export interface ScheduleSession {
  id: Id
  scheduleId: Id
  dojoId: Id
  classDate: string // YYYY-MM-DD
  startTime: string // e.g. "06:30 PM"
  endTime: string // e.g. "08:00 PM"
  classType: ClassType
  sessionStatus: SessionStatus
  notes?: string
  instructor?: string
  title?: string
  createdAt: string
  updatedAt: string
}

export interface StudentAttendance {
  id: Id
  sessionId: Id
  studentId: Id
  dojoId: Id
  classDate: string // YYYY-MM-DD
  attendanceStatus: AttendanceStatus
  remarks?: string
  markedBy: string
  markedAt: string
  updatedAt: string
}

export interface AttendanceAuditLog {
  id: Id
  attendanceId: Id
  studentId: Id
  studentName?: string
  sessionId: Id
  classDate: string
  oldStatus: AttendanceStatus | 'unmarked'
  newStatus: AttendanceStatus
  modifiedBy: string
  modificationReason: string
  modifiedAt: string
}

export interface StudentMonthlyAttendanceSummary {
  studentId: Id
  studentName: string
  memberId: string
  rank: string
  avatar?: string
  dojoId: Id
  month: number
  year: number
  totalConducted: number
  presentCount: number
  absentCount: number
  lateCount: number
  excusedCount: number
  attendancePercentage: number
  rating: 'Excellent' | 'Good' | 'Needs Improvement' | 'Low Attendance'
  ratingColor: string
}

/* =========================================================================
   SENIOR SUB-ADMINISTRATOR DELEGATIONS & PERMISSIONS
   ========================================================================= */

export interface SeniorPermissionSet {
  canViewStudents: boolean
  canMarkAttendance: boolean
  canViewAttendanceHistory: boolean
  canVerifyStudentDetails: boolean
  canViewBeltDetails: boolean
  canRecommendGrading: boolean
  canUploadPhotos: boolean
  canViewClassSchedules: boolean
  canViewAnnouncements: boolean
}

export interface SeniorAssignment {
  id: Id
  studentId: Id
  studentName: string
  memberId: string
  dojoId: Id
  assignedByMaster: string
  assignedDate: string
  permissions: SeniorPermissionSet
  status: 'active' | 'revoked'
}

/* =========================================================================
   STUDENT REGISTRATIONS (METHOD 1: NEW & METHOD 2: EXISTING TRANSFER)
   ========================================================================= */

export interface StudentRegistrationRequest {
  id: Id
  method: 'new_student' | 'existing_student'
  fullName: string
  dob: string
  age: number
  gender: 'Male' | 'Female' | 'Other'
  bloodGroup: string
  dateOfJoining: string
  address: string
  fatherName: string
  motherName: string
  mobile: string
  whatsapp?: string
  alternatePhone?: string
  previousExperienceYears?: number
  previousBeltGrade?: string
  targetDojoId: Id
  targetDojoName: string
  previousDojo?: string
  previousMaster?: string
  currentBeltGrade?: string
  yearsOfPractice?: number
  existingMemberId?: string
  isTransfer: boolean
  entryFeeExempt: boolean
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  rejectionReason?: string
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
}

/* =========================================================================
   BELT GRADING & PROGRESSION
   ========================================================================= */

export interface BeltGradingRecord {
  id: Id
  studentId: Id
  studentName: string
  memberId: string
  dojoId: Id
  previousBelt: string
  newBelt: string
  gradingDate: string
  examResult: 'PASSED' | 'HONORS' | 'RETEST'
  masterRecommendation: string
  approvedBy: string
  certificateUrl?: string
  certificateNumber?: string
}

export interface GradingEvent {
  id: Id
  title: string
  dojoId?: Id
  examDate: string
  venue: string
  targetRanks: string[]
  examiner: string
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED'
  notes?: string
}

/* =========================================================================
   CENTRAL TOURNAMENT MANAGEMENT
   ========================================================================= */

export interface Tournament {
  id: Id
  name: string
  category: string
  date: string
  venue: string
  registrationDeadline: string
  rules: string
  eligibility: string
  ageCategories: string[]
  beltCategories: string[]
  eventTypes: string[]
  maxParticipants: number
  status: 'ANNOUNCED' | 'REGISTRATION_OPEN' | 'SELECTION_STAGE' | 'APPROVED' | 'COMPLETED'
  createdBy: string
  createdAt: string
  targetDojoIds?: string[]
}

export interface TournamentStudentApplication {
  id: Id
  tournamentId: Id
  tournamentName: string
  studentId: Id
  studentName: string
  memberId: string
  dojoId: Id
  category: string
  eventType: string
  appliedDate: string
  masterSelectionStatus: 'PENDING' | 'SELECTED' | 'REPLACED' | 'REJECTED'
  masterRemarks?: string
  grandMasterApprovalStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  grandMasterRemarks?: string
}

/* =========================================================================
   FEE STRUCTURES & IMMUTABLE HISTORICAL RECORDS
   ========================================================================= */

export interface DojoFeeStructure {
  id: Id
  dojoId: Id
  effectiveFromMonth: number
  effectiveFromYear: number
  entryFee: number
  monthlyFee: number
  dueDay: number
  gracePeriodDays: number
}

export interface StudentFeeLedgerItem {
  id: Id
  studentId: Id
  studentName: string
  memberId: string
  dojoId: Id
  month: number
  year: number
  feeType: 'ENTRY_FEE' | 'MONTHLY_TUITION' | 'EXAM_FEE'
  amountDue: number
  amountPaid: number
  balance: number
  status: 'PAID' | 'PARTIALLY_PAID' | 'PENDING' | 'OVERDUE' | 'WAIVED'
  paymentDate?: string
  paymentMethod?: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card'
  receiptNumber?: string
  recordedBy: string
}

/* =========================================================================
   AUDIT LOGS
   ========================================================================= */

export interface SystemAuditLog {
  id: Id
  timestamp: string
  userId: string
  userName: string
  userRole: string
  dojoId?: string
  action: string
  entityType: 'DOJO' | 'STUDENT' | 'ATTENDANCE' | 'FEE' | 'TOURNAMENT' | 'SENIOR' | 'GRADING'
  entityId: string
  details: string
  reason?: string
}


