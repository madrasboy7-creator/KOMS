export interface PublicDojo {
  id: string
  name: string
  badge: string
  area: string
  city: string
  address: string
  landmarks: string
  headInstructor: string
  instructorRank: string
  instructorExperience: string
  trainingDays: string[]
  timings: { batch: string; time: string; days: string }[]
  batches: { name: string; ageGroup: string; focus: string }[]
  levelsOffered: string[]
  entryFee: number
  monthlyFee: number
  phone: string
  email: string
  description: string
  bannerUrl: string
  gallery: string[]
  activeEvents: string[]
  isFeatured: boolean
}

export interface PublicMaster {
  id: string
  name: string
  role: 'Grand Master' | 'Master' | 'Senior Instructor'
  rank: string
  experience: string
  styles: string[]
  associatedDojoIds: string[]
  associatedDojoNames: string[]
  biography: string
  achievements: string[]
  publicSchedule: string
  avatarUrl: string
}

export interface BeltLevelInfo {
  kyu: string
  beltName: string
  colorHex: string
  textColorHex: string
  accentBorder: string
  minTenure: string
  overview: string
  requiredKatas: string[]
  techniques: string[]
  sparringFocus: string
  gradingRequirements: string[]
  eligibility: string
}

export interface PublicEvent {
  id: string
  title: string
  category: 'Tournament' | 'Grading' | 'Seminar' | 'Training Camp' | 'Workshop' | 'Special Class' | 'Results'
  date: string
  time: string
  venue: string
  organizingDojo: string
  description: string
  eligibility: string
  registrationStatus: 'Open' | 'Closing Soon' | 'Closed' | 'Published Results'
  deadline?: string
  contact: string
  bannerUrl: string
  kobudoCategories?: string[]
  kataKumiteCategories?: string[]
  approvedResults?: { category: string; first: string; second: string; third: string }[]
}

export interface GalleryItem {
  id: string
  title: string
  category: 'Training Sessions' | 'Dojo Activities' | 'Tournaments' | 'Grading Ceremonies' | 'Seminars and Camps' | 'Awards and Achievements' | 'Organization Events'
  imageUrl: string
  date: string
  dojoName: string
  caption: string
}

export interface FaqItem {
  question: string
  answer: string
  category: 'Admissions' | 'Training & Belts' | 'Fees & Dues' | 'Schedule & Attendance' | 'Safety & Rules'
}

/* =========================================================================
   1. APPROVED DOJOS DATA
   ========================================================================= */
