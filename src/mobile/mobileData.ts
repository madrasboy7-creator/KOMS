export interface MobileStudent {
  id: string
  rollNo: string
  name: string
  belt: string
  beltColor: string
  status: 'Active' | 'Inactive'
  dojo: string
  avatar: string
  dob: string
  gender: string
  bloodGroup: string
  phone: string
  email: string
  address: string
}

export const mobileStudents: MobileStudent[] = [
  {
    id: 'st-01',
    rollNo: 'CHN001',
    name: 'Arjun R',
    belt: 'Green Belt',
    beltColor: '#22c55e',
    status: 'Active',
    dojo: 'Chennai Dojo',
    avatar: '/assets/card_student_gi.jpg',
    dob: '12 Jan 2010',
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '+91 98765 43210',
    email: 'arjun@email.com',
    address: 'Chennai, TN',
  },
  {
    id: 'st-02',
    rollNo: 'CHN002',
    name: 'Priya S',
    belt: 'Yellow Belt',
    beltColor: '#eab308',
    status: 'Active',
    dojo: 'Chennai Dojo',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    dob: '05 May 2012',
    gender: 'Female',
    bloodGroup: 'B+',
    phone: '+91 98765 43211',
    email: 'priya@email.com',
    address: 'Chennai, TN',
  },
  {
    id: 'st-03',
    rollNo: 'CHN003',
    name: 'Vikram M',
    belt: 'Orange Belt',
    beltColor: '#f97316',
    status: 'Active',
    dojo: 'Chennai Dojo',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    dob: '22 Aug 2009',
    gender: 'Male',
    bloodGroup: 'A+',
    phone: '+91 98765 43212',
    email: 'vikram@email.com',
    address: 'Chennai, TN',
  },
  {
    id: 'st-04',
    rollNo: 'CHN004',
    name: 'Meena T',
    belt: 'Green Belt',
    beltColor: '#22c55e',
    status: 'Active',
    dojo: 'Chennai Dojo',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    dob: '17 Nov 2011',
    gender: 'Female',
    bloodGroup: 'AB+',
    phone: '+91 98765 43213',
    email: 'meena@email.com',
    address: 'Chennai, TN',
  },
  {
    id: 'st-05',
    rollNo: 'CHN005',
    name: 'Karthik V',
    belt: 'Blue Belt',
    beltColor: '#3b82f6',
    status: 'Active',
    dojo: 'Chennai Dojo',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    dob: '03 Feb 2008',
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '+91 98765 43214',
    email: 'karthik@email.com',
    address: 'Chennai, TN',
  },
  {
    id: 'st-06',
    rollNo: 'CHN006',
    name: 'Lavanya P',
    belt: 'Purple Belt',
    beltColor: '#a855f7',
    status: 'Inactive',
    dojo: 'Chennai Dojo',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    dob: '19 Sep 2010',
    gender: 'Female',
    bloodGroup: 'B-',
    phone: '+91 98765 43215',
    email: 'lavanya@email.com',
    address: 'Chennai, TN',
  },
]

export const mobileAchievements = [
  {
    id: 'ach-1',
    title: 'Best Kata Performance',
    event: 'Inter-Dojo Championship 2025',
    date: '12 Jan 2025',
    iconColor: '#f59e0b',
  },
  {
    id: 'ach-2',
    title: 'Team Player',
    event: 'Dojo Team Event',
    date: '5 Dec 2024',
    iconColor: '#3b82f6',
  },
  {
    id: 'ach-3',
    title: 'Discipline Award',
    event: 'Monthly Recognition',
    date: '1 Nov 2024',
    iconColor: '#10b981',
  },
  {
    id: 'ach-4',
    title: 'Participation Certificate',
    event: 'Summer Camp 2024',
    date: '20 May 2024',
    iconColor: '#ef4444',
  },
]

export const mobileTournaments = [
  {
    id: 'tour-1',
    title: 'Chennai Open 2025',
    date: '05 Oct 2025',
    location: 'Chennai',
    status: 'Register',
  },
  {
    id: 'tour-2',
    title: 'State Championship',
    date: '18 Aug 2025',
    location: 'Chennai',
    status: 'View',
  },
  {
    id: 'tour-3',
    title: 'National Karate Championship',
    date: '15 Nov 2025',
    location: 'Chennai',
    status: 'View',
  },
]

