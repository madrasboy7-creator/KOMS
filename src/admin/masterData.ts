export interface MasterStudent {
  id: string
  name: string
  memberId: string
  rank: string
  beltColor: string
  attendancePct: number
  feeStatus: 'Paid' | 'Pending' | 'Overdue'
  feeAmount: number
  feeDueOn: string
  avatar: string
  age?: string
  dob?: string
  phone?: string
  bloodGroup?: string
  guardian?: string
  address?: string
}

export interface MasterProfileData {
  name: string
  role: string
  dojo: string
  age: number
  phone: string
  email: string
  experience: string
  trainedBy: string
  style: string
  achievements: string[]
  avatar: string
}

export interface MasterAchievement {
  id: string
  title: string
  studentName: string
  studentId?: string
  date: string
  category: 'Belt Grades' | 'Certificates' | 'Awards'
  iconType: 'belt' | 'certificate' | 'award'
  color: string
  beltColor?: string
}

export interface MasterTournament {
  id: string
  title: string
  date: string
  location: string
  category: string
  participantsCount: number
  status: 'Registration Open' | 'Pending Approval' | 'Completed'
  isPast?: boolean
  image: string
}

export interface MasterNote {
  id: string
  title: string
  target: 'All Students' | 'Seniors' | 'Junior Dragons' | 'Parents'
  category: 'My Notes' | 'Student Notes' | 'Announcements'
  date: string
  content: string
  pinned?: boolean
}

export interface MasterScheduleItem {
  id: string
  day: string
  time: string
  session: string
  instructor: string
}

export interface MasterActivityItem {
  id: string
  title: string
  timeAgo: string
  type: 'user' | 'fee' | 'award'
}

export const initialMasterProfile: MasterProfileData = {
  name: 'Sensei Rubeshwaren',
  role: 'Master / Sensei',
  dojo: 'Ranga Nagar Dojo, Chennai',
  age: 38,
  phone: '+91 96001 03987',
  email: 'rubeshwaren@koms.in',
  experience: '16 Years',
  trainedBy: 'Hanshi Grand Master (9th Dan)',
  style: 'Okinawa Shorin Ryu Matsumura Seito & Kobudo',
  achievements: [
    '4th Dan Black Belt',
    'National Karate Championship (2012)',
    'International Karate Seminar (2016)',
    'Best Instructor Award (2019)',
  ],
  avatar: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=300',
}