export const approvedDojos: PublicDojo[] = [
  {
    id: 'dojo-ranganagar',
    name: 'MASS DRAGON DOJO — Ranga Nagar Dojo',
    badge: 'Popular Branch',
    area: 'Ranga Nagar, Mudichur',
    city: 'Chennai - 600 048',
    address: '1/38 2nd Street, Ranga Nagar, Mudichur, Chennai - 600 048, Tamil Nadu',
    landmarks: 'Near Mudichur High Road, adjacent to Gangai Street bus stop',
    headInstructor: 'Sensei Ashokan A. (Branch Head) & Kyoshi B. Mathan',
    instructorRank: '3rd Dan Black Belt / 5th Dan Kyoshi',
    instructorExperience: '12+ Years in Okinawan Shorin-Ryu Karate & Self-Defense',
    trainingDays: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
    timings: [
      { batch: 'Junior Dragons (Ages 5–11)', time: '5:30 PM – 6:45 PM', days: 'Mon, Wed, Fri' },
      { batch: 'Teens & Adults Kihon / Kumite', time: '7:00 PM – 8:30 PM', days: 'Mon, Wed, Fri' },
      { batch: 'Sunday Kobudo Weapons Masterclass', time: '6:30 AM – 8:30 AM', days: 'Sunday Morning' },
    ],
    batches: [
      { name: 'Junior Dragons', ageGroup: 'Ages 5–11', focus: 'Discipline, Stances (Zenkutsu-dachi), Motor balance, Fukyugata Katas' },
      { name: 'Cadet & Youth Warriors', ageGroup: 'Ages 12–17', focus: 'Pinan Katas, Dynamic target sparring, Self-defense tactics' },
      { name: 'Kobudo Weapons Specialization', ageGroup: 'Yellow Belt & Above', focus: 'Traditional Rokushaku Bo, Sai, and Nunchaku techniques' },
    ],
    levelsOffered: ['White Belt', 'Yellow Belt', 'Orange Belt', 'Green Belt', 'Blue Belt', 'Kobudo Basics'],
    entryFee: 1000,
    monthlyFee: 700,
    phone: '+91 91769 58855 / +91 96001 03987',
    email: 'ranganagar@koms-karate.in',
    description:
      'Conveniently located for students in Ranga Nagar, Mudichur, and West Tambaram. Focused on foundational discipline, traditional Okinawan kata excellence, and practical anti-bullying self-defense in a safe, fully matted tatami environment.',
    bannerUrl: 'https://images.unsplash.com/photo-1514050566906-8d077bae7046?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598300606161-4019d0dfec28?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    ],
    activeEvents: ['Women & Youth Self-Defense Intensive (Jan 2027)', 'Winter Kyu Belt Grading Examination (Dec 2026)'],
    isFeatured: true,
  },
  {
    id: 'dojo-perungalathur',
    name: 'MASS DRAGON DOJO — Central Honbu Dojo, New Perungalathur',
    badge: 'Headquarters & Training Honbu',
    area: 'New Perungalathur',
    city: 'Chennai - 600 063',
    address: 'No: 13, Velu Street, M.K.B Nagar, New Perungalathur, Chennai - 600 063, Tamil Nadu',
    landmarks: 'Near Perungalathur Railway Station & GST Road junction',
    headInstructor: 'Kyoshi B. Mathan (Chief Sensei) & Renshi R. Ravikanth',
    instructorRank: '5th Dan Kyoshi & 4th Dan Renshi',
    instructorExperience: '22+ Years in Okinawan Shorin-Ryu Karate Do & Kobudo',
    trainingDays: ['Tuesday', 'Thursday', 'Saturday', 'Sunday'],
    timings: [
      { batch: 'Children Foundation (White–Orange)', time: '6:00 PM – 7:15 PM', days: 'Tue, Thu, Sat' },
      { batch: 'Intermediate & Advanced (Green–Black)', time: '7:30 PM – 9:00 PM', days: 'Tue, Thu, Sat' },
      { batch: 'Weekend Intensive & Dan Grading Prep', time: '6:30 AM – 9:00 AM', days: 'Sunday Morning' },
    ],
    batches: [
      { name: 'Kihon & Stance Foundation', ageGroup: 'All Ages (Beginners)', focus: 'Traditional Okinawan basics, Rei etiquette, breathing' },
      { name: 'Tournament Kumite & Sparring', ageGroup: 'Yellow Belt & Above', focus: 'Reflex reaction, counter timing, footwork, WKF rules' },
      { name: 'Black Belt & Dan Council', ageGroup: 'Brown & Black Belts', focus: 'Naihanchi, Passai Dai, Kusanku, advanced Kobudo weaponry' },
    ],
    levelsOffered: ['All Levels: White Belt through 7th Dan Black Belt', 'Full Kobudo Weapon Arts'],
    entryFee: 1000,
    monthlyFee: 800,
    phone: '+91 96001 03987 / +91 97908 97178',
    email: 'perungalathur@koms-karate.in',
    description:
      'The central administrative and technical headquarters for Kobudo Renmei Bukenkan - India. Features state-of-the-art international tatami flooring, punch shields, wooden makiwara boards, traditional weapons racks, and full parent viewing gallery.',
    bannerUrl: 'https://images.unsplash.com/photo-1598300606161-4019d0dfec28?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    ],
    activeEvents: ['Winter Kyu Belt Grading Examination (Dec 2026)', 'South India Martial Arts Gasshuku'],
    isFeatured: true,
  },
  {
    id: 'dojo-annanagar',
    name: 'MASS DRAGON DOJO — Anna Nagar Traditional Dojo',
    badge: 'Central Chennai Hub',
    area: 'Anna Nagar West',
    city: 'Chennai - 600 040',
    address: '12th Main Road, Shanti Colony, Anna Nagar, Chennai - 600 040, Tamil Nadu',
    landmarks: 'Behind Anna Nagar Tower Park, near Metro Station',
    headInstructor: 'Renshi R. Ravikanth',
    instructorRank: '4th Dan Renshi Black Belt',
    instructorExperience: '18+ Years in Matsubayashi-Ryu Lineage & Kata Bunkai',
    trainingDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    timings: [
      { batch: 'Morning Fitness & Karate Drills', time: '6:00 AM – 7:30 AM', days: 'Mon, Wed, Fri' },
      { batch: 'Evening Youth Academy', time: '5:30 PM – 7:00 PM', days: 'Mon, Wed, Fri' },
      { batch: 'Saturday Kata Clinic', time: '4:30 PM – 6:30 PM', days: 'Saturday' },
    ],
    batches: [
      { name: 'Cadet Development', ageGroup: 'Ages 6–14', focus: 'Confidence, agility, coordination, kata fundamentals' },
      { name: 'Adult Fitness & Self-Defense', ageGroup: 'Ages 18+', focus: 'Conditioning, joint safety, practical Okinawan bunkai' },
    ],
    levelsOffered: ['White through Brown Belt', 'Adult Self-Defense Program'],
    entryFee: 1000,
    monthlyFee: 900,
    phone: '+91 97908 97178',
    email: 'annanagar@koms-karate.in',
    description:
      'Prime central Chennai location serving students from Anna Nagar, Kilpauk, and Shenoy Nagar. Renowned for its calm, traditional training atmosphere and deep focus on kata bunkai (practical application).',
    bannerUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=800&q=80',
    ],
    activeEvents: ['Grand Master Okinawan Kobudo Weapons Gasshuku (Dec 2026)'],
    isFeatured: true,
  },
  {
    id: 'dojo-tambaram',
    name: 'MASS DRAGON DOJO — Tambaram Sanatorium Branch',
    badge: 'Suburban Branch',
    area: 'Tambaram Sanatorium / Hasthinapuram',
    city: 'Chennai - 600 044',
    address: '45, Rajendra Prasad Road, Hasthinapuram, Tambaram Sanatorium, Chennai - 600 044',
    landmarks: 'Opposite Government Sanatorium Hospital arch',
    headInstructor: 'Sensei S. Karthi & Kyoshi B. Mathan',
    instructorRank: '2nd Dan Black Belt',
    instructorExperience: '8+ Years in Sports Karate & Kobudo Weapons Drills',
    trainingDays: ['Tuesday', 'Thursday', 'Saturday'],
    timings: [
      { batch: 'Children Beginners', time: '5:30 PM – 6:45 PM', days: 'Tue, Thu, Sat' },
      { batch: 'Intermediate Sparring & Katas', time: '7:00 PM – 8:15 PM', days: 'Tue, Thu, Sat' },
    ],
    batches: [
      { name: 'Junior Kickers', ageGroup: 'Ages 5–12', focus: 'Kihon, flexibility, balance, team discipline' },
    ],
    levelsOffered: ['White to Purple Belt'],
    entryFee: 1000,
    monthlyFee: 750,
    phone: '+91 96001 03987',
    email: 'tambaram@koms-karate.in',
    description:
      'Spacious training hall with excellent ventilation and safe mats, ideal for families residing in Tambaram, Chromepet, and Hasthinapuram.',
    bannerUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    gallery: [],
    activeEvents: ['Winter Kyu Belt Grading Examination'],
    isFeatured: false,
  },
  {
    id: 'dojo-kilpauk',
    name: 'MASS DRAGON DOJO — Kilpauk Kobudo & Karate Academy',
    badge: 'Weekend Intensive Center',
    area: 'Kilpauk',
    city: 'Chennai - 600 010',
    address: 'Ormes Road, Kilpauk, Chennai - 600 010, Tamil Nadu',
    landmarks: 'Near Kilpauk Water Works & Bhavans Rajaji Vidyashram',
    headInstructor: 'Kyoshi B. Mathan & Senior Black Belt Council',
    instructorRank: '5th Dan Kyoshi',
    instructorExperience: '22+ Years in Traditional Martial Arts',
    trainingDays: ['Saturday', 'Sunday'],
    timings: [
      { batch: 'Weekend Morning Intensive', time: '7:00 AM – 9:30 AM', days: 'Sat & Sun' },
      { batch: 'Weekend Evening Weapons Drills', time: '4:30 PM – 6:30 PM', days: 'Sat & Sun' },
    ],
    batches: [
      { name: 'Weekend Warriors', ageGroup: 'Students & Working Adults', focus: 'Compact intensive kata, sparring, and weapon drills' },
    ],
    levelsOffered: ['All Belt Levels'],
    entryFee: 1000,
    monthlyFee: 850,
    phone: '+91 96001 03987',
    email: 'kilpauk@koms-karate.in',
    description:
      'Tailored for students and working professionals looking for rigorous weekend training sessions without interfering with weekday school or corporate schedules.',
    bannerUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1200&q=80',
    gallery: [],
    activeEvents: ['State Championship Selection Trials'],
    isFeatured: false,
  },
]