export const mobileEvents = [
  {
    id: 'evt-1',
    title: 'Karate Summer Camp 2025',
    date: '10 Apr 2025',
    location: 'Chennai',
    action: 'Register',
    image: '/assets/card_student_gi.jpg',
  },
  {
    id: 'evt-2',
    title: 'Dojo Belt Grading',
    date: '25 May 2025',
    location: 'Chennai',
    action: 'View',
    image: '/assets/card_master_bow.jpg',
  },
  {
    id: 'evt-3',
    title: 'Inter-Dojo Championship',
    date: '12 Jul 2025',
    location: 'Chennai',
    action: 'View',
    image: '/assets/card_event_poster.jpg',
  },
]

export const mobileRequests = [
  {
    id: 'req-1',
    type: 'Dojo Registration',
    target: 'Chennai Dojo',
    date: '2 Apr 2025',
  },
  {
    id: 'req-2',
    type: 'Master Registration',
    target: 'Ramesh Kumar',
    date: '1 Apr 2025',
  },
  {
    id: 'req-3',
    type: 'Student Registration',
    target: 'Priya S',
    date: '30 Mar 2025',
  },
  {
    id: 'req-4',
    type: 'Belt Promotion',
    target: 'Vikram M',
    date: '28 Mar 2025',
  },
]

export const mobileAnnouncements = [
  {
    id: 'ann-1',
    title: 'Summer Training Schedule',
    date: '10 Apr 2025',
    target: 'All',
  },
  {
    id: 'ann-2',
    title: 'Belt Grading Update',
    date: '5 Apr 2025',
    target: 'All',
  },
  {
    id: 'ann-3',
    title: 'Dojo Closure Notice',
    date: '1 Apr 2025',
    target: 'Chennai Dojo',
  },
  {
    id: 'ann-4',
    title: 'Tournament Registration Open',
    date: '25 Mar 2025',
    target: 'All',
  },
]

export const mobileNotifications = [
  {
    id: 'notif-1',
    title: 'Tournament registration approved',
    time: '10:24 AM',
    unread: true,
  },
  {
    id: 'notif-2',
    title: 'New student registration request',
    time: '09:15 AM',
    unread: true,
  },
  {
    id: 'notif-3',
    title: 'Belt promotion approved',
    time: 'Yesterday',
    unread: false,
  },
  {
    id: 'notif-4',
    title: 'Event reminder: Summer Camp',
    time: 'Yesterday',
    unread: false,
  },
  {
    id: 'notif-5',
    title: 'Master registration request',
    time: '2 days ago',
    unread: false,
  },
]

export const beltLevels = [
  { name: 'White', color: '#ffffff', rank: '8th Kyu' },
  { name: 'Yellow', color: '#eab308', rank: '7th Kyu' },
  { name: 'Orange', color: '#f97316', rank: '6th Kyu' },
  { name: 'Green', color: '#22c55e', rank: '4th Kyu' },
  { name: 'Blue', color: '#3b82f6', rank: '3rd Kyu' },
  { name: 'Purple', color: '#a855f7', rank: '2nd Kyu' },
  { name: 'Brown', color: '#92400e', rank: '1st Kyu' },
  { name: 'Black', color: '#1e293b', rank: '1st Dan' },
]

export interface CalendarDayCell {
  day: number
  status?: 'present' | 'absent' | 'leave'
}

export const calendarDaysOct2025: CalendarDayCell[] = [
  { day: 1, status: 'present' },
  { day: 2, status: 'present' },
  { day: 3, status: 'present' },
  { day: 4, status: 'present' },
  { day: 5 },
  { day: 6, status: 'present' },
  { day: 7, status: 'present' },
  { day: 8, status: 'present' },
  { day: 9, status: 'absent' },
  { day: 10, status: 'present' },
  { day: 11, status: 'present' },
  { day: 12 },
  { day: 13, status: 'present' },
  { day: 14, status: 'present' },
  { day: 15, status: 'present' },
  { day: 16, status: 'leave' },
  { day: 17, status: 'present' },
  { day: 18, status: 'present' },
  { day: 19 },
  { day: 20, status: 'present' },
  { day: 21, status: 'present' },
  { day: 22, status: 'absent' },
  { day: 23, status: 'present' },
  { day: 24, status: 'present' },
  { day: 25, status: 'present' },
  { day: 26 },
  { day: 27, status: 'present' },
  { day: 28, status: 'present' },
  { day: 29, status: 'absent' },
  { day: 30, status: 'present' },
  { day: 31, status: 'present' },
]
