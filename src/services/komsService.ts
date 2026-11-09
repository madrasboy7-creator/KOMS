import type {
  Announcement,
  AttendanceRecord,
  Dojo,
  FeeRecord,
  KomsEvent,
  Membership,
  Student,
  StudentDashboard,
  TrainingSession,
} from '../models/koms'
import { apiRequest } from './apiClient'

/** Contract intended to be shared by the future Student and Admin clients. */
export interface KomsService {
  getDashboard(): Promise<StudentDashboard>
  getStudent(): Promise<Student>
  updateStudent(input: Partial<Student>): Promise<Student>
  getDojo(): Promise<Dojo>
  getMembership(): Promise<Membership>
  getAttendance(): Promise<AttendanceRecord[]>
  getFees(): Promise<FeeRecord[]>
  getSchedule(): Promise<TrainingSession[]>
  getAnnouncements(): Promise<Announcement[]>
  getEvents(): Promise<KomsEvent[]>
  getMembershipPass(): Promise<{ token: string; expiresAt: string }>
  signOut(): Promise<void>
}

export const komsApi: KomsService = {
  getDashboard: () => apiRequest('/student/dashboard'),
  getStudent: () => apiRequest('/student/profile'),
  updateStudent: (input) => apiRequest('/student/profile', { method: 'PATCH', body: JSON.stringify(input) }),
  getDojo: () => apiRequest('/student/dojo'),
  getMembership: () => apiRequest('/student/membership'),
  getAttendance: () => apiRequest('/student/attendance'),
  getFees: () => apiRequest('/student/fees'),
  getSchedule: () => apiRequest('/student/schedule'),
  getAnnouncements: () => apiRequest('/student/announcements'),
  getEvents: () => apiRequest('/student/events'),
  getMembershipPass: () => apiRequest('/student/pass'),
  signOut: () => apiRequest('/auth/sign-out', { method: 'POST' }),
}