/* =========================================================================
   2. APPROVED MASTERS & INSTRUCTORS
   ========================================================================= */
export const approvedMasters: PublicMaster[] = [
  {
    id: 'master-grandmaster',
    name: 'Hanshi Grand Master',
    role: 'Grand Master',
    rank: '9th Dan Hanshi — Grand Master',
    experience: '40+ Years of Dedication to Okinawan Martial Arts',
    styles: ['Okinawa Shorin Ryu', 'Matsubayashi-Ryu Heritage', 'Matayoshi Kobudo Bukenkan'],
    associatedDojoIds: ['dojo-perungalathur', 'dojo-ranganagar', 'dojo-annanagar'],
    associatedDojoNames: ['Central Honbu Dojo', 'Ranga Nagar Dojo', 'Anna Nagar Dojo'],
    biography:
      'The supreme technical and spiritual guide for Kobudo Renmei Bukenkan - India. Trained extensively under direct Okinawan masters, dedicating four decades to preserving the pristine Katas, Bunkai philosophy, and traditional weaponry (Kobudo) in its true historic lineage across India.',
    achievements: [
      'Official India Representative for Okinawa Kobudo Renmei Bukenkan',
      'Conducted over 120 national and international karate & kobudo masterclasses',
      'Mentored more than 150 Black Belt instructors and National Champions',
      'Honored with the Lifetime Martial Arts Heritage Award',
    ],
    publicSchedule: 'Conducts Monthly Grand Master Seminars & Dan Grading Board Examinations.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'master-mathan',
    name: 'Kyoshi B. Mathan',
    role: 'Master',
    rank: '5th Dan Black Belt — Kyoshi',
    experience: '22+ Years of Intensive Karate Instruction',
    styles: ['Shorin Ryu Karate Do', 'Rokushaku Bo-Jutsu', 'Double Nunchaku Mastery', 'Tournament Sparring'],
    associatedDojoIds: ['dojo-perungalathur', 'dojo-ranganagar'],
    associatedDojoNames: ['Central Honbu Dojo, New Perungalathur', 'Ranga Nagar Dojo, Mudichur'],
    biography:
      'Chief Technical Instructor of KOMS and head of the New Perungalathur and Ranga Nagar dojos. Renowned across Tamil Nadu for his disciplined, compassionate pedagogy that instills confidence, humility, and rigorous martial skills into young students.',
    achievements: [
      '5-time State Karate Kata Gold Medalist',
      'Certified International Okinawan Kobudo Referee & Judge',
      'Trained 500+ young students across Chennai from White Belt to Black Belt',
      'Recipient of Tamil Nadu Best Karate Sensei Citation (2024)',
    ],
    publicSchedule: 'Tuesday & Thursday Evenings at Perungalathur; Monday & Wednesday Evenings at Ranga Nagar.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'master-ravikanth',
    name: 'Renshi R. Ravikanth',
    role: 'Master',
    rank: '4th Dan Black Belt — Renshi',
    experience: '18+ Years in Traditional Karate & Sports Science',
    styles: ['Matsubayashi-Ryu', 'Kata Bunkai Application', 'Kumite Reflex Drills', 'Youth Conditioning'],
    associatedDojoIds: ['dojo-perungalathur', 'dojo-annanagar'],
    associatedDojoNames: ['Central Honbu Dojo', 'Anna Nagar Traditional Dojo'],
    biography:
      'Technical Director of KOMS focusing on biomechanics, stance accuracy, and the explosive dynamics of Fukyugata and Pinan katas. Specializes in transforming beginner students into sharp, focused martial artists.',
    achievements: [
      'National Kumite Championship Silver Medalist',
      'Author of KOMS Official Junior Training Syllabus Handbook',
      'Certified Sports Conditioning & Injury Prevention Specialist',
    ],
    publicSchedule: 'Monday, Wednesday & Friday mornings and evenings at Anna Nagar Dojo.',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'instructor-ashokan',
    name: 'Sensei Ashokan A.',
    role: 'Senior Instructor',
    rank: '3rd Dan Black Belt — Senior Instructor',
    experience: '12+ Years in Martial Arts Education',
    styles: ['Shorin Ryu Basics', 'Self-Defense Practical Drills', 'Anti-Bullying Training'],
    associatedDojoIds: ['dojo-ranganagar'],
    associatedDojoNames: ['Ranga Nagar Dojo, Mudichur'],
    biography:
      'Branch Chief Instructor at Ranga Nagar Dojo, Mudichur. Respected by parents for his patient individual attention, emphasis on moral character, academic discipline, and personal safety awareness.',
    achievements: [
      'State Championship Kumite Gold Medalist',
      'Head Coach for Mudichur Zone Inter-School Karate Team',
      'Conducted 40+ free self-defense camps for school children and women',
    ],
    publicSchedule: 'Monday, Wednesday, Friday 5:30 PM – 8:30 PM & Sunday Morning at Ranga Nagar Dojo.',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'instructor-karthi',
    name: 'Sensei S. Karthi',
    role: 'Senior Instructor',
    rank: '2nd Dan Black Belt — Weapons Instructor',
    experience: '8+ Years in Sports Karate & Kobudo',
    styles: ['Kobudo Sai & Bo', 'Acrobatic Kata Drills', 'Reflex Sparring'],
    associatedDojoIds: ['dojo-tambaram'],
    associatedDojoNames: ['Tambaram Sanatorium Branch'],
    biography:
      'Dedicated weapons and kata coach helping students master traditional Okinawan instruments like Sai and long staff with paramount attention to safety and control.',
    achievements: [
      'South India Kobudo Demonstration Excellence Award',
      'State Level Weapon Kata Gold Medalist',
    ],
    publicSchedule: 'Tuesday, Thursday, Saturday 5:30 PM at Tambaram Sanatorium Dojo.',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
  },
]