export const initialMasterStudents: MasterStudent[] = [
  {
    id: 'KOMS001',
    name: 'Arun Prasath',
    memberId: 'KOMS001',
    rank: 'White Belt',
    beltColor: '#FFFFFF',
    attendancePct: 95,
    feeStatus: 'Paid',
    feeAmount: 1000,
    feeDueOn: '05-10-2026',
    avatar: '/assets/students/KOMS-2026-001.jpeg',
    age: '12 yrs',
    dob: '14.05.2014',
    phone: '+91 98402 11223',
    bloodGroup: 'O+ve',
    guardian: 'P. Prasath (Father)',
    address: 'No. 14, Gandhi Road, Ranga Nagar, Mudichur, Chennai',
  },
  {
    id: 'KOMS002',
    name: 'Karthik S',
    memberId: 'KOMS002',
    rank: 'Yellow Belt',
    beltColor: '#FACC15',
    attendancePct: 88,
    feeStatus: 'Pending',
    feeAmount: 1000,
    feeDueOn: '15-10-2026',
    avatar: '/assets/students/KOMS-2026-002.jpeg',
    age: '10 yrs',
    dob: '04.08.2016',
    phone: '+91 97908 97178',
    bloodGroup: 'B+ve',
    guardian: 'S. Sundaram (Father)',
    address: 'No. 2, Arivu Street, M.K.B. Nagar, New Perungalathur, Chennai',
  },
  {
    id: 'KOMS003',
    name: 'Meena R',
    memberId: 'KOMS003',
    rank: 'Yellow Belt',
    beltColor: '#FACC15',
    attendancePct: 92,
    feeStatus: 'Paid',
    feeAmount: 1000,
    feeDueOn: '01-10-2026',
    avatar: '/assets/students/KOMS-2026-003.jpeg',
    age: '11 yrs',
    dob: '22.01.2015',
    phone: '+91 94441 22334',
    bloodGroup: 'A+ve',
    guardian: 'R. Ramesh (Father)',
    address: 'Plot 45, Anna Street, Ranga Nagar, Mudichur, Chennai',
  },
  {
    id: 'KOMS004',
    name: 'Sanjay V',
    memberId: 'KOMS004',
    rank: 'Orange Belt',
    beltColor: '#FB923C',
    attendancePct: 80,
    feeStatus: 'Paid',
    feeAmount: 1000,
    feeDueOn: '25-09-2026',
    avatar: '/assets/students/KOMS-2026-004.jpeg',
    age: '13 yrs',
    dob: '04.09.2013',
    phone: '+91 91769 58855',
    bloodGroup: 'B+ve',
    guardian: 'V. Venkatesh (Father)',
    address: '1/38 2nd Street, Ranga Nagar, Mudichur, Chennai',
  },
  {
    id: 'KOMS005',
    name: 'Divya S',
    memberId: 'KOMS005',
    rank: 'Green Belt',
    beltColor: '#16A34A',
    attendancePct: 85,
    feeStatus: 'Overdue',
    feeAmount: 1000,
    feeDueOn: '15-10-2026',
    avatar: '/assets/students/KOMS-2026-005.jpeg',
    age: '14 yrs',
    dob: '12.11.2011',
    phone: '+91 98840 99881',
    bloodGroup: 'AB+ve',
    guardian: 'S. Swaminathan (Father)',
    address: 'No. 36/24A, CTO Colony, West Tambaram, Chennai',
  },
  {
    id: 'KOMS006',
    name: 'Prakash M',
    memberId: 'KOMS006',
    rank: 'Green Belt',
    beltColor: '#16A34A',
    attendancePct: 78,
    feeStatus: 'Paid',
    feeAmount: 1000,
    feeDueOn: '20-09-2026',
    avatar: '/assets/students/KOMS-2026-006.jpeg',
    age: '13 yrs',
    dob: '30.10.2012',
    phone: '+91 99943 18107',
    bloodGroup: 'O+ve',
    guardian: 'M. Mohan (Father)',
    address: '4/444, Gangai Street, Ranga Nagar, Mudichur, Chennai',
  },
  {
    id: 'KOMS007',
    name: 'M.P. Niranjana Sri',
    memberId: 'KOMS007',
    rank: 'Yellow Belt',
    beltColor: '#FACC15',
    attendancePct: 96,
    feeStatus: 'Paid',
    feeAmount: 1000,
    feeDueOn: '04-10-2026',
    avatar: '/assets/students/KOMS-2026-001.jpeg',
    age: '7 yrs',
    dob: '30.10.2019',
    phone: '+91 96001 03987',
    bloodGroup: 'B-ve',
    guardian: 'B. Mathan (Father)',
    address: 'No: 13, Velu Street, M.H.B Nagar, New Perungalathur, Chennai',
  },
  {
    id: 'KOMS008',
    name: 'R. Darshitha',
    memberId: 'KOMS008',
    rank: 'Orange Belt',
    beltColor: '#FB923C',
    attendancePct: 91,
    feeStatus: 'Paid',
    feeAmount: 1000,
    feeDueOn: '18-10-2026',
    avatar: '/assets/students/KOMS-2026-002.jpeg',
    age: '10 yrs',
    dob: '04.08.2016',
    phone: '+91 97908 97178',
    bloodGroup: 'O+ve',
    guardian: 'R. Ravikanth (Father)',
    address: 'NO.2 Arivu Street, M.K.B. Nagar, New Perungalathur, Chennai',
  },
  {
    id: 'KOMS009',
    name: 'R. Harshitha',
    memberId: 'KOMS009',
    rank: 'Orange Belt',
    beltColor: '#FB923C',
    attendancePct: 90,
    feeStatus: 'Paid',
    feeAmount: 1000,
    feeDueOn: '18-10-2026',
    avatar: '/assets/students/KOMS-2026-003.jpeg',
    age: '10 yrs',
    dob: '04.08.2016',
    phone: '+91 97908 97178',
    bloodGroup: 'O+ve',
    guardian: 'R. Ravikanth (Father)',
    address: 'NO. 2 Arivu Street, M.K.B. Nagar, New Perungalathur, Chennai',
  },
  {
    id: 'KOMS010',
    name: 'Gou Maha A',
    memberId: 'KOMS010',
    rank: 'Green Belt',
    beltColor: '#16A34A',
    attendancePct: 84,
    feeStatus: 'Pending',
    feeAmount: 1000,
    feeDueOn: '01-10-2026',
    avatar: '/assets/students/KOMS-2026-004.jpeg',
    age: '13 yrs',
    dob: '04.09.2013',
    phone: '+91 91769 58855',
    bloodGroup: 'B+ve',
    guardian: 'Ashokan A (Father)',
    address: '1/38 2nd street, Ranga Nagar, Mudichur, Chennai',
  },
  {
    id: 'KOMS011',
    name: 'G.P. Prathyumnan',
    memberId: 'KOMS011',
    rank: 'White Belt',
    beltColor: '#FFFFFF',
    attendancePct: 82,
    feeStatus: 'Paid',
    feeAmount: 1000,
    feeDueOn: '30-09-2026',
    avatar: '/assets/students/KOMS-2026-005.jpeg',
    age: '5 yrs',
    dob: '25.09.2020',
    phone: '+91 99529 78876',
    bloodGroup: 'B+ve',
    guardian: 'R. Prabu (Father)',
    address: 'NO. 36/24A, CTO Colony 2nd Street, West Tambaram, Chennai',
  },
  {
    id: 'KOMS012',
    name: 'S. Yajhvhini',
    memberId: 'KOMS012',
    rank: 'Green Belt',
    beltColor: '#16A34A',
    attendancePct: 93,
    feeStatus: 'Paid',
    feeAmount: 1000,
    feeDueOn: '06-10-2026',
    avatar: '/assets/students/KOMS-2026-006.jpeg',
    age: '13 yrs',
    dob: '30.10.2012',
    phone: '+91 99943 18107',
    bloodGroup: 'O+ve',
    guardian: 'D. Senthil Kumar (Father)',
    address: '4/444, Gangai Street, Ranga Nagar, Mudichur, Chennai',
  },
]