/* =========================================================================
   3. TRAINING LEVELS & BELT SYLLABUS
   ========================================================================= */
export const beltLevelsSyllabus: BeltLevelInfo[] = [
  {
    kyu: '10th & 9th Kyu',
    beltName: 'White Belt (Mukyu)',
    colorHex: '#f8fafc',
    textColorHex: '#0f172a',
    accentBorder: '#cbd5e1',
    minTenure: '3 Months (Minimum 24 Classes)',
    overview:
      'The beginner rank symbolizing pure potential and an open mind. Students learn dojo etiquette, basic stances, punches, kicks, and fundamental blocking techniques.',
    requiredKatas: ['Kihon Kata I', 'Basic Stance Transitions (Dachi Waza)'],
    techniques: [
      'Seiken Tsuki (Forefist Punch)',
      'Jodan Uke (Upper Block)',
      'Gedan Barai (Lower Sweeping Block)',
      'Mae Geri Keage (Front Snap Kick)',
      'Zenkutsu Dachi (Forward Stance) & Shiko Dachi (Horse Stance)',
    ],
    sparringFocus: 'No free sparring. Basic partner distancing and target pad drills only.',
    gradingRequirements: [
      'Minimum 80% attendance in scheduled classes',
      'Demonstration of Dojo Kun recitation and respectful bowing (Rei)',
      'Crisp execution of forward stance transitions without balance loss',
    ],
    eligibility: 'All newly enrolled students who completed introductory 3 months.',
  },
  {
    kyu: '8th Kyu',
    beltName: 'Yellow Belt',
    colorHex: '#eab308',
    textColorHex: '#713f12',
    accentBorder: '#ca8a04',
    minTenure: '4 Months after White Belt',
    overview:
      'Symbolizing the early dawn light. The karateka learns the first historic Okinawan kata (Fukyugata I) and builds power generation from the hips.',
    requiredKatas: ['Fukyugata Dai Ichi (First Promotional Kata)'],
    techniques: [
      'Chudan Uchi Uke (Inside-Out Middle Block)',
      'Chudan Soto Uke (Outside-In Middle Block)',
      'Gyaku Tsuki (Reverse Punch from hip)',
      'Yoko Geri (Side Thrust Kick basics)',
      'Neko Ashi Dachi (Cat Foot Stance introduction)',
    ],
    sparringFocus: 'Yakusoku Kumite (3-step pre-arranged sparring with designated target).',
    gradingRequirements: [
      'Fluent solo performance of Fukyugata Dai Ichi without hesitation',
      'Demonstration of hip snap (koshi) during reverse punch',
      'Sensei recommendation based on dojo conduct and consistency',
    ],
    eligibility: 'White belt students with 35+ recorded sessions.',
  },
  {
    kyu: '7th Kyu',
    beltName: 'Orange Belt',
    colorHex: '#f97316',
    textColorHex: '#7c2d12',
    accentBorder: '#ea580c',
    minTenure: '4 Months after Yellow Belt',
    overview:
      'Symbolizing the rising morning sun. Focus shifts to dynamic footwork, combination strikes, and the second classical promotional kata.',
    requiredKatas: ['Fukyugata Dai Ni (Second Promotional Kata)'],
    techniques: [
      'Shuto Uke (Knife Hand Block)',
      'Mawashi Geri (Roundhouse Kick with ball of foot)',
      'Combination: Gedan Barai + Gyaku Tsuki + Mae Geri',
      'Kokutsu Dachi (Back Stance)',
    ],
    sparringFocus: '1-step pre-arranged sparring with evasion and counter.',
    gradingRequirements: [
      'Full mastery of Fukyugata I & II',
      'Crisp knife-hand block with proper tension',
      'Target pad kicking accuracy test',
    ],
    eligibility: 'Yellow belt holders with 40+ recorded sessions.',
  },
  {
    kyu: '6th Kyu',
    beltName: 'Green Belt',
    colorHex: '#16a34a',
    textColorHex: '#ffffff',
    accentBorder: '#15803d',
    minTenure: '5 Months after Orange Belt',
    overview:
      'Symbolizing growing plant and roots taking deep hold. Introduction to the historic Pinan series created by Master Anko Itosu.',
    requiredKatas: ['Pinan Shodan (Peaceful Mind, Level 1)'],
    techniques: [
      'Empi Uchi (Elbow Strike)',
      'Uraken Uchi (Backfist Strike)',
      'Tsuru Ashi Dachi (Crane Stance)',
      'Wrist release and collar escape techniques',
    ],
    sparringFocus: 'Controlled semi-free light touch sparring (Ju-Kumite with protective gear).',
    gradingRequirements: [
      'Flawless Pinan Shodan performance with proper Kiai shouts',
      'Effective balance on one-leg pivot kicks',
      'Fitness test: 25 pushups, 30 squats, 2-minute plank',
    ],
    eligibility: 'Orange belt holders with 50+ recorded sessions.',
  },
  {
    kyu: '5th Kyu',
    beltName: 'Blue Belt',
    colorHex: '#2563eb',
    textColorHex: '#ffffff',
    accentBorder: '#1d4ed8',
    minTenure: '5 Months after Green Belt',
    overview:
      'Symbolizing the blue sky towards which the tree stretches. Introduces complex directional shifts and defensive counter-tempo.',
    requiredKatas: ['Pinan Nidan (Peaceful Mind, Level 2)'],
    techniques: [
      'Morote Uke (Augmented Block)',
      'Yoko Geri Kekomi (Side Thrust Kick)',
      'Ushiro Geri (Back Kick)',
      'Takedown defense and balance disruption',
    ],
    sparringFocus: 'Continuous sparring with head and chest gear, timing offensive entries.',
    gradingRequirements: [
      'Execution of Pinan Shodan & Nidan',
      'Bunkai demonstration of 3 key movements with a live partner',
      'Clear vocal command and dojo leadership of junior warmups',
    ],
    eligibility: 'Green belt holders with 55+ recorded sessions.',
  },
  {
    kyu: '4th Kyu',
    beltName: 'Purple Belt',
    colorHex: '#9333ea',
    textColorHex: '#ffffff',
    accentBorder: '#7e22ce',
    minTenure: '6 Months after Blue Belt',
    overview:
      'Transition from intermediate to advanced understanding. Emphasizes close-range grappling escapes and heavy joint control.',
    requiredKatas: ['Pinan Sandan (Peaceful Mind, Level 3)'],
    techniques: [
      'Fumikomi (Stamping Kick)',
      'Empi Mawashi Uchi (Circular Elbow)',
      'Kansetsu Geri (Joint Kick defense)',
      'Introduction to Kobudo Bo grip fundamentals',
    ],
    sparringFocus: 'Jiyu Kumite (Free Sparring) with strict non-contact facial control.',
    gradingRequirements: [
      'Pinan I, II, and III kata examination',
      'Sparring round evaluation by Sensei panel',
      'Oral examination on Okinawan karate history',
    ],
    eligibility: 'Blue belt holders with 60+ recorded sessions.',
  },
  {
    kyu: '3rd to 1st Kyu',
    beltName: 'Brown Belt (San-kyu to Ik-kyu)',
    colorHex: '#78350f',
    textColorHex: '#ffffff',
    accentBorder: '#451a03',
    minTenure: '12 to 18 Months Total across 3 Kyu stages',
    overview:
      'The ripened earth before the seed transforms into Black Belt. The karateka masters advanced Katas, deep bunkai applications, and the famous iron-horse Naihanchi kata.',
    requiredKatas: ['Pinan Yondan', 'Pinan Godan', 'Naihanchi Shodan', 'Introductory Bo Kata (Shushi no Kon Sho)'],
    techniques: [
      'Naihanchi Dachi (Iron Horse Stance)',
      'Tensho & Sanchin breathing dynamics',
      'Advanced counter-joint locks and pressure points',
      'Traditional Rokushaku Bo 6-foot staff drills',
    ],
    sparringFocus: 'High-intensity multi-round continuous sparring and multiple-attacker awareness.',
    gradingRequirements: [
      'Full Pinan suite (1 through 5) plus Naihanchi Shodan',
      'Comprehensive Kobudo Bo weapons demonstration',
      'Assisting Sensei in teaching junior White/Yellow belt classes for 6 months',
    ],
    eligibility: 'Purple belt holders with at least 100+ recorded training sessions.',
  },
  {
    kyu: 'Shodan to Nanadan',
    beltName: 'Black Belt / Dan Grades (Yudansha)',
    colorHex: '#121212',
    textColorHex: '#c8a951',
    accentBorder: '#c8a951',
    minTenure: 'Minimum 3 to 4 Years of Continuous Dedicated Study',
    overview:
      'A new beginning: the master of basics. Dan grade karatekas embody the KOMS philosophy of Discipline, Strength, and Internal Peace. They study master Katas and advanced Kobudo weaponry.',
    requiredKatas: ['Passai Dai', 'Kusanku Dai', 'Chinto', 'Gojushiho', 'Kobudo Sai & Nunchaku Katas'],
    techniques: [
      'Mastery of all classical Okinawan strikes and throws',
      'Bukenkan Kobudo weapons mastery (Bo, Sai, Nunchaku, Tonfa, Tekko)',
      'Pedagogical instruction and refereeing authority',
    ],
    sparringFocus: 'Senior Dan sparring, situational self-defense, and weapons defense.',
    gradingRequirements: [
      'Examination strictly before Grand Master and Dan Council Board',
      'Submission of written thesis on Karate Philosophy or Bunkai application',
      'Exemplary personal character and dojo contributions',
    ],
    eligibility: '1st Kyu Brown belt candidates approved by Grand Master.',
  },
]

/* =========================================================================
   4. EVENTS & TOURNAMENTS
   ========================================================================= */
export const publicEvents: PublicEvent[] = [
  {
    id: 'evt-championship-2026',
    title: '12th Tamil Nadu State Kobudo & Karate Championship 2026',
    category: 'Tournament',
    date: '28 & 29 November 2026',
    time: '8:00 AM – 7:00 PM',
    venue: 'Jawaharlal Nehru Indoor Stadium, Raja Muthiah Road, Periamet, Chennai',
    organizingDojo: 'Kobudo Renmei Bukenkan - India (MASS DRAGON DOJO)',
    description:
      'The premier state-level martial arts championship gathering over 800 karatekas from across Tamil Nadu. Featuring traditional Okinawan Kata, World Karate Federation (WKF) Kumite divisions, and authentic Kobudo weapons competitions.',
    eligibility: 'Open to all registered KOMS dojo students and invited sister dojos. Belt age categories from Sub-Junior to Senior.',
    registrationStatus: 'Open',
    deadline: '10 November 2026',
    contact: '+91 96001 03987 / sensei@koms-karate.in',
    bannerUrl: 'https://images.unsplash.com/photo-1514050566906-8d077bae7046?auto=format&fit=crop&w=1200&q=80',
    kobudoCategories: [
      'Rokushaku Bo (Long Staff) Kata & Drills',
      'Sai (Iron Tridents) Synchronized Kata',
      'Nunchaku Speed & Technique Division',
      'Tekko & Tonfa Traditional Weapon Demonstration',
    ],
    kataKumiteCategories: [
      'Sub-Junior Kata (Ages 5–8, White to Orange)',
      'Junior Kata & Kumite (Ages 9–12, Yellow to Blue)',
      'Cadet & Youth Kumite (Ages 13–17, Green to Black)',
      'Senior Open Weight Championship Kumite (18+)',
    ],
  },
  {
    id: 'evt-grading-winter-2026',
    title: 'Winter Kyu Belt Promotion & Grading Examination',
    category: 'Grading',
    date: '13 December 2026',
    time: '9:00 AM – 2:00 PM',
    venue: 'KOMS Central Honbu Dojo, No: 13, Velu Street, New Perungalathur, Chennai',
    organizingDojo: 'MASS DRAGON DOJO — Central Honbu',
    description:
      'Official winter grading examination for students progressing from White Belt through Brown Belt. Evaluated on stance fidelity, kata accuracy, kihon power, and etiquette.',
    eligibility: 'Students who completed the mandatory minimum attendance and received written eligibility slips from their Sensei.',
    registrationStatus: 'Open',
    deadline: '01 December 2026',
    contact: 'Sensei Mathan · 96001 03987',
    bannerUrl: 'https://images.unsplash.com/photo-1598300606161-4019d0dfec28?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'evt-kobudo-seminar-2026',
    title: 'Grand Master Okinawan Kobudo Weapons Gasshuku',
    category: 'Seminar',
    date: '19 & 20 December 2026',
    time: '7:00 AM – 12:30 PM',
    venue: 'Anna Nagar Traditional Dojo, Shanti Colony, Chennai',
    organizingDojo: 'Kobudo Renmei Bukenkan - India',
    description:
      'Two-day intensive weapons clinic conducted directly by the Grand Master. Focuses on the Matayoshi Kobudo lineage weapons: Bo (staff), Sai, and Nunchaku with safety protocols.',
    eligibility: 'Yellow Belt and above students, instructors, and senior practitioners.',
    registrationStatus: 'Closing Soon',
    deadline: '05 December 2026',
    contact: 'office@koms-karate.in',
    bannerUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
    kobudoCategories: ['Bo-Jutsu', 'Sai-Jutsu', 'Nunchaku-Jutsu'],
  },
  {
    id: 'evt-selfdefense-workshop',
    title: 'Women & Youth Anti-Bullying Self-Defense Intensive',
    category: 'Workshop',
    date: '09 January 2027',
    time: '9:30 AM – 1:00 PM',
    venue: 'Ranga Nagar Dojo, 1/38 2nd Street, Mudichur, Chennai',
    organizingDojo: 'MASS DRAGON DOJO — Ranga Nagar Branch',
    description:
      'A practical community safety workshop teaching practical awareness, wrist release maneuvers, escaping dangerous grabs, and vocal assertiveness.',
    eligibility: 'Open to the general public, school students, and parents. No previous karate experience required.',
    registrationStatus: 'Open',
    deadline: '05 January 2027',
    contact: 'Sensei Ashokan · 91769 58855',
    bannerUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'evt-nationals-results',
    title: 'All India Bukenkan Nationals 2026 — Official Results',
    category: 'Results',
    date: '18 October 2026',
    time: 'Full Day Event',
    venue: 'Kanteerava Indoor Stadium, Bangalore',
    organizingDojo: 'Kobudo Renmei Bukenkan India National Council',
    description:
      'Official published results for Chennai contingent at the All India Championships. KOMS students brought home 14 Gold, 9 Silver, and 6 Bronze medals.',
    eligibility: 'Completed Championship Event',
    registrationStatus: 'Published Results',
    contact: 'results@koms-karate.in',
    bannerUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1200&q=80',
    approvedResults: [
      { category: 'Boys Kata (Under 10)', first: 'R. Harshitha (KOMS)', second: 'S. K. Vignesh (Salem)', third: 'K. Rahul (Bangalore)' },
      { category: 'Girls Kumite (Under 12)', first: 'Gou Maha.A (KOMS Ranga Nagar)', second: 'M. P. Niranjana Sri (KOMS)', third: 'P. Sneha (Madurai)' },
      { category: 'Traditional Kobudo Bo Kata', first: 'Sensei Ashokan Team (KOMS)', second: 'Kerala Kobudo Team', third: 'Karnataka Dojo' },
    ],
  },
]