export const initialAchievements: MasterAchievement[] = [
  {
    id: 'ach-1',
    title: 'Yellow Belt',
    studentName: 'Arun Prasath',
    date: 'Oct 2, 2026',
    category: 'Belt Grades',
    iconType: 'belt',
    color: '#FACC15',
    beltColor: '#FACC15',
  },
  {
    id: 'ach-2',
    title: 'Participation Certificate',
    studentName: 'Meena R',
    date: 'Sep 15, 2026',
    category: 'Certificates',
    iconType: 'certificate',
    color: '#3B82F6',
  },
  {
    id: 'ach-3',
    title: 'Best Discipline Award',
    studentName: 'Sanjay V',
    date: 'Aug 20, 2026',
    category: 'Awards',
    iconType: 'award',
    color: '#EAB308',
  },
  {
    id: 'ach-4',
    title: 'Orange Belt',
    studentName: 'Divya S',
    date: 'Jul 10, 2026',
    category: 'Belt Grades',
    iconType: 'belt',
    color: '#FB923C',
    beltColor: '#FB923C',
  },
]

export const initialRecentAchievements = [
  { rank: 'Green Belt', student: 'Prakash M', date: 'Oct 1, 2026', color: '#16A34A' },
  { rank: 'Tournament Participation', student: 'Karthik S', date: 'Sep 28, 2026', color: '#EAB308' },
  { rank: 'Certificate', student: 'Meena R', date: 'Sep 10, 2026', color: '#3B82F6' },
]

export const initialTournaments: MasterTournament[] = [
  {
    id: 'tour-1',
    title: 'Chennai Karate Championship 2026',
    date: 'Nov 15 - 16, 2026',
    location: 'Chennai, Tamil Nadu',
    category: 'Kata / Kumite',
    participantsCount: 12,
    status: 'Registration Open',
    image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'tour-2',
    title: 'South India Karate Fest 2026',
    date: 'Dec 12 - 13, 2026',
    location: 'Coimbatore, Tamil Nadu',
    category: 'Kata / Kumite',
    participantsCount: 8,
    status: 'Pending Approval',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400',
  },
]

export const initialPastTournaments = [
  {
    id: 'tour-past-1',
    title: 'Ranga Nagar Open 2025',
    date: 'Jan 10 - 11, 2025',
    location: 'Chennai, Tamil Nadu',
  },
]

export const initialNotes: MasterNote[] = [
  {
    id: 'note-pinned-1',
    title: 'Training Schedule Update',
    target: 'All Students',
    category: 'Announcements',
    date: 'Oct 2, 2026',
    content: "Next week's class will be on Monday, Wednesday and Friday only. Regular timing 5:00 PM - 6:30 PM.",
    pinned: true,
  },
  {
    id: 'note-2',
    title: 'Tournament Registration Details',
    target: 'All Students',
    category: 'Announcements',
    date: 'Sep 28, 2026',
    content: 'Registration for Chennai Karate Championship 2026 is now open. Submit consent forms to Sensei.',
  },
  {
    id: 'note-3',
    title: 'Belt Grading Guidelines',
    target: 'All Students',
    category: 'Student Notes',
    date: 'Sep 20, 2026',
    content: 'All candidates testing for Yellow, Orange and Green belts must complete required syllabus Katas.',
  },
  {
    id: 'note-4',
    title: 'Fee Payment Reminder',
    target: 'All Students',
    category: 'My Notes',
    date: 'Sep 15, 2026',
    content: 'Monthly dojo training dues for October are requested to be settled by the 10th.',
  },
]

export const initialSchedule: MasterScheduleItem[] = [
  { id: 'sch-1', day: 'Monday', time: '5:00 - 6:30 PM', session: '1/2', instructor: 'Sensei Kumar' },
  { id: 'sch-2', day: 'Wednesday', time: '5:00 - 6:30 PM', session: '2/2', instructor: 'Sensei Kumar' },
  { id: 'sch-3', day: 'Friday', time: '5:00 - 6:30 PM', session: '1/2', instructor: 'Sensei Kumar' },
  { id: 'sch-4', day: 'Sunday', time: '5:00 - 6:30 PM', session: 'Special', instructor: 'Sensei Kumar' },
]

export const initialActivities: MasterActivityItem[] = [
  {
    id: 'act-1',
    title: 'New student registration (Arun Prasath)',
    timeAgo: '2 hours ago',
    type: 'user',
  },
  {
    id: 'act-2',
    title: 'Fee paid (Karthik S) - ₹1,000',
    timeAgo: '4 hours ago',
    type: 'fee',
  },
  {
    id: 'act-3',
    title: 'New achievement added (Sanjay - Orange Belt)',
    timeAgo: '1 day ago',
    type: 'award',
  },
]