/* =========================================================================
   5. GALLERY DATA
   ========================================================================= */
export const publicGallery: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Synchronized Fukyugata Kata Training',
    category: 'Training Sessions',
    imageUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1000&q=80',
    date: '14 Oct 2026',
    dojoName: 'Central Honbu Dojo, New Perungalathur',
    caption: 'Students executing synchronized Zenkutsu-Dachi stances and upper blocks during evening class.',
  },
  {
    id: 'gal-2',
    title: 'Mokuso — Pre-Training Mental Focus & Meditation',
    category: 'Dojo Activities',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1000&q=80',
    date: '20 Oct 2026',
    dojoName: 'Ranga Nagar Dojo, Mudichur',
    caption: 'Junior karatekas in Seiza position practicing mindful breathing to clear the mind before practice.',
  },
  {
    id: 'gal-3',
    title: 'High-Impact Target Kumite Drills',
    category: 'Tournaments',
    imageUrl: 'https://images.unsplash.com/photo-1514050566906-8d077bae7046?auto=format&fit=crop&w=1000&q=80',
    date: '18 Sep 2026',
    dojoName: 'Jawaharlal Nehru Stadium',
    caption: 'Contestants displaying controlled Mawashi-Geri kicks during state championship qualifications.',
  },
  {
    id: 'gal-4',
    title: 'Belt Awarding Ceremony by Kyoshi Mathan',
    category: 'Grading Ceremonies',
    imageUrl: 'https://images.unsplash.com/photo-1598300606161-4019d0dfec28?auto=format&fit=crop&w=1000&q=80',
    date: '02 Aug 2026',
    dojoName: 'Central Honbu Dojo',
    caption: 'Proud students receiving their new Yellow and Orange belts along with official Okinawan certificates.',
  },
  {
    id: 'gal-5',
    title: 'Traditional Kobudo Bo (Staff) Mastery Clinic',
    category: 'Seminars and Camps',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1000&q=80',
    date: '12 Jul 2026',
    dojoName: 'Anna Nagar Traditional Dojo',
    caption: 'Senior students practicing six-foot staff thrusts and defensive spins under Grand Master guidance.',
  },
  {
    id: 'gal-6',
    title: 'State Championship Trophy Winners Celebration',
    category: 'Awards and Achievements',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=80',
    date: '19 Oct 2026',
    dojoName: 'KOMS Chennai Team',
    caption: 'Mudichur and Perungalathur dojo competitors with the Best Performing Dojo Overall Championship Trophy.',
  },
  {
    id: 'gal-7',
    title: 'Annual Founders Day & Okinawan Cultural Bow',
    category: 'Organization Events',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80',
    date: '05 May 2026',
    dojoName: 'Kobudo Renmei Bukenkan - India',
    caption: 'Instructors and parents gathered to honor the Okinawan heritage and founders of Bukenkan.',
  },
]

/* =========================================================================
   6. FAQS & HELP CONTENT
   ========================================================================= */
export const commonFaqs: FaqItem[] = [
  {
    category: 'Admissions',
    question: 'How do I enrol my child in KOMS karate classes?',
    answer:
      'You can explore our approved dojos (such as Ranga Nagar Dojo in Mudichur or New Perungalathur Central Dojo) on this website, review class timings, and submit a Join Us registration enquiry. The relevant branch Sensei will review your application and invite you for an orientation session.',
  },
  {
    category: 'Admissions',
    question: 'What is the minimum age to begin karate training?',
    answer:
      'We welcome children from 5 years of age onwards in our Junior Dragons foundation batch. Adults of all ages can also join our separate teens and adult fitness/self-defense classes.',
  },
  {
    category: 'Training & Belts',
    question: 'How does belt promotion and grading work at KOMS?',
    answer:
      'Grading examinations take place quarterly. A student must achieve at least 80% class attendance, master all syllabus katas and kihon techniques for their level, and receive formal recommendation from their branch Sensei before being invited to the grading board.',
  },
  {
    category: 'Training & Belts',
    question: 'What is Kobudo and when can a student start weapons training?',
    answer:
      'Kobudo is the ancient Okinawan martial art of traditional farming tools used as defensive weapons (such as Bo staff, Sai tridents, and Nunchaku). Students who have built strong body discipline and reached at least Yellow Belt (8th Kyu) are eligible for supervised Kobudo basics.',
  },
  {
    category: 'Fees & Dues',
    question: 'What are the admission and monthly training fees?',
    answer:
      'KOMS maintains affordable non-profit rates for students. Official admission entrance fee is ₹1,000 (which covers membership registration and record maintenance), and monthly training fees range from ₹700 to ₹900 depending on the dojo branch and weekly training days.',
  },
  {
    category: 'Schedule & Attendance',
    question: 'Can a student attend classes across multiple dojo branches?',
    answer:
      'Yes! Registered KOMS students are welcome to attend weekend masterclasses and special holiday seminars at any of our Chennai sister dojos with their branch Sensei’s consent.',
  },
  {
    category: 'Safety & Rules',
    question: 'Is karate training safe for young children?',
    answer:
      'Safety and respect are our foremost principles. Beginner sparring is strictly non-contact or touch-light with thick safety foam chest protectors, headgear, and mouthguards. Children are taught non-violence, conflict resolution, and self-restraint.',
  },
]
