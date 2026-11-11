import { useState, useMemo, useEffect } from 'react'
import { assetConfig } from '../config/assets'
import type { Student } from '../models/koms'
import { komsStore, type RegistrationEnquiry, type GrandMasterCmsData } from '../services/komsStore'
import { Icon } from '../student/components/Icon'
import {
  approvedDojos,
  approvedMasters,
  beltLevelsSyllabus,
  commonFaqs,
  publicEvents,
  publicGallery,
  type PublicDojo,
  type PublicMaster,
  type PublicEvent,
  type GalleryItem,
  type BeltLevelInfo,
} from './commonData'
import './home.css'

function KarateFigIcon({ color = '#ffffff', stroke = 'none', width = 13, height = 19 }: { color?: string; stroke?: string; width?: number; height?: number }) {
  return (
    <svg viewBox="0 0 20 28" width={width} height={height} fill={color} stroke={stroke} strokeWidth={stroke !== 'none' ? 1.2 : 0}>
      {/* Karateka head */}
      <circle cx="10" cy="4" r="3" />
      {/* Gi torso with arms in kamae */}
      <path d="M 6 8 L 14 8 L 18 13 L 15.5 15 L 13.5 11 L 13.5 18 L 6.5 18 L 6.5 11 L 4.5 15 L 2 13 Z" />
      {/* Stance legs */}
      <path d="M 7 18 L 4 27 L 7.5 27 L 9.5 20.5 L 10.5 20.5 L 12.5 27 L 16 27 L 13 18 Z" />
    </svg>
  )
}

function GiUniformIcon({ size = 20, color = '#ffffff' }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
      <path d="M6 3L2 9l3.5 2L7 9.5V21h10V9.5l1.5 1.5L22 9l-4-6h-4l-2 4-2-4H6zm6 5.5l1.5 3h-3l1.5-3z" />
    </svg>
  )
}

export type CommonNavTab =
  | 'home'
  | 'dojos'
  | 'masters'
  | 'belts'
  | 'events'
  | 'gallery'
  | 'tradition'
  | 'join-us'
  | 'login'
  | 'help'

interface GeneralHomeScreenProps {
  onLoginSuccess: () => void
}

export function GeneralHomeScreen({ onLoginSuccess }: GeneralHomeScreenProps) {
  const [activeTab, setActiveTab] = useState<CommonNavTab>('home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [storeTick, setStoreTick] = useState(0)

  // Subscribed data from komsStore
  useEffect(() => {
    return komsStore.subscribe(() => setStoreTick((t) => t + 1))
  }, [])

  const cmsData = komsStore.getCmsData()
  const announcements = komsStore.getAnnouncements()
  const students = komsStore.getStudents()

  // Modals state
  const [selectedDojoModal, setSelectedDojoModal] = useState<PublicDojo | null>(null)
  const [selectedMasterModal, setSelectedMasterModal] = useState<PublicMaster | null>(null)
  const [selectedEventModal, setSelectedEventModal] = useState<PublicEvent | null>(null)
  const [lightboxImage, setLightboxImage] = useState<GalleryItem | null>(null)
  const [cmsModalOpen, setCmsModalOpen] = useState(false)
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)

  // Dojos filtering & search state
  const [dojoSearch, setDojoSearch] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('All Locations')
  const [selectedDayFilter, setSelectedDayFilter] = useState('All Days')
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('All Levels')

  // Events filtering
  const [eventCategoryFilter, setEventCategoryFilter] = useState('All Events')

  // Gallery filtering
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState('All Photos')

  // Training Levels FAQ toggle
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0)

  // Live synchronized public dojos from komsStore
  const [publicDojos, setPublicDojos] = useState<PublicDojo[]>(() => komsStore.getPublicDojos())

  useEffect(() => {
    return komsStore.subscribe(() => {
      const refreshed = komsStore.getPublicDojos()
      setPublicDojos(refreshed)
      if (selectedDojoModal) {
        const found = refreshed.find((d) => d.id === selectedDojoModal.id)
        if (found) setSelectedDojoModal(found)
      }
    })
  }, [selectedDojoModal])

  // Join Us Form State
  const [joinStep, setJoinStep] = useState<1 | 2 | 3 | 4>(1)
  const [joinDojoId, setJoinDojoId] = useState(() => (komsStore.getPublicDojos()[0]?.id || 'dojo-ranganagar'))
  const [joinCategory, setJoinCategory] = useState('Junior Dragons (Ages 5–11)')
  const [studentFullName, setStudentFullName] = useState('')
  const [studentDob, setStudentDob] = useState('')
  const [studentGender, setStudentGender] = useState('Male')
  const [studentBloodGroup, setStudentBloodGroup] = useState('B+ve')
  const [studentAge, setStudentAge] = useState('')
  const [guardianName, setGuardianName] = useState('')
  const [guardianPhone, setGuardianPhone] = useState('')
  const [guardianWhatsapp, setGuardianWhatsapp] = useState('')
  const [applicantEmail, setApplicantEmail] = useState('')
  const [residentialAddress, setResidentialAddress] = useState('')
  const [priorExperience, setPriorExperience] = useState('Beginner / First time karate student')
  const [consentRules, setConsentRules] = useState(true)
  const [consentSafety, setConsentSafety] = useState(true)
  const [consentMedia, setConsentMedia] = useState(true)
  const [joinSubmissionResult, setJoinSubmissionResult] = useState<RegistrationEnquiry | null>(null)
  const [joinError, setJoinError] = useState('')

  // Application Status Check State
  const [statusQuery, setStatusQuery] = useState('')
  const [trackedEnquiry, setTrackedEnquiry] = useState<RegistrationEnquiry | null | 'not_found'>(null)

  // New Dojo Registration State (Public -> Grand Master)
  const [newDojoModalOpen, setNewDojoModalOpen] = useState(false)
  const [regDojoName, setRegDojoName] = useState('')
  const [regMasterName, setRegMasterName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regArea, setRegArea] = useState('')
  const [regAddress, setRegAddress] = useState('')
  const [regExperience, setRegExperience] = useState('10 Years')
  const [regKarateStyle, setRegKarateStyle] = useState('Okinawa Shorin Ryu & Kobudo')
  const [regTimings, setRegTimings] = useState('06:00 PM – 07:30 PM')
  const [regEntryFee, setRegEntryFee] = useState('1000')
  const [regMonthlyFee, setRegMonthlyFee] = useState('800')
  const [dojoRegSubmitted, setDojoRegSubmitted] = useState<string | null>(null)

  // Student Method 1 (New) vs Method 2 (Existing Transfer) State
  const [regMethod, setRegMethod] = useState<'new_student' | 'existing_student'>('new_student')
  const [previousDojo, setPreviousDojo] = useState('')
  const [previousMaster, setPreviousMaster] = useState('')
  const [currentBeltGrade, setCurrentBeltGrade] = useState('White Belt')
  const [yearsOfKarate, setYearsOfKarate] = useState('1')
  const [dateOfJoining, setDateOfJoining] = useState(new Date().toISOString().slice(0, 10))

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginSuccess, setLoginSuccess] = useState('')

  // CMS Edit State (Grand Master Control Panel)
  const [cmsHeadline, setCmsHeadline] = useState(cmsData.heroHeadline)
  const [cmsMotto, setCmsMotto] = useState(cmsData.motto)
  const [cmsSubtext, setCmsSubtext] = useState(cmsData.heroSubtext)
  const [cmsPhone, setCmsPhone] = useState(cmsData.contactPhone)
  const [cmsEmail, setCmsEmail] = useState(cmsData.contactEmail)
  const [cmsToast, setCmsToast] = useState('')

  // Navigation handler
  function navigateTo(tab: CommonNavTab, options?: { preselectedDojoId?: string }) {
    setActiveTab(tab)
    setMobileMenuOpen(false)
    if (options?.preselectedDojoId) {
      setJoinDojoId(options.preselectedDojoId)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Filtered Dojos
  const filteredDojos = useMemo(() => {
    return publicDojos.filter((d) => {
      const matchSearch =
        d.name.toLowerCase().includes(dojoSearch.toLowerCase()) ||
        d.area.toLowerCase().includes(dojoSearch.toLowerCase()) ||
        d.city.toLowerCase().includes(dojoSearch.toLowerCase()) ||
        d.headInstructor.toLowerCase().includes(dojoSearch.toLowerCase())

      const matchLocation =
        selectedLocation === 'All Locations' ||
        d.area.toLowerCase().includes(selectedLocation.toLowerCase()) ||
        d.name.toLowerCase().includes(selectedLocation.toLowerCase())

      const matchDay =
        selectedDayFilter === 'All Days' ||
        d.trainingDays.some((day) => day.toLowerCase().includes(selectedDayFilter.toLowerCase()))

      const matchLevel =
        selectedLevelFilter === 'All Levels' ||
        d.levelsOffered.some((l) => l.toLowerCase().includes(selectedLevelFilter.toLowerCase()))

      return matchSearch && matchLocation && matchDay && matchLevel
    })
  }, [dojoSearch, selectedLocation, selectedDayFilter, selectedLevelFilter])

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return publicEvents.filter((e) => {
      if (eventCategoryFilter === 'All Events') return true
      if (eventCategoryFilter === 'Tournaments') return e.category === 'Tournament'
      if (eventCategoryFilter === 'Grading Examinations') return e.category === 'Grading'
      if (eventCategoryFilter === 'Seminars & Camps') return e.category === 'Seminar' || e.category === 'Training Camp'
      if (eventCategoryFilter === 'Workshops') return e.category === 'Workshop'
      if (eventCategoryFilter === 'Results') return e.category === 'Results'
      return true
    })
  }, [eventCategoryFilter])

  // Filtered Gallery
  const filteredGallery = useMemo(() => {
    return publicGallery.filter((g) => {
      if (galleryCategoryFilter === 'All Photos') return true
      return g.category === galleryCategoryFilter
    })
  }, [galleryCategoryFilter])

  // Handle Registration Enquiry Submission
  function handleJoinSubmit(e: React.FormEvent) {
    e.preventDefault()
    setJoinError('')

    if (!studentFullName.trim()) {
      setJoinError('Please enter the student’s full name.')
      return
    }
    if (!guardianPhone.trim()) {
      setJoinError('Please enter a valid guardian contact phone number.')
      return
    }
    if (!applicantEmail.trim()) {
      setJoinError('Please enter an email address for application updates.')
      return
    }
    if (!consentRules || !consentSafety) {
      setJoinError('Please review and check the mandatory dojo etiquette and safety consent boxes.')
      return
    }

    const targetDojo = publicDojos.find((d) => d.id === joinDojoId) || publicDojos[0]

    const newEnquiry = komsStore.submitRegistrationEnquiry({
      studentName: studentFullName.trim(),
      dateOfBirth: studentDob.trim() || 'Not specified',
      age: studentAge.trim() || 'Youth',
      gender: studentGender,
      bloodGroup: studentBloodGroup,
      fatherName: guardianName.trim(),
      guardianPhone: guardianPhone.trim(),
      guardianWhatsapp: guardianWhatsapp.trim() || guardianPhone.trim(),
      email: applicantEmail.trim(),
      address: residentialAddress.trim() || targetDojo.area,
      dojoId: targetDojo.id,
      dojoName: targetDojo.name,
      trainingCategory: joinCategory,
      priorExperience: regMethod === 'existing_student' ? `Transfer from ${previousDojo} (${currentBeltGrade})` : priorExperience.trim(),
    })

    // Also register in studentRegRequests for formal Master approval with Method 1 or Method 2
    komsStore.submitStudentRegistration({
      method: regMethod,
      fullName: studentFullName.trim(),
      dob: studentDob.trim() || '2012-05-10',
      age: parseInt(studentAge) || 12,
      gender: studentGender as any,
      bloodGroup: studentBloodGroup,
      dateOfJoining: dateOfJoining || new Date().toISOString().slice(0, 10),
      address: residentialAddress.trim() || targetDojo.area,
      fatherName: guardianName.trim() || 'Guardian',
      motherName: 'Mother',
      mobile: guardianPhone.trim(),
      whatsapp: guardianWhatsapp.trim() || guardianPhone.trim(),
      targetDojoId: targetDojo.id,
      targetDojoName: targetDojo.name,
      previousDojo: regMethod === 'existing_student' ? previousDojo : undefined,
      previousMaster: regMethod === 'existing_student' ? previousMaster : undefined,
      currentBeltGrade: regMethod === 'existing_student' ? currentBeltGrade : 'White Belt',
      yearsOfPractice: regMethod === 'existing_student' ? parseInt(yearsOfKarate) || 1 : 0,
      isTransfer: regMethod === 'existing_student',
      entryFeeExempt: regMethod === 'existing_student', // Zero duplicate entry fee!
    })

    setJoinSubmissionResult(newEnquiry)
  }

  function handleRegisterDojoSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!regDojoName.trim() || !regMasterName.trim() || !regPhone.trim()) {
      alert('Please fill out all required dojo name, Master name, and mobile number.')
      return
    }

    const newDojo = komsStore.registerNewDojo({
      name: regDojoName.trim(),
      masterName: regMasterName.trim(),
      masterEmail: regEmail.trim() || 'master@koms.in',
      masterPhone: regPhone.trim(),
      area: regArea.trim() || 'Chennai',
      address: regAddress.trim() || 'Chennai, Tamil Nadu',
      karateStyle: regKarateStyle.trim(),
      entryFee: Number(regEntryFee) || 1000,
      monthlyFee: Number(regMonthlyFee) || 800,
      classTimings: regTimings.trim(),
      weeklySchedule: ['Saturday', 'Sunday'],
      achievements: [],
    })

    setDojoRegSubmitted(newDojo.registrationId)
  }

  // Handle Application Tracking Lookup
  function handleCheckStatus(e: React.FormEvent) {
    e.preventDefault()
    if (!statusQuery.trim()) return
    const res = komsStore.checkEnquiryStatus(statusQuery)
    if (res) {
      setTrackedEnquiry(res)
    } else {
      setTrackedEnquiry('not_found')
    }
  }

  // Handle Login Submission
  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setLoginSuccess('')

    if (!loginIdentifier.trim()) {
      setLoginError('Please enter your Email or User ID / Student Name.')
      return
    }
    if (!loginPassword.trim()) {
      setLoginError('Please enter your password (or Date of Birth for students).')
      return
    }

    const res = komsStore.loginWithCredentials(loginIdentifier, loginPassword)
    if (res.success) {
      setLoginSuccess(res.message)
      setTimeout(() => {
        onLoginSuccess()
      }, 400)
    } else {
      setLoginError(res.message)
    }
  }

  // Quick Demo Login helper
  function quickLoginRole(role: 'grandmaster' | 'master' | 'senior' | 'student', studentId?: string) {
    setLoginError('')
    setLoginSuccess('')
    komsStore.loginAsRole(role, studentId)
    setLoginSuccess(`Signed in as ${role.toUpperCase()}! Opening authorized portal…`)
    setTimeout(() => {
      onLoginSuccess()
    }, 400)
  }

  // Save CMS Content (Grand Master Control)
  function handleSaveCms(e: React.FormEvent) {
    e.preventDefault()
    komsStore.updateCmsData({
      heroHeadline: cmsHeadline,
      motto: cmsMotto,
      heroSubtext: cmsSubtext,
      contactPhone: cmsPhone,
      contactEmail: cmsEmail,
    })
    setCmsToast('Grand Master updates published live to Common UI!')
    setTimeout(() => setCmsToast(''), 3000)
  }

  return (
    <div className="home-shell">
      {/* =========================================================================
          TOP NAVIGATION BAR (DESKTOP & MOBILE)
          ========================================================================= */}
      <header className="home-topbar">
        <div className="home-brand" onClick={() => navigateTo('home')}>
          <img src={assetConfig.logo} alt="KOMS Logo" className="home-corner-logo" />
          <div className="home-brand-text">
            <strong className="koms-brand-title">KOMS</strong>
            <span className="koms-brand-sub">KARATE ORGANIZATION SYSTEM</span>
            <span className="home-branding-motto">Discipline • Strength • Internal Peace</span>
          </div>
        </div>

        {/* Desktop Primary Nav Tabs */}
        <nav className="home-nav-tabs" aria-label="Main navigation">
          <button
            className={activeTab === 'home' ? 'active' : ''}
            onClick={() => navigateTo('home')}
          >
            <Icon name="home" size={15} />
            <span>Home</span>
          </button>
          <button
            className={activeTab === 'dojos' ? 'active' : ''}
            onClick={() => navigateTo('dojos')}
          >
            <Icon name="dojo" size={15} />
            <span>Dojos</span>
          </button>
          <button
            className={activeTab === 'masters' ? 'active' : ''}
            onClick={() => navigateTo('masters')}
          >
            <Icon name="user" size={15} />
            <span>Masters</span>
          </button>
          <button
            className={activeTab === 'belts' ? 'active' : ''}
            onClick={() => navigateTo('belts')}
          >
            <Icon name="belt" size={15} />
            <span>Training Levels</span>
          </button>
          <button
            className={activeTab === 'events' ? 'active' : ''}
            onClick={() => navigateTo('events')}
          >
            <Icon name="events" size={15} />
            <span>Events</span>
          </button>
          <button
            className={activeTab === 'gallery' ? 'active' : ''}
            onClick={() => navigateTo('gallery')}
          >
            <Icon name="image" size={15} />
            <span>Gallery</span>
          </button>
          <button
            className={activeTab === 'tradition' ? 'active' : ''}
            onClick={() => navigateTo('tradition')}
          >
            <Icon name="sword" size={15} />
            <span>Tradition</span>
          </button>
          <button
            className={activeTab === 'join-us' ? 'active is-join' : 'is-join'}
            onClick={() => navigateTo('join-us')}
          >
            <Icon name="checkCircle" size={15} />
            <span>Join Us</span>
          </button>
        </nav>

        {/* Right Actions: Red Login Button + Hamburger Menu (Controls are accessed ONLY by GM after login) */}
        <div className="home-topbar-actions">
          <button
            className="koms-red-login-btn"
            onClick={() => navigateTo('login')}
            title="Grand Master (GM) Portal Access"
          >
            Login
          </button>

          <button
            className="home-menu-toggle"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open mobile navigation menu"
          >
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
          </button>
        </div>
      </header>

      {/* =========================================================================
          MOBILE NAVIGATION DRAWER
          ========================================================================= */}
      {mobileMenuOpen && (
        <div className="home-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="home-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="home-drawer-head">
              <div className="home-brand">
                <img src={assetConfig.logo} alt="KOMS" className="home-corner-logo" />
                <div className="home-brand-text">
                  <strong>{cmsData.dojoBranding}</strong>
                  <small>Kobudo Renmei Bukenkan</small>
                </div>
              </div>
              <button
                className="home-drawer-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <nav className="home-drawer-nav">
              <button
                className={activeTab === 'home' ? 'active' : ''}
                onClick={() => navigateTo('home')}
              >
                <Icon name="home" size={18} />
                <span>1. Home</span>
              </button>
              <button
                className={activeTab === 'dojos' ? 'active' : ''}
                onClick={() => navigateTo('dojos')}
              >
                <Icon name="dojo" size={18} />
                <span>2. Dojos & Branches</span>
              </button>
              <button
                className={activeTab === 'masters' ? 'active' : ''}
                onClick={() => navigateTo('masters')}
              >
                <Icon name="user" size={18} />
                <span>3. Masters & Instructors</span>
              </button>
              <button
                className={activeTab === 'belts' ? 'active' : ''}
                onClick={() => navigateTo('belts')}
              >
                <Icon name="belt" size={18} />
                <span>4. Training Levels & Belts</span>
              </button>
              <button
                className={activeTab === 'events' ? 'active' : ''}
                onClick={() => navigateTo('events')}
              >
                <Icon name="events" size={18} />
                <span>5. Events & Tournaments</span>
              </button>
              <button
                className={activeTab === 'gallery' ? 'active' : ''}
                onClick={() => navigateTo('gallery')}
              >
                <Icon name="image" size={18} />
                <span>6. Activity Gallery</span>
              </button>
              <button
                className={activeTab === 'tradition' ? 'active' : ''}
                onClick={() => navigateTo('tradition')}
              >
                <Icon name="sword" size={18} />
                <span>7. Tradition & Philosophy</span>
              </button>
              <button
                className={activeTab === 'join-us' ? 'active is-join' : 'is-join'}
                onClick={() => navigateTo('join-us')}
              >
                <Icon name="checkCircle" size={18} />
                <span>8. Join Us / Enquire</span>
              </button>
              <button
                className={activeTab === 'login' ? 'active is-primary' : 'is-primary'}
                onClick={() => navigateTo('login')}
              >
                <Icon name="shield" size={18} />
                <span>9. Member & Sensei Login</span>
              </button>
              <button
                className={activeTab === 'help' ? 'active' : ''}
                onClick={() => navigateTo('help')}
              >
                <Icon name="help" size={18} />
                <span>10. Help & Legal Policies</span>
              </button>
            </nav>

            <div className="home-drawer-foot">
              <p>Motto: {cmsData.motto}</p>
              <small>Chennai, Tamil Nadu · Tel: {cmsData.contactPhone}</small>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MAIN APPLICATION CONTENT AREA
          ========================================================================= */}
      <main className="home-content">
        {/* =====================================================================
            TAB 1: HOME SECTION (Hero, About, Featured Dojos, Belts, Events, etc.)
            ===================================================================== */}
        {activeTab === 'home' && (
          <section className="home-tab-pane">
            {/* =================================================================
                A. HERO MARTIAL ARTS SUNSET BANNER (MATCHING SCREENSHOT)
                ================================================================= */}
            <div className="home-hero-martial">
              <div className="home-hero-backdrop">
                <div className="home-hero-art-layer" />
                <div className="home-hero-silhouette-art">
                  {/* Torii Gate Silhouette */}
                  <svg className="torii-svg-silhouette" viewBox="0 0 160 140" fill="currentColor">
                    <path d="M 0 25 Q 80 14 160 25 L 158 35 Q 80 24 2 35 Z" />
                    <path d="M 16 48 L 144 48 L 144 56 L 16 56 Z" />
                    <polygon points="32,25 44,25 38,140 26,140" />
                    <polygon points="128,25 116,25 122,140 134,140" />
                    <rect x="74" y="24" width="12" height="24" />
                  </svg>
                  {/* Martial Artist Silhouette in Low Kata Stance */}
                  <svg className="karateka-svg-silhouette" viewBox="0 0 100 120" fill="currentColor">
                    <circle cx="50" cy="20" r="9" />
                    <path d="M 44 30 L 56 30 L 64 52 L 48 54 L 38 48 Z" />
                    <path d="M 56 32 L 80 38 L 84 44 L 72 46 L 56 38 Z" />
                    <path d="M 44 34 L 28 40 L 26 48 L 36 48 L 44 40 Z" />
                    <path d="M 46 54 L 54 54 L 52 74 L 48 74 Z" />
                    <path d="M 42 52 L 20 78 L 10 110 L 24 110 L 36 84 L 48 62 Z" />
                    <path d="M 54 52 L 74 76 L 90 110 L 76 110 L 62 84 L 50 62 Z" />
                  </svg>
                </div>
                <div className="home-hero-dark-vignette" />
              </div>

              <div className="home-hero-martial-content">
                <span className="home-hero-tag">Explore</span>
                <h1 className="home-hero-title">
                  Explore the <span className="hero-gradient-text">Karate Tradition</span>
                </h1>
                <p className="home-hero-desc">
                  Learn about our history, philosophy, masters and the path to black belt.
                </p>
                <button
                  className="home-hero-pill-btn"
                  onClick={() => navigateTo('tradition')}
                >
                  <span>Discover Our Tradition</span>
                  <span className="pill-arrow">→</span>
                </button>

                <div className="home-hero-quote-box">
                  <span className="hero-quote-italic">
                    More than a Martial Art... <strong>It's a Way of Life.</strong>
                  </span>
                  <div className="hero-quote-red-line" />
                </div>
              </div>
            </div>

            {/* =================================================================
                B. THE FIVE STACKED FEATURE CARDS (MATCHING SCREENSHOT)
                ================================================================= */}
            <div className="martial-stacked-cards">
              {/* CARD 1: Our Tradition */}
              <div className="martial-card" onClick={() => navigateTo('tradition')}>
                <div className="martial-card-info">
                  <div className="martial-card-icon-circle">
                    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 5.5c6-1.5 14-1.5 20 0" />
                      <path d="M4 9h16" />
                      <line x1="6.5" y1="5.5" x2="6.5" y2="21" />
                      <line x1="17.5" y1="5.5" x2="17.5" y2="21" />
                      <line x1="4" y1="21" x2="9" y2="21" />
                      <line x1="15" y1="21" x2="20" y2="21" />
                    </svg>
                  </div>
                  <h3 className="martial-card-title">Our Tradition</h3>
                  <p className="martial-card-desc">
                    Discover the rich history, philosophy and values of Karate and Kobudo.
                  </p>
                  <button className="martial-card-link">
                    <span>Learn More</span>
                    <span>→</span>
                  </button>
                </div>
                <div className="martial-card-media martial-card-media--student">
                  <img
                    src="/assets/card_student_gi.jpg"
                    alt="Karate Tradition Student"
                    className="card-student-img"
                  />
                  <div className="card-kanji-watermark">
                    <span>空</span>
                    <span>手</span>
                    <span>道</span>
                  </div>
                </div>
              </div>

              {/* CARD 2: Our Masters */}
              <div className="martial-card" onClick={() => navigateTo('masters')}>
                <div className="martial-card-info">
                  <div className="martial-card-icon-circle">
                    <svg viewBox="0 0 24 24" width={18} height={18} fill="#ffffff">
                      <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
                    </svg>
                  </div>
                  <h3 className="martial-card-title">Our Masters</h3>
                  <p className="martial-card-desc">
                    Meet our respected instructors and learn from their experience and guidance.
                  </p>
                  <button className="martial-card-link">
                    <span>Learn More</span>
                    <span>→</span>
                  </button>
                </div>
                <div className="martial-card-media martial-card-media--master-bow">
                  <img
                    src="/assets/card_master_bow.jpg"
                    alt="Karate Dojo Bowing Master"
                    className="card-master-bow-img"
                  />
                </div>
              </div>

              {/* CARD 3: Training Levels */}
              <div className="martial-card" onClick={() => navigateTo('belts')}>
                <div className="martial-card-info">
                  <div className="martial-card-icon-circle">
                    <GiUniformIcon size={20} color="#ffffff" />
                  </div>
                  <h3 className="martial-card-title">Training Levels</h3>
                  <p className="martial-card-desc">
                    From beginner to advanced — find the right path for your growth.
                  </p>
                  <button className="martial-card-link">
                    <span>Learn More</span>
                    <span>→</span>
                  </button>
                </div>
                <div className="martial-card-media martial-card-media--belts">
                  <div className="belt-progression-box">
                    <div className="belt-figures-row">
                      <div className="belt-fig white" title="Beginner: White Belt"><KarateFigIcon color="#ffffff" stroke="#94a3b8" /></div>
                      <div className="belt-fig yellow" title="Intermediate: Yellow Belt"><KarateFigIcon color="#eab308" /></div>
                      <div className="belt-fig orange" title="Intermediate: Orange Belt"><KarateFigIcon color="#f97316" /></div>
                      <div className="belt-fig green" title="Intermediate: Green Belt"><KarateFigIcon color="#22c55e" /></div>
                      <div className="belt-fig blue" title="Advanced: Blue Belt"><KarateFigIcon color="#3b82f6" /></div>
                      <div className="belt-fig brown" title="Advanced: Brown Belt"><KarateFigIcon color="#854d0e" /></div>
                      <div className="belt-fig black" title="Black Belt"><KarateFigIcon color="#0f172a" stroke="#fbbf24" /></div>
                    </div>
                    <div className="belt-labels-row">
                      <span>Beginner</span>
                      <span>Intermediate</span>
                      <span>Advanced</span>
                      <strong className="belt-black-label">Black Belt</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 4: Upcoming Events */}
              <div className="martial-card" onClick={() => navigateTo('events')}>
                <div className="martial-card-info">
                  <div className="martial-card-icon-circle">
                    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#ffffff" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <h3 className="martial-card-title">Upcoming Events</h3>
                  <p className="martial-card-desc">
                    Stay updated with competitions, seminars, camps and special activities.
                  </p>
                  <button className="martial-card-link">
                    <span>View All Events</span>
                    <span>→</span>
                  </button>
                </div>
                <div className="martial-card-media martial-card-media--event-poster">
                  <img
                    src="/assets/card_event_poster.jpg"
                    alt="Karate Kata Event Poster"
                    className="card-event-poster-img"
                  />
                </div>
              </div>

              {/* CARD 5: Photo Gallery */}
              <div className="martial-card" onClick={() => navigateTo('gallery')}>
                <div className="martial-card-info">
                  <div className="martial-card-icon-circle">
                    <svg viewBox="0 0 24 24" width={18} height={18} fill="#ffffff">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                    </svg>
                  </div>
                  <h3 className="martial-card-title">Photo Gallery</h3>
                  <p className="martial-card-desc">
                    Relive our moments — training sessions, events, awards and more.
                  </p>
                  <button className="martial-card-link">
                    <span>View Gallery</span>
                    <span>→</span>
                  </button>
                </div>
                <div className="martial-card-media martial-card-media--gallery-collage">
                  <div className="gallery-mini-collage">
                    <div className="mini-photo-frame mini-photo-frame--left">
                      <img src="/assets/card_gallery_master.jpg" alt="Karate Kata at Sunset" />
                    </div>
                    <div className="mini-photo-frame mini-photo-frame--right">
                      <img src="/assets/card_gallery_torii.jpg" alt="Hakone Torii Gate" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop-Only Extended Sections (Mobile Home strictly matches the 5-card app design) */}
            <div className="desktop-extended-home">
              {/* B. About the Organization */}
              <section className="home-about-card">
              <div className="home-about-grid">
                <div>
                  <div className="home-section-header" style={{ marginBottom: '14px' }}>
                    <span className="home-eyebrow">
                      <Icon name="sword" size={14} />
                      About The Organization
                    </span>
                    <h2>Kobudo Renmei Bukenkan - India</h2>
                  </div>
                  <p style={{ color: '#334155', fontSize: '14px', lineHeight: '1.6', marginBottom: '14px' }}>
                    Kobudo Renmei Bukenkan - India | MASS DRAGON DOJO is dedicated to preserving the classical
                    traditions of Okinawan Shorin-Ryu Karate Do and authentic Matayoshi Kobudo weaponry arts.
                    Under direct Okinawan guidance, we cultivate physical strength, moral character, and spiritual
                    calm for children, cadets, and adults across our Chennai dojos.
                  </p>
                  <button
                    className="koms-btn koms-btn--outline"
                    onClick={() => navigateTo('tradition')}
                  >
                    <span>Read History & Tradition</span>
                    <Icon name="arrow" size={14} />
                  </button>
                </div>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '10px' }}>
                    Organizational Pillars & Values
                  </h4>
                  <div className="home-values-list">
                    <div className="home-value-pill">
                      <strong>Discipline</strong>
                      <small>Punctuality & humility</small>
                    </div>
                    <div className="home-value-pill">
                      <strong>Strength</strong>
                      <small>Kihon & body fortitude</small>
                    </div>
                    <div className="home-value-pill">
                      <strong>Internal Peace</strong>
                      <small>Calmness in adversity</small>
                    </div>
                    <div className="home-value-pill">
                      <strong>Respect</strong>
                      <small>Courtesy to Sensei & peers</small>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* C. Featured Dojos */}
            <section style={{ marginBottom: '36px' }}>
              <div className="home-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span className="home-eyebrow">
                    <Icon name="location" size={14} />
                    Approved Locations
                  </span>
                  <h2>Featured Karate Dojos</h2>
                  <p>Discover authentic training centers approved for public display across Chennai.</p>
                </div>
                <button
                  className="koms-btn koms-btn--outline"
                  onClick={() => navigateTo('dojos')}
                >
                  View All Dojos ({publicDojos.length})
                </button>
              </div>

              <div className="dojos-grid">
                {publicDojos.slice(0, 3).map((dojo) => (
                  <article key={dojo.id} className="dojo-card">
                    <div className="dojo-card-image">
                      <img src={dojo.bannerUrl} alt={dojo.name} />
                      <span className="dojo-card-badge">{dojo.badge}</span>
                      <span className="dojo-card-fee-badge">₹{dojo.monthlyFee}/mo</span>
                    </div>
                    <div className="dojo-card-body">
                      <h3>{dojo.name}</h3>
                      <div className="dojo-card-locality">
                        <Icon name="location" size={14} />
                        <span>{dojo.area}, {dojo.city}</span>
                      </div>
                      <div className="dojo-meta-table">
                        <div className="dojo-meta-row">
                          <span>Instructor:</span>
                          <span>{dojo.headInstructor}</span>
                        </div>
                        <div className="dojo-meta-row">
                          <span>Training Days:</span>
                          <span>{dojo.trainingDays.slice(0, 3).join(', ')}</span>
                        </div>
                        <div className="dojo-meta-row">
                          <span>Entry Fee:</span>
                          <span>₹{dojo.entryFee} (Official)</span>
                        </div>
                      </div>
                      <div className="dojo-card-actions">
                        <button
                          className="koms-btn koms-btn--outline"
                          onClick={() => setSelectedDojoModal(dojo)}
                        >
                          View Details
                        </button>
                        <button
                          className="koms-btn koms-btn--primary"
                          onClick={() => navigateTo('join-us', { preselectedDojoId: dojo.id })}
                        >
                          Enquire Joining
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* D. Training Levels Preview */}
            <section style={{ marginBottom: '36px' }}>
              <div className="home-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span className="home-eyebrow">
                    <Icon name="belt" size={14} />
                    Progression & Grading
                  </span>
                  <h2>Karate Belt Levels & Syllabus</h2>
                  <p>Structured Okinawan progression from beginner White Belt to advanced Dan Master ranks.</p>
                </div>
                <button
                  className="koms-btn koms-btn--outline"
                  onClick={() => navigateTo('belts')}
                >
                  Explore All Levels
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                {beltLevelsSyllabus.slice(0, 4).map((b) => (
                  <div
                    key={b.kyu}
                    style={{
                      background: '#ffffff',
                      border: `1px solid ${b.accentBorder}`,
                      borderTop: `6px solid ${b.colorHex === '#f8fafc' ? '#94a3b8' : b.colorHex}`,
                      borderRadius: '14px',
                      padding: '16px',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>{b.kyu}</span>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '4px 0 8px 0', color: '#0f172a' }}>
                      {b.beltName}
                    </h4>
                    <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4', margin: '0 0 10px 0' }}>
                      {b.overview.slice(0, 90)}…
                    </p>
                    <small style={{ fontSize: '10.5px', fontWeight: 700, color: '#b5121b' }}>
                      Katas: {b.requiredKatas[0]}
                    </small>
                  </div>
                ))}
              </div>
            </section>

            {/* E. Upcoming Events */}
            <section style={{ marginBottom: '36px' }}>
              <div className="home-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span className="home-eyebrow">
                    <Icon name="calendar" size={14} />
                    Calendar of Activities
                  </span>
                  <h2>Upcoming Events & Championships</h2>
                  <p>Tournaments, belt grading examinations, seminars, and Kobudo weapon clinics.</p>
                </div>
                <button
                  className="koms-btn koms-btn--outline"
                  onClick={() => navigateTo('events')}
                >
                  View All Events
                </button>
              </div>

              <div className="events-grid">
                {publicEvents.slice(0, 2).map((evt) => (
                  <article key={evt.id} className="event-card">
                    <div className="event-card-img">
                      <img src={evt.bannerUrl} alt={evt.title} />
                      <span className="event-cat-badge">{evt.category}</span>
                      <span className="event-status-badge">{evt.registrationStatus}</span>
                    </div>
                    <div className="event-card-body">
                      <h3>{evt.title}</h3>
                      <div className="event-meta-pill">
                        <Icon name="calendar" size={14} />
                        <span>{evt.date} · {evt.time}</span>
                      </div>
                      <div className="event-meta-pill">
                        <Icon name="location" size={14} />
                        <span>{evt.venue}</span>
                      </div>
                      <p className="event-desc">{evt.description.slice(0, 110)}…</p>
                      <button
                        className="koms-btn koms-btn--outline"
                        style={{ marginTop: 'auto' }}
                        onClick={() => setSelectedEventModal(evt)}
                      >
                        Event Details & Schedule
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* F. Public Announcements */}
            <section style={{ marginBottom: '36px' }}>
              <div className="home-section-header">
                <span className="home-eyebrow">
                  <Icon name="bell" size={14} />
                  Official Bulletins
                </span>
                <h2>Dojo Notices & Announcements</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {announcements.slice(0, 3).map((ann) => (
                  <div
                    key={ann.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: '#fef2f2', color: '#b5121b' }}>
                        {ann.category}
                      </span>
                      <small style={{ color: '#94a3b8', fontSize: '11px' }}>{ann.publishedAt}</small>
                    </div>
                    <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {ann.title}
                    </h4>
                    <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                      {ann.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* G. Achievements and Recognition */}
            <section style={{ marginBottom: '36px' }}>
              <div className="home-section-header">
                <span className="home-eyebrow">
                  <Icon name="award" size={14} />
                  Excellence & Honors
                </span>
                <h2>Achievements & Recognition</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏆</div>
                  <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                    All-India Bukenkan Trophy
                  </strong>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    14 Gold Medals, 9 Silver, and 6 Bronze in Kata, Kumite, and Kobudo divisions.
                  </p>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📜</div>
                  <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                    Okinawan Lineage Authorization
                  </strong>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Official recognition and Dan verification direct from Okinawa Kobudo Renmei Bukenkan.
                  </p>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>🥋</div>
                  <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                    150+ Certified Black Belts
                  </strong>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Educating students across Chennai with verified Okinawan syllabus credentials.
                  </p>
                </div>
              </div>
            </section>

            {/* H. Gallery Preview */}
            <section style={{ marginBottom: '36px' }}>
              <div className="home-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span className="home-eyebrow">
                    <Icon name="image" size={14} />
                    Visual Highlights
                  </span>
                  <h2>Training & Championship Gallery</h2>
                </div>
                <button
                  className="koms-btn koms-btn--outline"
                  onClick={() => navigateTo('gallery')}
                >
                  View Full Gallery
                </button>
              </div>

              <div className="gallery-grid">
                {publicGallery.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="gallery-card"
                    onClick={() => setLightboxImage(item)}
                  >
                    <img src={item.imageUrl} alt={item.title} />
                    <div className="gallery-card-overlay">
                      <strong>{item.title}</strong>
                      <small>{item.dojoName} · {item.date}</small>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            </div>
          </section>
        )}

        {/* =====================================================================
            TAB 2: DOJOS (Search, Filters, Dedicated Details Modal)
            ===================================================================== */}
        {activeTab === 'dojos' && (
          <section className="home-tab-pane">
            <div className="home-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span className="home-eyebrow">
                  <Icon name="dojo" size={14} />
                  Find Your Training Center
                </span>
                <h2>Approved Karate & Kobudo Dojos</h2>
                <p>
                  Explore approved dojos across Chennai, including our popular branch in Ranga Nagar, Mudichur
                  and Central Honbu in New Perungalathur. Compare training days, senseis, and schedules.
                </p>
              </div>

              <button
                className="koms-btn koms-btn--primary"
                onClick={() => {
                  setDojoRegSubmitted(null)
                  setNewDojoModalOpen(true)
                }}
                style={{ background: '#b5121b', color: '#fff', fontWeight: 700 }}
              >
                🥋 Register New Dojo (Master Application)
              </button>
            </div>

            {/* Search & Multi-Filter Bar */}
            <div className="dojos-filter-bar">
              <div className="dojos-search-row">
                <div className="dojos-search-input">
                  <span className="dojos-search-icon">
                    <Icon name="search" size={18} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by dojo name, locality (e.g. Ranga Nagar), city, or Sensei..."
                    value={dojoSearch}
                    onChange={(e) => setDojoSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Location Filter Pills */}
              <div className="dojos-filter-pills">
                <span className="dojos-filter-label">Location:</span>
                {[
                  'All Locations',
                  'Ranga Nagar',
                  'Perungalathur',
                  'Anna Nagar',
                  'Tambaram',
                  'Kilpauk',
                ].map((loc) => (
                  <button
                    key={loc}
                    className={`filter-pill ${selectedLocation === loc ? 'active' : ''}`}
                    onClick={() => setSelectedLocation(loc)}
                  >
                    {loc}
                  </button>
                ))}
              </div>

              {/* Training Days Filter Pills */}
              <div className="dojos-filter-pills">
                <span className="dojos-filter-label">Training Days:</span>
                {['All Days', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday'].map((day) => (
                  <button
                    key={day}
                    className={`filter-pill ${selectedDayFilter === day ? 'active' : ''}`}
                    onClick={() => setSelectedDayFilter(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Dojos Grid */}
            <div className="dojos-grid">
              {filteredDojos.map((dojo) => (
                <article key={dojo.id} className="dojo-card">
                  <div className="dojo-card-image">
                    <img src={dojo.bannerUrl} alt={dojo.name} />
                    <span className="dojo-card-badge">{dojo.badge}</span>
                    <span className="dojo-card-fee-badge">₹{dojo.monthlyFee}/mo</span>
                  </div>
                  <div className="dojo-card-body">
                    <h3>{dojo.name}</h3>
                    <div className="dojo-card-locality">
                      <Icon name="location" size={14} />
                      <span>{dojo.address}</span>
                    </div>
                    <div className="dojo-meta-table">
                      <div className="dojo-meta-row">
                        <span>Head Instructor:</span>
                        <span>{dojo.headInstructor}</span>
                      </div>
                      <div className="dojo-meta-row">
                        <span>Rank:</span>
                        <span>{dojo.instructorRank}</span>
                      </div>
                      <div className="dojo-meta-row">
                        <span>Training Days:</span>
                        <span>{dojo.trainingDays.join(', ')}</span>
                      </div>
                      <div className="dojo-meta-row">
                        <span>Class Timings:</span>
                        <span>{dojo.timings[0]?.time || 'Evenings'}</span>
                      </div>
                      <div className="dojo-meta-row">
                        <span>Admission Entry Fee:</span>
                        <span>₹{dojo.entryFee}</span>
                      </div>
                    </div>

                    <div className="dojo-card-actions">
                      <button
                        className="koms-btn koms-btn--outline"
                        onClick={() => setSelectedDojoModal(dojo)}
                      >
                        View Details
                      </button>
                      <button
                        className="koms-btn koms-btn--primary"
                        onClick={() => navigateTo('join-us', { preselectedDojoId: dojo.id })}
                      >
                        Enquire Joining
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredDojos.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 20px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '12px' }}>
                  No approved dojos matched your filter criteria.
                </p>
                <button
                  className="koms-btn koms-btn--outline"
                  onClick={() => {
                    setDojoSearch('')
                    setSelectedLocation('All Locations')
                    setSelectedDayFilter('All Days')
                    setSelectedLevelFilter('All Levels')
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </section>
        )}

        {/* =====================================================================
            TAB 3: MASTERS & INSTRUCTORS (Grand Master, Masters, Profiles)
            ===================================================================== */}
        {activeTab === 'masters' && (
          <section className="home-tab-pane">
            <div className="home-section-header">
              <span className="home-eyebrow">
                <Icon name="shield" size={14} />
                Leadership & Teaching Faculty
              </span>
              <h2>Grand Master & Authorized Instructors</h2>
              <p>
                Learn about the leadership of Kobudo Renmei Bukenkan - India. Only profiles officially approved
                for public display are presented.
              </p>
            </div>

            <div className="masters-grid">
              {approvedMasters.map((m) => (
                <article key={m.id} className="master-card">
                  <div className="master-card-head">
                    <img src={m.avatarUrl} alt={m.name} className="master-avatar" />
                    <div className="master-head-info">
                      <strong>{m.name}</strong>
                      <span className="master-rank-tag">{m.rank}</span>
                      <small className="master-exp">{m.experience}</small>
                    </div>
                  </div>

                  <div className="master-styles">
                    {m.styles.map((s) => (
                      <span key={s} className="master-style-chip">{s}</span>
                    ))}
                  </div>

                  <p className="master-bio">{m.biography}</p>

                  <div className="master-dojos">
                    <strong>Associated Dojos:</strong>
                    <span>{m.associatedDojoNames.join(' · ')}</span>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                    <button
                      className="koms-btn koms-btn--outline"
                      style={{ flex: 1 }}
                      onClick={() => setSelectedMasterModal(m)}
                    >
                      Instructor Biography
                    </button>
                    <button
                      className="koms-btn koms-btn--primary"
                      onClick={() => {
                        const targetDojo = publicDojos.find((d) => d.id === m.associatedDojoIds[0])
                        if (targetDojo) setSelectedDojoModal(targetDojo)
                      }}
                    >
                      View Dojo
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* =====================================================================
            TAB 4: TRAINING LEVELS & BELT PROGRESSION
            ===================================================================== */}
        {activeTab === 'belts' && (
          <section className="home-tab-pane">
            <div className="home-section-header">
              <span className="home-eyebrow">
                <Icon name="belt" size={14} />
                Belt System & Grading Requirements
              </span>
              <h2>Karate Belt Progression & Technical Syllabus</h2>
              <p>
                From White Belt (Mukyu) to Black Belt (Yudansha). Each rank represents verified technical accuracy,
                mental composure, and adherence to the Dojo Kun.
              </p>
            </div>

            <div className="belts-stack">
              {beltLevelsSyllabus.map((belt) => (
                <div key={belt.kyu} className="belt-card">
                  <div
                    className="belt-card-banner"
                    style={{
                      background: belt.colorHex,
                      color: belt.textColorHex,
                      borderLeft: `8px solid ${belt.accentBorder}`,
                    }}
                  >
                    <div>
                      <small style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>{belt.kyu}</small>
                      <strong>{belt.beltName}</strong>
                    </div>
                    <span style={{ fontSize: '11.5px', fontWeight: 800 }}>
                      Min: {belt.minTenure}
                    </span>
                  </div>

                  <div className="belt-card-body">
                    <div>
                      <div className="belt-info-block" style={{ marginBottom: '14px' }}>
                        <strong>Overview & Philosophy</strong>
                        <p style={{ fontSize: '12.5px', color: '#334155', lineHeight: '1.5', margin: 0 }}>
                          {belt.overview}
                        </p>
                      </div>
                      <div className="belt-info-block">
                        <strong>Required Katas</strong>
                        <ul className="belt-tech-list">
                          {belt.requiredKatas.map((k) => (
                            <li key={k}>{k}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <div className="belt-info-block" style={{ marginBottom: '14px' }}>
                        <strong>Key Techniques & Stances</strong>
                        <ul className="belt-tech-list">
                          {belt.techniques.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="belt-info-block">
                        <strong>Grading Board Requirements</strong>
                        <ul className="belt-tech-list">
                          {belt.gradingRequirements.map((req) => (
                            <li key={req}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Grading Process Guide */}
            <div style={{ marginTop: '36px', background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '30px' }}>
              <h3 style={{ fontFamily: 'Manrope', fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                The KOMS Official Grading Examination Process
              </h3>
              <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
                Examinations are conducted under the authority of the Grand Master and appointed Master Panel.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#b5121b' }}>1. Attendance Audit</span>
                  <p style={{ fontSize: '12px', color: '#475569', marginTop: '6px' }}>
                    Candidate must satisfy minimum 80% attendance in their assigned dojo register.
                  </p>
                </div>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#b5121b' }}>2. Mock Evaluation</span>
                  <p style={{ fontSize: '12px', color: '#475569', marginTop: '6px' }}>
                    Branch Sensei performs preliminary kata check and grants an examination slip.
                  </p>
                </div>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#b5121b' }}>3. Board Examination</span>
                  <p style={{ fontSize: '12px', color: '#475569', marginTop: '6px' }}>
                    Execution of Kihon, Katas, Bunkai, and Sparring before the Senior Dan Council.
                  </p>
                </div>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#b5121b' }}>4. Belt Award Ceremony</span>
                  <p style={{ fontSize: '12px', color: '#475569', marginTop: '6px' }}>
                    Formal knotting of the new belt and issuance of verified Bukenkan certificates.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            TAB 5: EVENTS & TOURNAMENTS
            ===================================================================== */}
        {activeTab === 'events' && (
          <section className="home-tab-pane">
            <div className="home-section-header">
              <span className="home-eyebrow">
                <Icon name="events" size={14} />
                Calendar & Competitions
              </span>
              <h2>Upcoming Tournaments, Grading & Seminars</h2>
              <p>
                Stay updated with official championships, Kobudo weapons masterclasses, and past results.
              </p>
            </div>

            {/* Event Category Filters */}
            <div className="dojos-filter-pills" style={{ marginBottom: '22px' }}>
              {[
                'All Events',
                'Tournaments',
                'Grading Examinations',
                'Seminars & Camps',
                'Workshops',
                'Results',
              ].map((cat) => (
                <button
                  key={cat}
                  className={`filter-pill ${eventCategoryFilter === cat ? 'active' : ''}`}
                  onClick={() => setEventCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="events-grid">
              {filteredEvents.map((evt) => (
                <article key={evt.id} className="event-card">
                  <div className="event-card-img">
                    <img src={evt.bannerUrl} alt={evt.title} />
                    <span className="event-cat-badge">{evt.category}</span>
                    <span className="event-status-badge">{evt.registrationStatus}</span>
                  </div>
                  <div className="event-card-body">
                    <h3>{evt.title}</h3>
                    <div className="event-meta-pill">
                      <Icon name="calendar" size={14} />
                      <span>{evt.date} · {evt.time}</span>
                    </div>
                    <div className="event-meta-pill">
                      <Icon name="location" size={14} />
                      <span>{evt.venue}</span>
                    </div>

                    <p className="event-desc">{evt.description}</p>

                    {evt.kobudoCategories && (
                      <div className="event-kobudo-tags">
                        {evt.kobudoCategories.map((k) => (
                          <span key={k} className="kobudo-tag">{k}</span>
                        ))}
                      </div>
                    )}

                    <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                      <button
                        className="koms-btn koms-btn--outline"
                        style={{ flex: 1 }}
                        onClick={() => setSelectedEventModal(evt)}
                      >
                        Full Information
                      </button>
                      {evt.registrationStatus === 'Open' && (
                        <button
                          className="koms-btn koms-btn--primary"
                          onClick={() => setSelectedEventModal(evt)}
                        >
                          Register
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* =====================================================================
            TAB 6: GALLERY (7 Categories, Lightbox Modal)
            ===================================================================== */}
        {activeTab === 'gallery' && (
          <section className="home-tab-pane">
            <div className="home-section-header">
              <span className="home-eyebrow">
                <Icon name="image" size={14} />
                Activity Gallery
              </span>
              <h2>Training, Ceremonies & Tournament Highlights</h2>
              <p>
                Browse verified photographs from daily classes, belt promotions, state tournaments, and weapons clinics.
              </p>
            </div>

            <div className="dojos-filter-pills" style={{ marginBottom: '22px' }}>
              {[
                'All Photos',
                'Training Sessions',
                'Dojo Activities',
                'Tournaments',
                'Grading Ceremonies',
                'Seminars and Camps',
                'Awards and Achievements',
                'Organization Events',
              ].map((cat) => (
                <button
                  key={cat}
                  className={`filter-pill ${galleryCategoryFilter === cat ? 'active' : ''}`}
                  onClick={() => setGalleryCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="gallery-grid">
              {filteredGallery.map((item) => (
                <div
                  key={item.id}
                  className="gallery-card"
                  onClick={() => setLightboxImage(item)}
                >
                  <img src={item.imageUrl} alt={item.title} />
                  <div className="gallery-card-overlay">
                    <strong>{item.title}</strong>
                    <small>{item.dojoName} · {item.date}</small>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* =====================================================================
            TAB 7: TRADITION & PHILOSOPHY (Dojo Kun, Shorin-Ryu, Kobudo, Reigi)
            ===================================================================== */}
        {activeTab === 'tradition' && (
          <section className="home-tab-pane">
            <div className="home-section-header">
              <span className="home-eyebrow">
                <Icon name="sword" size={14} />
                Heritage & Lineage
              </span>
              <h2>The Okinawan Martial Tradition</h2>
              <p>
                Preserving the timeless ethics, katas, and defensive weapon arts of Okinawa Shorin-Ryu Karate Do
                and Matayoshi Kobudo under Kobudo Renmei Bukenkan - India.
              </p>
            </div>

            <div className="tradition-container">
              {/* Dojo Kun Card */}
              <div className="dojo-kun-card">
                <h3>DOJO KUN · 道場訓</h3>
                <div className="dojo-kun-kanji">Five Classical Precepts of Karate Practice</div>
                <div className="dojo-kun-list">
                  <div className="dojo-kun-item">
                    <strong>一、人格完成に努むること · Hitotsu, Jinkaku Kansei ni Tsutomuru Koto</strong>
                    <p>Seek perfection of character through self-discipline, honesty, and humility.</p>
                  </div>
                  <div className="dojo-kun-item">
                    <strong>一、誠の道を守ること · Hitotsu, Makoto no Michi o Mamoru Koto</strong>
                    <p>Be faithful, sincere, and steadfast in word and deed.</p>
                  </div>
                  <div className="dojo-kun-item">
                    <strong>一、努力の精神を養うこと · Hitotsu, Doryoku no Seishin o Yashinau Koto</strong>
                    <p>Endeavor to cultivate a tireless spirit of effort and perseverance.</p>
                  </div>
                  <div className="dojo-kun-item">
                    <strong>一、礼儀を重んずること · Hitotsu, Reigi o Omonzuru Koto</strong>
                    <p>Respect others, show reverence to masters, and uphold etiquette always.</p>
                  </div>
                  <div className="dojo-kun-item">
                    <strong>一、血気の勇を戒むること · Hitotsu, Kekki no Yu o Imashimuru Koto</strong>
                    <p>Refrain from violent behavior and control foolish aggression.</p>
                  </div>
                </div>
              </div>

              {/* 5 Pillars */}
              <div>
                <h3 style={{ fontFamily: 'Manrope', fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                  The 5 Pillars of Our Karate Philosophy
                </h3>
                <div className="pillars-grid">
                  <div className="pillar-card">
                    <span>🥋</span>
                    <strong>1. Discipline</strong>
                    <p>Punctuality, neat uniform (Gi), focus on instruction, and respectful bowing upon entering the dojo.</p>
                  </div>
                  <div className="pillar-card">
                    <span>🙇</span>
                    <strong>2. Respect</strong>
                    <p>Reverence for Sensei, compassion toward junior students, and fair sportsmanship with sparring partners.</p>
                  </div>
                  <div className="pillar-card">
                    <span>🔁</span>
                    <strong>3. Consistency</strong>
                    <p>Progress is built not in single days, but through regular weekly training over months and years.</p>
                  </div>
                  <div className="pillar-card">
                    <span>🎯</span>
                    <strong>4. Focus</strong>
                    <p>Sharpening mental presence (Zanshin), eliminating outside distractions, and perfecting each punch.</p>
                  </div>
                  <div className="pillar-card">
                    <span>🛡️</span>
                    <strong>5. Perseverance</strong>
                    <p>Enduring tough conditioning drills and pushing past mental fatigue to discover true inner strength.</p>
                  </div>
                </div>
              </div>

              {/* Shorin-Ryu Tradition & Kobudo Weapon Arts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px' }}>
                <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '28px' }}>
                  <h4 style={{ fontFamily: 'Manrope', fontSize: '18px', fontWeight: 800, color: '#b5121b', marginBottom: '10px' }}>
                    Shorin-Ryu & Matsubayashi Heritage
                  </h4>
                  <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
                    Shorin-Ryu is one of the oldest and most natural Okinawan karate styles. Characterized by natural,
                    upright stances, circular defense, and devastating linear counter-attacks, it traces its roots
                    directly to legendary masters Matsumura Sokon and Itosu Anko. Matsubayashi-Ryu, founded by Master
                    Shoshin Nagamine in 1947, preserves these principles with deep emphasis on fast evasion, hip rotation,
                    and breathing harmony.
                  </p>
                </div>
                <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '28px' }}>
                  <h4 style={{ fontFamily: 'Manrope', fontSize: '18px', fontWeight: 800, color: '#b5121b', marginBottom: '10px' }}>
                    Traditional Kobudo Weapons Training
                  </h4>
                  <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', marginBottom: '12px' }}>
                    Kobudo is the sister art of Okinawan weapon defense developed by islanders using farming implements:
                  </p>
                  <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '12.5px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li><strong>Rokushaku Bo:</strong> 6-foot wooden staff teaching leverage, long-range defense, and hip power.</li>
                    <li><strong>Sai:</strong> Iron tridents designed to trap swords, block strikes, and strike with precision.</li>
                    <li><strong>Nunchaku:</strong> Two-section hardwood flail for speed, coordination, and reflex timing.</li>
                    <li><strong>Tonfa & Tekko:</strong> Side-handle batons and knuckles providing wrist reinforcement.</li>
                  </ul>
                  <small style={{ display: 'block', marginTop: '12px', color: '#b5121b', fontWeight: 700, fontSize: '11px' }}>
                    * Safety note: All weapons training is strictly supervised by certified Dan instructors with padded safety gear.
                  </small>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            TAB 8: JOIN US (Interactive 4-Step Registration Workflow & Tracker)
            ===================================================================== */}
        {activeTab === 'join-us' && (
          <section className="home-tab-pane">
            <div className="home-section-header">
              <span className="home-eyebrow">
                <Icon name="checkCircle" size={14} />
                Student Registration & Enquiry
              </span>
              <h2>Begin Your Martial Arts Journey</h2>
              <p>
                Submit an enquiry to join our approved dojos in Ranga Nagar, New Perungalathur, Anna Nagar,
                or surrounding branches. Your request will be reviewed directly by the branch Master.
              </p>
            </div>

            <div className="join-workflow-container">
              {/* Registration Form / Confirmation */}
              <div className="join-form-card">
                {!joinSubmissionResult ? (
                  <form onSubmit={handleJoinSubmit}>
                    <h3>Student Registration Enquiry</h3>
                    <p>Step {joinStep} of 4 — {joinStep === 1 ? 'Select Dojo' : joinStep === 2 ? 'Batch Details' : joinStep === 3 ? 'Student Information' : 'Consents & Submit'}</p>

                    <div className="join-steps-indicator">
                      <div className={`join-step-dot ${joinStep >= 1 ? 'active' : ''}`} />
                      <div className={`join-step-dot ${joinStep >= 2 ? 'active' : ''}`} />
                      <div className={`join-step-dot ${joinStep >= 3 ? 'active' : ''}`} />
                      <div className={`join-step-dot ${joinStep >= 4 ? 'active' : ''}`} />
                    </div>

                    {joinError && (
                      <div style={{ padding: '10px 14px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b5121b', fontSize: '12px', fontWeight: 600, marginBottom: '16px' }}>
                        {joinError}
                      </div>
                    )}

                    {/* Step 1: Select Dojo & Registration Method */}
                    {joinStep === 1 && (
                      <div className="form-grid">
                        <div className="form-group full">
                          <label style={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'block' }}>
                            Registration Type:
                          </label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                            <div
                              onClick={() => setRegMethod('new_student')}
                              style={{
                                padding: '12px',
                                borderRadius: '10px',
                                border: regMethod === 'new_student' ? '2px solid #b5121b' : '1px solid #cbd5e1',
                                background: regMethod === 'new_student' ? '#fef2f2' : '#fff',
                                cursor: 'pointer',
                              }}
                            >
                              <strong style={{ fontSize: '13px', display: 'block', color: regMethod === 'new_student' ? '#b5121b' : '#1e293b' }}>
                                Method 1: New Student Admission
                              </strong>
                              <small style={{ color: '#64748b', fontSize: '11px' }}>New martial arts joiner. One-time entry fee collected upon admission.</small>
                            </div>

                            <div
                              onClick={() => setRegMethod('existing_student')}
                              style={{
                                padding: '12px',
                                borderRadius: '10px',
                                border: regMethod === 'existing_student' ? '2px solid #b5121b' : '1px solid #cbd5e1',
                                background: regMethod === 'existing_student' ? '#fef2f2' : '#fff',
                                cursor: 'pointer',
                              }}
                            >
                              <strong style={{ fontSize: '13px', display: 'block', color: regMethod === 'existing_student' ? '#b5121b' : '#1e293b' }}>
                                Method 2: Existing Student Dojo Transfer
                              </strong>
                              <small style={{ color: '#15803d', fontSize: '11px', fontWeight: 600 }}>Rule 12: Zero Duplicate Entry Fee (Exempt for verified transfers)</small>
                            </div>
                          </div>
                        </div>

                        <div className="form-group full">
                          <label>Choose Preferred Dojo Branch *</label>
                          <select
                            value={joinDojoId}
                            onChange={(e) => setJoinDojoId(e.target.value)}
                          >
                            {publicDojos.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name} ({d.area}) — Head: {d.headInstructor}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group full">
                          {(() => {
                            const d = publicDojos.find((x) => x.id === joinDojoId) || publicDojos[0]
                            return (
                              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                                <strong>Selected Dojo:</strong> {d.name}<br />
                                <strong>Address:</strong> {d.address}<br />
                                <strong>Training Days:</strong> {d.trainingDays.join(', ')}<br />
                                <strong>Entry Fee:</strong> {regMethod === 'existing_student' ? <span style={{ color: '#15803d', fontWeight: 700 }}>₹0 (Transfer Student Waived)</span> : `₹${d.entryFee}`} · <strong>Monthly Fee:</strong> ₹{d.monthlyFee}
                              </div>
                            )
                          })()}
                        </div>
                        <div className="form-group full" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                          <button
                            type="button"
                            className="koms-btn koms-btn--primary"
                            onClick={() => setJoinStep(2)}
                          >
                            Continue to Batch Selection →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Training Category */}
                    {joinStep === 2 && (
                      <div className="form-grid">
                        <div className="form-group full">
                          <label>Training Category / Batch *</label>
                          <select
                            value={joinCategory}
                            onChange={(e) => setJoinCategory(e.target.value)}
                          >
                            <option value="Junior Dragons (Ages 5–11)">Junior Dragons Foundation (Ages 5–11)</option>
                            <option value="Cadet & Youth Warriors (Ages 12–17)">Cadet & Youth Warriors (Ages 12–17)</option>
                            <option value="Teens & Adult Karate / Self-Defense">Teens & Adult Karate / Practical Self-Defense</option>
                            <option value="Kobudo Weapons Specialization">Kobudo Weapons Specialization (Staff, Sai, Nunchaku)</option>
                            <option value="Weekend Intensive Batch">Weekend Intensive Saturday & Sunday Batch</option>
                          </select>
                        </div>
                        <div className="form-group full">
                          <label>Previous Martial Arts Experience</label>
                          <input
                            type="text"
                            placeholder="e.g. Beginner, or Yellow Belt in other school"
                            value={priorExperience}
                            onChange={(e) => setPriorExperience(e.target.value)}
                          />
                        </div>
                        <div className="form-group full" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                          <button
                            type="button"
                            className="koms-btn koms-btn--outline"
                            onClick={() => setJoinStep(1)}
                          >
                            ← Back
                          </button>
                          <button
                            type="button"
                            className="koms-btn koms-btn--primary"
                            onClick={() => setJoinStep(3)}
                          >
                            Continue to Student Details →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Student & Guardian Details */}
                    {joinStep === 3 && (
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Student's Full Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. R. Koushik"
                            value={studentFullName}
                            onChange={(e) => setStudentFullName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Date of Birth *</label>
                          <input
                            type="text"
                            placeholder="DD.MM.YYYY or DD/MM/YYYY"
                            value={studentDob}
                            onChange={(e) => setStudentDob(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Gender *</label>
                          <select
                            value={studentGender}
                            onChange={(e) => setStudentGender(e.target.value)}
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Blood Group</label>
                          <select
                            value={studentBloodGroup}
                            onChange={(e) => setStudentBloodGroup(e.target.value)}
                          >
                            <option value="B+ve">B+ve</option>
                            <option value="O+ve">O+ve</option>
                            <option value="A+ve">A+ve</option>
                            <option value="AB+ve">AB+ve</option>
                            <option value="B-ve">B-ve</option>
                            <option value="O-ve">O-ve</option>
                            <option value="A-ve">A-ve</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Parent / Guardian Name (For Minors)</label>
                          <input
                            type="text"
                            placeholder="e.g. S. Ramanathan"
                            value={guardianName}
                            onChange={(e) => setGuardianName(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Contact Phone Number *</label>
                          <input
                            type="tel"
                            placeholder="e.g. 9840123456"
                            value={guardianPhone}
                            onChange={(e) => setGuardianPhone(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>WhatsApp Number</label>
                          <input
                            type="tel"
                            placeholder="Same as phone or alternate"
                            value={guardianWhatsapp}
                            onChange={(e) => setGuardianWhatsapp(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Email Address *</label>
                          <input
                            type="email"
                            placeholder="for login credentials & updates"
                            value={applicantEmail}
                            onChange={(e) => setApplicantEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group full">
                          <label>Residential Address / Locality</label>
                          <input
                            type="text"
                            placeholder="Street, locality, area (e.g. Ranga Nagar, Mudichur)"
                            value={residentialAddress}
                            onChange={(e) => setResidentialAddress(e.target.value)}
                          />
                        </div>

                        {/* Method 2 Transfer Specific Information */}
                        {regMethod === 'existing_student' && (
                          <div className="form-group full" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '12px', margin: '8px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                              <span style={{ fontSize: '16px' }}>🥋</span>
                              <strong style={{ fontSize: '13px', color: '#166534', textTransform: 'uppercase' }}>
                                Transfer Student History & Prior Dojo Records
                              </strong>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                              <div>
                                <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>Previous Dojo Name *</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Okinawa Shorin Honbu"
                                  value={previousDojo}
                                  onChange={(e) => setPreviousDojo(e.target.value)}
                                  required
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>Previous Master / Sensei *</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Sensei Ashokan A."
                                  value={previousMaster}
                                  onChange={(e) => setPreviousMaster(e.target.value)}
                                  required
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>Current Belt Grade *</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Orange Belt / Green Belt"
                                  value={currentBeltGrade}
                                  onChange={(e) => setCurrentBeltGrade(e.target.value)}
                                  required
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>Years of Practice *</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={yearsOfKarate}
                                  onChange={(e) => setYearsOfKarate(e.target.value)}
                                />
                              </div>
                            </div>
                            <div style={{ marginTop: '10px', fontSize: '11.5px', color: '#15803d', fontWeight: 600 }}>
                              ✓ Rule 12 Verified: Zero Duplicate Entry Fee. Historical belt grade and tenure will be preserved in the central registry.
                            </div>
                          </div>
                        )}
                        <div className="form-group full" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                          <button
                            type="button"
                            className="koms-btn koms-btn--outline"
                            onClick={() => setJoinStep(2)}
                          >
                            ← Back
                          </button>
                          <button
                            type="button"
                            className="koms-btn koms-btn--primary"
                            onClick={() => {
                              if (!studentFullName.trim() || !guardianPhone.trim() || !applicantEmail.trim()) {
                                setJoinError('Please complete student name, contact phone, and email.')
                                return
                              }
                              setJoinError('')
                              setJoinStep(4)
                            }}
                          >
                            Review & Consent →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Consents & Submit */}
                    {joinStep === 4 && (
                      <div>
                        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '12.5px' }}>
                          <strong>Application Summary:</strong><br />
                          <span>Student: <strong>{studentFullName}</strong> ({studentGender}, DOB: {studentDob || 'TBD'})</span><br />
                          <span>Dojo: <strong>{publicDojos.find((d) => d.id === joinDojoId)?.name}</strong></span><br />
                          <span>Batch: <strong>{joinCategory}</strong></span><br />
                          <span>Contact: <strong>{guardianPhone}</strong> · {applicantEmail}</span>
                        </div>

                        <label className="form-checkbox">
                          <input
                            type="checkbox"
                            checked={consentRules}
                            onChange={(e) => setConsentRules(e.target.checked)}
                          />
                          <span>I agree to follow KOMS Dojo Rules, respect Sensei instructions, and uphold the Dojo Kun.</span>
                        </label>

                        <label className="form-checkbox">
                          <input
                            type="checkbox"
                            checked={consentSafety}
                            onChange={(e) => setConsentSafety(e.target.checked)}
                          />
                          <span>I confirm the applicant is physically fit for martial arts training and declare all known health issues.</span>
                        </label>

                        <label className="form-checkbox">
                          <input
                            type="checkbox"
                            checked={consentMedia}
                            onChange={(e) => setConsentMedia(e.target.checked)}
                          />
                          <span>I consent to training photography for internal dojo grading and official recognition (no public child data exposure).</span>
                        </label>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                          <button
                            type="button"
                            className="koms-btn koms-btn--outline"
                            onClick={() => setJoinStep(3)}
                          >
                            ← Back
                          </button>
                          <button
                            type="submit"
                            className="koms-btn koms-btn--primary"
                          >
                            Submit Registration Request ✓
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '32px' }}>
                      ✓
                    </div>
                    <h3 style={{ fontFamily: 'Manrope', fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                      Registration Enquiry Submitted!
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '18px' }}>
                      Your application has been stored in the central KOMS database and forwarded to the branch Sensei for review.
                    </p>

                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', maxWidth: '380px', margin: '0 auto 24px', textAlign: 'left', fontSize: '12.5px' }}>
                      <div>Application Reference ID:</div>
                      <strong style={{ fontSize: '18px', color: '#b5121b', display: 'block', margin: '4px 0 8px 0' }}>
                        {joinSubmissionResult.id}
                      </strong>
                      <span>Student: <strong>{joinSubmissionResult.studentName}</strong></span><br />
                      <span>Dojo: <strong>{joinSubmissionResult.dojoName}</strong></span><br />
                      <span>Status: <strong style={{ color: '#ea580c' }}>Pending Master Review</strong></span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                      <button
                        className="koms-btn koms-btn--outline"
                        onClick={() => {
                          setJoinSubmissionResult(null)
                          setJoinStep(1)
                          setStudentFullName('')
                        }}
                      >
                        Submit Another Enquiry
                      </button>
                      <button
                        className="koms-btn koms-btn--primary"
                        onClick={() => {
                          setStatusQuery(joinSubmissionResult.id)
                          setTrackedEnquiry(joinSubmissionResult)
                        }}
                      >
                        Track Status
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Tracker & Workflow Box */}
              <div className="join-tracker-card">
                <h4 style={{ fontFamily: 'Manrope', fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Track Your Registration Status
                </h4>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                  Enter your Application Reference ID (e.g. <code>KOMS-REQ-2026-1082</code>) or phone number to check approval:
                </p>

                <form onSubmit={handleCheckStatus} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="e.g. KOMS-REQ-2026-1082 or phone"
                    value={statusQuery}
                    onChange={(e) => setStatusQuery(e.target.value)}
                    style={{ flex: 1, height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  />
                  <button type="submit" className="koms-btn koms-btn--primary" style={{ minHeight: '40px', padding: '0 14px' }}>
                    Track
                  </button>
                </form>

                {trackedEnquiry && trackedEnquiry !== 'not_found' && (
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <strong>{trackedEnquiry.id}</strong>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: trackedEnquiry.status === 'approved' ? '#dcfce7' : '#fef3c7',
                        color: trackedEnquiry.status === 'approved' ? '#16a34a' : '#92400e',
                      }}>
                        {trackedEnquiry.status === 'approved' ? 'Approved by Master ✓' : 'Under Sensei Review'}
                      </span>
                    </div>
                    <span>Student: <strong>{trackedEnquiry.studentName}</strong></span><br />
                    <span>Dojo: <strong>{trackedEnquiry.dojoName}</strong></span><br />
                    <span>Submitted: {trackedEnquiry.submittedAt}</span>
                    {trackedEnquiry.reviewerNotes && (
                      <div style={{ marginTop: '8px', padding: '8px', background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#334155' }}>
                        <strong>Sensei Notes:</strong> {trackedEnquiry.reviewerNotes}
                      </div>
                    )}
                  </div>
                )}

                {trackedEnquiry === 'not_found' && (
                  <div style={{ padding: '10px', borderRadius: '8px', background: '#fef2f2', color: '#b5121b', fontSize: '12px' }}>
                    No application found matching that ID or phone number. Try test ID: <code>KOMS-REQ-2026-1082</code>
                  </div>
                )}

                <div className="workflow-steps-graphic">
                  <strong style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>
                    Official Registration Workflow
                  </strong>
                  <div className="workflow-step-node done">
                    <div className="workflow-node-icon">1</div>
                    <div className="workflow-node-text">
                      <strong>Visitor Explores & Selects Dojo</strong>
                      <small>Choose branch in Ranga Nagar, Perungalathur, etc.</small>
                    </div>
                  </div>
                  <div className="workflow-step-node done">
                    <div className="workflow-node-icon">2</div>
                    <div className="workflow-node-text">
                      <strong>Submit Registration Enquiry</strong>
                      <small>Request stored securely in central database</small>
                    </div>
                  </div>
                  <div className="workflow-step-node">
                    <div className="workflow-node-icon">3</div>
                    <div className="workflow-node-text">
                      <strong>Relevant Master Reviews Request</strong>
                      <small>Branch Sensei confirms batch capacity</small>
                    </div>
                  </div>
                  <div className="workflow-step-node">
                    <div className="workflow-node-icon">4</div>
                    <div className="workflow-node-text">
                      <strong>Approval & Account Activation</strong>
                      <small>Email credentials & Student Portal Login granted</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            TAB 9: GRAND MASTER (GM) CONTROL ACCESS
            ===================================================================== */}
        {activeTab === 'login' && (
          <section className="home-tab-pane">
            <div className="login-container gm-login-container">
              <div className="login-head">
                <div className="gm-shield-badge">
                  <span>👑</span>
                </div>
                <h2>Grand Master (GM) Portal Access</h2>
                <p>Executive Organization Management & Dojo Operations</p>
              </div>

              {/* Strict GM Access Restriction Notice */}
              <div className="gm-access-notice">
                <div className="gm-notice-header">
                  <Icon name="shield" size={16} />
                  <strong>Grand Master Access Restriction</strong>
                </div>
                <p>
                  Organization controls (including Attendance Dashboard & Logs, Student Admissions, Master Registrations, Fee Structures, and Multi-Dojo Operations) are restricted and <strong>accessed ONLY by the Grand Master (GM)</strong>.
                </p>
              </div>

              {loginError && (
                <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', fontSize: '12px', fontWeight: 600, marginBottom: '16px' }}>
                  {loginError}
                </div>
              )}

              {loginSuccess && (
                <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', color: '#86efac', fontSize: '12px', fontWeight: 600, marginBottom: '16px' }}>
                  {loginSuccess}
                </div>
              )}

              {/* 1-Click Authorized GM Enter */}
              <div className="gm-direct-action-card">
                <div className="gm-direct-text">
                  <strong style={{ display: 'block', fontSize: '14.5px', color: '#fbbf24' }}>
                    👑 Hanshi Grand Master Executive Access
                  </strong>
                  <small style={{ color: '#94a3b8' }}>
                    Direct entry for authorized Grand Master to open all controls
                  </small>
                </div>
                <button
                  type="button"
                  className="koms-red-login-btn"
                  style={{ padding: '10px 22px', fontSize: '14px' }}
                  onClick={() => quickLoginRole('grandmaster')}
                >
                  Enter GM Controls →
                </button>
              </div>

              <div className="gm-login-divider">
                <span>OR SIGN IN WITH GRAND MASTER CREDENTIALS</span>
              </div>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label>Grand Master ID / Official Email</label>
                  <input
                    type="text"
                    placeholder="grandmaster@koms.in or admin"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label>Master Security Password</label>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '11px', cursor: 'pointer', padding: 0 }}
                      onClick={() => setForgotPasswordOpen(true)}
                    >
                      Default: sensei / koms2026
                    </button>
                  </div>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      style={{ width: '100%', paddingRight: '40px' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="koms-btn koms-btn--primary"
                  style={{ width: '100%', height: '46px', marginTop: '6px', fontWeight: 800, fontSize: '14px', background: '#ef4444' }}
                >
                  <Icon name="shield" size={16} />
                  Authorize & Open GM Controls
                </button>
              </form>

              {/* Student Portal Lookup Option */}
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', textAlign: 'center' }}>
                  Are you a student? Look up your attendance & belt progress:
                </p>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div
                    className="role-chip"
                    style={{ background: '#0a0d16', borderColor: 'rgba(255, 255, 255, 0.1)', cursor: 'pointer' }}
                    onClick={() => quickLoginRole('student', 'KOMS-2026-001')}
                  >
                    <div>
                      <strong style={{ color: '#ffffff' }}>🥋 Student Attendance Record</strong>
                      <small style={{ color: '#94a3b8' }}> · M.P. Niranjana Sri (Yellow Belt)</small>
                    </div>
                    <span style={{ color: '#ef4444', fontWeight: 800, marginLeft: '12px' }}>Lookup →</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                New student not registered yet?{' '}
                <button
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  onClick={() => navigateTo('join-us')}
                >
                  Submit Dojo Admission Enquiry
                </button>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            TAB 10: HELP & LEGAL POLICIES (FAQs, Support, Privacy, Terms)
            ===================================================================== */}
        {activeTab === 'help' && (
          <section className="home-tab-pane">
            <div className="home-section-header">
              <span className="home-eyebrow">
                <Icon name="help" size={14} />
                Support & Legal Guidelines
              </span>
              <h2>Help Center, FAQs & Privacy Policies</h2>
              <p>
                Find answers to common questions about enrollment, belt grading, fees, and read our child privacy policies.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '30px' }}>
              <div>
                <h3 style={{ fontFamily: 'Manrope', fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                  Frequently Asked Questions
                </h3>
                <div className="faq-accordion">
                  {commonFaqs.map((faq, idx) => {
                    const isOpen = activeFaqIndex === idx
                    return (
                      <div key={faq.question} className="faq-item">
                        <button
                          className="faq-question"
                          onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                        >
                          <span>{faq.question}</span>
                          <Icon name="chevron" size={16} />
                        </button>
                        {isOpen && <div className="faq-answer">{faq.answer}</div>}
                      </div>
                    )
                  })}
                </div>

                <div style={{ marginTop: '30px' }}>
                  <h3 style={{ fontFamily: 'Manrope', fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                    Official Legal Policies
                  </h3>

                  <div className="legal-card">
                    <h4>Privacy Policy & Student Data Protection</h4>
                    <p>
                      Kobudo Renmei Bukenkan - India complies with the Digital Personal Data Protection (DPDP) Act.
                      Student data collected (including names, dates of birth, parent contacts, and attendance logs)
                      is strictly utilized for educational verification, belt grading issuance, and emergency parent contact.
                      We never sell, commercialize, or expose student personal records to third parties.
                    </p>
                  </div>

                  <div className="legal-card">
                    <h4>Child & Guardian Privacy Protection Notice</h4>
                    <p>
                      Because many of our karatekas are minors, parental/guardian consent is mandatory for registration.
                      Private student contact numbers, residence addresses, and payment histories are never exposed
                      through the public Common UI. Public rosters show only approved student sports achievements.
                    </p>
                  </div>

                  <div className="legal-card">
                    <h4>Photo & Media Consent Policy</h4>
                    <p>
                      Photographs and event footage published in the Common UI activity gallery are reviewed and approved
                      by the Grand Master. Parents may request the removal or masking of any photograph of their child
                      at any time by contacting support.
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct Support Contact Card */}
              <div>
                <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)' }}>
                  <h3 style={{ fontFamily: 'Manrope', fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                    Contact Support
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '18px' }}>
                    Need help with registration, fee receipts, or finding your nearest dojo? Send a message directly to our admin office.
                  </p>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      alert('Thank you! Your message has been received by the KOMS administrative office.')
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                  >
                    <div className="form-group">
                      <label>Your Name</label>
                      <input type="text" placeholder="Full name" required />
                    </div>
                    <div className="form-group">
                      <label>Email or Phone</label>
                      <input type="text" placeholder="Contact number / email" required />
                    </div>
                    <div className="form-group">
                      <label>Query Category</label>
                      <select>
                        <option>Dojo Admission Enquiry</option>
                        <option>Belt Grading Help</option>
                        <option>Fee Payment Receipt</option>
                        <option>Login / Password Issue</option>
                        <option>General Support</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Message</label>
                      <textarea placeholder="Describe your query..." required />
                    </div>
                    <button type="submit" className="koms-btn koms-btn--primary" style={{ width: '100%', height: '42px' }}>
                      Send Message
                    </button>
                  </form>

                  <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div><strong>Central Honbu:</strong> {cmsData.contactAddress}</div>
                    <div><strong>Direct Helpline:</strong> {cmsData.contactPhone}</div>
                    <div><strong>Official Email:</strong> {cmsData.contactEmail}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* =========================================================================
          DOJO DETAILS MODAL (REQUIREMENT 3)
          ========================================================================= */}
      {selectedDojoModal && (
        <div className="koms-modal-backdrop" onClick={() => setSelectedDojoModal(null)}>
          <div className="koms-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="koms-modal-head">
              <div>
                <small style={{ color: '#b5121b', fontWeight: 800, textTransform: 'uppercase', fontSize: '11px' }}>
                  {selectedDojoModal.badge} · Approved Dojo Details
                </small>
                <h3>{selectedDojoModal.name}</h3>
              </div>
              <button
                className="koms-modal-close"
                onClick={() => setSelectedDojoModal(null)}
                aria-label="Close modal"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="koms-modal-body" style={{ maxHeight: '80vh', overflowY: 'auto', paddingRight: '6px' }}>
              {/* SECTION 1: DOJO OVERVIEW */}
              <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '22px', border: '1px solid #e2e8f0', background: '#090d16' }}>
                <div style={{ height: '220px', position: 'relative' }}>
                  <img
                    src={selectedDojoModal.bannerUrl}
                    alt={selectedDojoModal.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(9,13,22,0.95) 0%, rgba(9,13,22,0.4) 60%, transparent 100%)' }} />
                  <div style={{ position: 'absolute', top: '14px', left: '14px', background: '#b5121b', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>
                    {selectedDojoModal.badge}
                  </div>
                  <div style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, border: '1px solid rgba(255,255,255,0.15)' }}>
                    ₹{selectedDojoModal.monthlyFee} / month
                  </div>
                  <div style={{ position: 'absolute', bottom: '14px', left: '16px', right: '16px' }}>
                    <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 800, margin: 0 }}>{selectedDojoModal.name}</h3>
                    <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0 0' }}>📍 {selectedDojoModal.area}, {selectedDojoModal.city}</p>
                  </div>
                </div>

                <div style={{ padding: '16px', background: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', margin: '0 0 14px 0' }}>
                    {selectedDojoModal.description}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', fontSize: '12.5px', color: '#1e293b' }}>
                    <div>
                      <strong style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', display: 'block' }}>Address:</strong>
                      {selectedDojoModal.address}
                    </div>
                    <div>
                      <strong style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', display: 'block' }}>Landmarks:</strong>
                      {selectedDojoModal.landmarks || 'Near main road junction'}
                    </div>
                  </div>

                  {/* Facilities */}
                  {selectedDojoModal.facilities && selectedDojoModal.facilities.length > 0 && (
                    <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                        Dojo Facilities & Safety Standards:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {selectedDojoModal.facilities.map((f, i) => (
                          <span key={i} style={{ background: '#f1f5f9', color: '#334155', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            ✓ {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 2: MASTER INFORMATION */}
              <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '18px', marginBottom: '22px', color: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #1e293b', pb: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Sensei / Master Profile
                  </span>
                  <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    {selectedDojoModal.instructorRank}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <img
                    src={selectedDojoModal.instructorAvatar || '/masters/master-mathan.jpeg'}
                    alt={selectedDojoModal.headInstructor}
                    style={{ width: '70px', height: '70px', borderRadius: '14px', objectFit: 'cover', border: '2px solid rgba(239, 68, 68, 0.5)', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      {selectedDojoModal.headInstructor}
                    </h4>
                    <p style={{ fontSize: '12px', color: '#f87171', margin: '2px 0 6px 0', fontWeight: 600 }}>
                      {selectedDojoModal.instructorRank} • {selectedDojoModal.instructorExperience}
                    </p>
                    {selectedDojoModal.instructorQualifications && (
                      <p style={{ fontSize: '11.5px', color: '#cbd5e1', margin: '0 0 6px 0' }}>
                        🎓 {selectedDojoModal.instructorQualifications}
                      </p>
                    )}
                    {selectedDojoModal.instructorBio && (
                      <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5', margin: '0 0 10px 0' }}>
                        "{selectedDojoModal.instructorBio}"
                      </p>
                    )}
                    {selectedDojoModal.instructorAchievements && selectedDojoModal.instructorAchievements.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {selectedDojoModal.instructorAchievements.map((ach, idx) => (
                          <span key={idx} style={{ background: '#1e293b', color: '#e2e8f0', fontSize: '10.5px', padding: '2px 8px', borderRadius: '8px', border: '1px solid #334155' }}>
                            🏆 {ach}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3: CLASS SCHEDULE */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '22px' }}>
                <h4 style={{ fontSize: '12.5px', fontWeight: 800, color: '#b5121b', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Training Schedule & Available Batches
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  {selectedDojoModal.timings.map((t) => (
                    <div key={t.batch} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px', borderBottom: '1px dashed #e2e8f0', paddingBottom: '6px' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{t.batch} ({t.days})</span>
                      <span style={{ color: '#b5121b', fontWeight: 800 }}>{t.time}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  <strong>Training Days:</strong> {selectedDojoModal.trainingDays.join(', ')}
                </div>
              </div>

              {/* SECTION 4: CONTACT & FEE STRUCTURE */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Admission Entrance Fee</span>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>₹{selectedDojoModal.entryFee}</div>
                  <small style={{ fontSize: '10.5px', color: '#64748b' }}>One-time official student record</small>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Monthly Training Fee</span>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#b5121b', marginTop: '4px' }}>₹{selectedDojoModal.monthlyFee} / month</div>
                  <small style={{ fontSize: '10.5px', color: '#64748b' }}>Includes all weekly sessions</small>
                </div>
              </div>

              {/* SECTION 5: ACTION BUTTON & CONTACT FOOTER */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  📞 <strong>{selectedDojoModal.phone}</strong> · ✉️ {selectedDojoModal.email}
                </div>
                <button
                  className="koms-btn koms-btn--primary"
                  style={{ padding: '10px 22px', fontSize: '13px', fontWeight: 800, boxShadow: '0 4px 14px rgba(181, 18, 27, 0.4)' }}
                  onClick={() => {
                    const dojoId = selectedDojoModal.id
                    setSelectedDojoModal(null)
                    navigateTo('join-us', { preselectedDojoId: dojoId })
                  }}
                >
                  <Icon name="checkCircle" size={16} />
                  Join This Dojo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MASTER PROFILE MODAL
          ========================================================================= */}
      {selectedMasterModal && (
        <div className="koms-modal-backdrop" onClick={() => setSelectedMasterModal(null)}>
          <div className="koms-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="koms-modal-head">
              <h3>{selectedMasterModal.name}</h3>
              <button
                className="koms-modal-close"
                onClick={() => setSelectedMasterModal(null)}
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="koms-modal-body">
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                <img
                  src={selectedMasterModal.avatarUrl}
                  alt={selectedMasterModal.name}
                  style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover', border: '2px solid #c8a951' }}
                />
                <div>
                  <strong style={{ fontSize: '18px', color: '#0f172a', display: 'block' }}>{selectedMasterModal.name}</strong>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#b5121b' }}>{selectedMasterModal.rank}</span>
                  <small style={{ display: 'block', color: '#64748b' }}>{selectedMasterModal.experience}</small>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <strong style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Biography & Heritage</strong>
                <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', marginTop: '4px' }}>
                  {selectedMasterModal.biography}
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <strong style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Key Achievements</strong>
                <ul style={{ paddingLeft: '18px', margin: '6px 0 0', fontSize: '12.5px', color: '#1e293b' }}>
                  {selectedMasterModal.achievements.map((a) => (
                    <li key={a} style={{ marginBottom: '4px' }}>{a}</li>
                  ))}
                </ul>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', fontSize: '12px', color: '#475569', marginBottom: '20px' }}>
                <strong>Public Teaching Schedule:</strong> {selectedMasterModal.publicSchedule}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  className="koms-btn koms-btn--outline"
                  onClick={() => setSelectedMasterModal(null)}
                >
                  Close
                </button>
                <button
                  className="koms-btn koms-btn--primary"
                  onClick={() => {
                    const dojo = publicDojos.find((d) => d.id === selectedMasterModal.associatedDojoIds[0])
                    setSelectedMasterModal(null)
                    if (dojo) setSelectedDojoModal(dojo)
                  }}
                >
                  View Associated Dojo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          EVENT DETAILS MODAL
          ========================================================================= */}
      {selectedEventModal && (
        <div className="koms-modal-backdrop" onClick={() => setSelectedEventModal(null)}>
          <div className="koms-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="koms-modal-head">
              <div>
                <small style={{ color: '#b5121b', fontWeight: 800, textTransform: 'uppercase', fontSize: '11px' }}>
                  {selectedEventModal.category}
                </small>
                <h3>{selectedEventModal.title}</h3>
              </div>
              <button
                className="koms-modal-close"
                onClick={() => setSelectedEventModal(null)}
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="koms-modal-body">
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '16px', fontSize: '12.5px' }}>
                <div><strong>Date & Time:</strong> {selectedEventModal.date} ({selectedEventModal.time})</div>
                <div><strong>Venue:</strong> {selectedEventModal.venue}</div>
                <div><strong>Organized by:</strong> {selectedEventModal.organizingDojo}</div>
                <div><strong>Eligibility:</strong> {selectedEventModal.eligibility}</div>
                <div><strong>Registration Status:</strong> <span style={{ color: '#16a34a', fontWeight: 700 }}>{selectedEventModal.registrationStatus}</span></div>
                {selectedEventModal.deadline && <div><strong>Deadline:</strong> {selectedEventModal.deadline}</div>}
              </div>

              <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', marginBottom: '16px' }}>
                {selectedEventModal.description}
              </p>

              {selectedEventModal.kobudoCategories && (
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Kobudo Weapon Categories:</strong>
                  <ul style={{ paddingLeft: '18px', margin: '6px 0 0', fontSize: '12px' }}>
                    {selectedEventModal.kobudoCategories.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedEventModal.approvedResults && (
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ fontSize: '12px', color: '#b5121b', textTransform: 'uppercase' }}>Official Results:</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                    {selectedEventModal.approvedResults.map((r) => (
                      <div key={r.category} style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '8px', fontSize: '12px' }}>
                        <strong>{r.category}:</strong> 🥇 1st: {r.first} · 🥈 2nd: {r.second} · 🥉 3rd: {r.third}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Contact: {selectedEventModal.contact}</span>
                <button
                  className="koms-btn koms-btn--primary"
                  onClick={() => {
                    alert(`Registration request recorded for "${selectedEventModal.title}". The event coordinator will contact you at your registered phone.`)
                    setSelectedEventModal(null)
                  }}
                >
                  Register Interest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          GALLERY LIGHTBOX MODAL
          ========================================================================= */}
      {lightboxImage && (
        <div className="koms-modal-backdrop" onClick={() => setLightboxImage(null)}>
          <div className="koms-modal-box" style={{ maxWidth: '820px', background: '#0f172a', color: '#ffffff' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'relative', width: '100%', maxHeight: '65vh', overflow: 'hidden' }}>
              <img
                src={lightboxImage.imageUrl}
                alt={lightboxImage.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
              <button
                onClick={() => setLightboxImage(null)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#ffffff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Close image"
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <span style={{ fontSize: '11px', color: '#c8a951', fontWeight: 800, textTransform: 'uppercase' }}>
                {lightboxImage.category}
              </span>
              <h3 style={{ fontSize: '18px', margin: '4px 0 8px 0', color: '#ffffff' }}>
                {lightboxImage.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '0 0 10px 0' }}>
                {lightboxImage.caption}
              </p>
              <small style={{ color: '#94a3b8', fontSize: '11.5px' }}>
                {lightboxImage.dojoName} · {lightboxImage.date}
              </small>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          GRAND MASTER CMS PREVIEW & EDIT MODAL (REQUIREMENT 13)
          ========================================================================= */}
      {cmsModalOpen && (
        <div className="koms-modal-backdrop" onClick={() => setCmsModalOpen(false)}>
          <div className="koms-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="koms-modal-head">
              <div>
                <small style={{ color: '#92400e', fontWeight: 800, textTransform: 'uppercase', fontSize: '11px' }}>
                  👑 Section 13: Grand Master Control Over Common UI
                </small>
                <h3>Grand Master Content Management System (CMS)</h3>
              </div>
              <button
                className="koms-modal-close"
                onClick={() => setCmsModalOpen(false)}
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="koms-modal-body">
              <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '16px' }}>
                The Grand Master Portal provides tools to control the public-facing content. Edit the hero banner,
                organization motto, and public contact information. Changes save persistently and reflect immediately.
              </p>

              {cmsToast && (
                <div style={{ padding: '10px 14px', borderRadius: '10px', background: '#dcfce7', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: '12px', fontWeight: 700, marginBottom: '16px' }}>
                  {cmsToast}
                </div>
              )}

              <form onSubmit={handleSaveCms} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label>Hero Headline Banner</label>
                  <input
                    type="text"
                    value={cmsHeadline}
                    onChange={(e) => setCmsHeadline(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Organization Official Motto</label>
                  <input
                    type="text"
                    value={cmsMotto}
                    onChange={(e) => setCmsMotto(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Hero Subtext Introduction</label>
                  <textarea
                    value={cmsSubtext}
                    onChange={(e) => setCmsSubtext(e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Public Contact Phone</label>
                    <input
                      type="text"
                      value={cmsPhone}
                      onChange={(e) => setCmsPhone(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Public Contact Email</label>
                    <input
                      type="email"
                      value={cmsEmail}
                      onChange={(e) => setCmsEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                  <strong>Featured Dojos for Public Display:</strong> Ranga Nagar Dojo, Central Honbu New Perungalathur, Anna Nagar Dojo.<br />
                  <strong>Current Status:</strong> <span style={{ color: '#16a34a', fontWeight: 700 }}>Published & Live</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="koms-btn koms-btn--outline"
                    onClick={() => setCmsModalOpen(false)}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="koms-btn koms-btn--gold"
                  >
                    Publish Changes Live ✓
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          FORGOT PASSWORD MODAL
          ========================================================================= */}
      {forgotPasswordOpen && (
        <div className="koms-modal-backdrop" onClick={() => setForgotPasswordOpen(false)}>
          <div className="koms-modal-box" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="koms-modal-head">
              <h3>Password Recovery Guide</h3>
              <button
                className="koms-modal-close"
                onClick={() => setForgotPasswordOpen(false)}
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="koms-modal-body" style={{ fontSize: '13px', color: '#334155' }}>
              <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '10px', border: '1px solid #fecaca', color: '#b5121b', fontWeight: 700, marginBottom: '14px' }}>
                Student Passwords:
              </div>
              <p style={{ margin: '0 0 10px 0' }}>
                For student accounts, your password is set by default to your <strong>Date of Birth</strong> as registered during admission.
              </p>
              <ul style={{ paddingLeft: '18px', margin: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>
                <li>Format: <code>DD.MM.YYYY</code> or <code>DD/MM/YYYY</code> (e.g. <code>30.10.2019</code>)</li>
                <li>Or continuous digits: <code>30102019</code></li>
              </ul>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <strong>Sensei / Admin Passwords:</strong>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Senseis and administrators should contact the Grand Master office or use the authorized default <code>sensei</code> / <code>koms2026</code>.
                </p>
              </div>
              <button
                className="koms-btn koms-btn--primary"
                style={{ width: '100%' }}
                onClick={() => setForgotPasswordOpen(false)}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          REGISTER NEW DOJO MODAL (PUBLIC MASTER APPLICATION -> GRAND MASTER APPROVAL)
          ========================================================================= */}
      {newDojoModalOpen && (
        <div className="koms-modal-backdrop" onClick={() => setNewDojoModalOpen(false)}>
          <div className="koms-modal-box" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="koms-modal-head">
              <h3>Dojo Affiliation & Master Registration</h3>
              <button
                className="koms-modal-close"
                onClick={() => setNewDojoModalOpen(false)}
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="koms-modal-body">
              {dojoRegSubmitted ? (
                <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                  <div style={{ fontSize: '42px', marginBottom: '12px' }}>🥋</div>
                  <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                    Application Successfully Submitted!
                  </h4>
                  <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px', margin: '14px 0', fontSize: '13px', color: '#92400e' }}>
                    <strong>Registration ID:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>{dojoRegSubmitted}</span><br />
                    <strong>Initial Status:</strong> <span style={{ fontWeight: 800 }}>PENDING REVIEW</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                    Your dojo application has been submitted to <strong>Hanshi Grand Master</strong> for verification. Once approved, your dojo profile and Sensei account will automatically activate in the public Chennai directory.
                  </p>
                  <button
                    className="koms-btn koms-btn--primary"
                    onClick={() => {
                      setNewDojoModalOpen(false)
                      setDojoRegSubmitted(null)
                    }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegisterDojoSubmit}>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
                    Submit your martial arts dojo for official affiliation under Kobudo Renmei Bukenkan - India | KOMS.
                  </p>

                  <div className="form-grid">
                    <div className="form-group full">
                      <label>Dojo School Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. MASS DRAGON DOJO — Padappai Branch"
                        value={regDojoName}
                        onChange={(e) => setRegDojoName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Head Master / Sensei Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Sensei M. Vignesh"
                        value={regMasterName}
                        onChange={(e) => setRegMasterName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Contact Mobile Number *</label>
                      <input
                        type="tel"
                        placeholder="e.g. 9884011223"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Official Email Address</label>
                      <input
                        type="email"
                        placeholder="e.g. vignesh@koms.in"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Chennai Locality / Area *</label>
                      <input
                        type="text"
                        placeholder="e.g. Padappai, Mudichur, Anna Nagar"
                        value={regArea}
                        onChange={(e) => setRegArea(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group full">
                      <label>Full Physical Dojo Address *</label>
                      <input
                        type="text"
                        placeholder="Street address, building, landmark, pincode"
                        value={regAddress}
                        onChange={(e) => setRegAddress(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Karate & Martial Arts Style *</label>
                      <input
                        type="text"
                        value={regKarateStyle}
                        onChange={(e) => setRegKarateStyle(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Teaching Experience</label>
                      <input
                        type="text"
                        placeholder="e.g. 12 Years / 3rd Dan Black Belt"
                        value={regExperience}
                        onChange={(e) => setRegExperience(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Proposed Entry Fee (₹)</label>
                      <input
                        type="number"
                        value={regEntryFee}
                        onChange={(e) => setRegEntryFee(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Monthly Tuition Fee (₹)</label>
                      <input
                        type="number"
                        value={regMonthlyFee}
                        onChange={(e) => setRegMonthlyFee(e.target.value)}
                      />
                    </div>

                    <div className="form-group full">
                      <label>Weekly Class Timings</label>
                      <input
                        type="text"
                        value={regTimings}
                        onChange={(e) => setRegTimings(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                    <button
                      type="button"
                      className="koms-btn koms-btn--outline"
                      onClick={() => setNewDojoModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="koms-btn koms-btn--primary"
                    >
                      Submit Dojo Registration →
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          FOOTER (SECTION I)
          ========================================================================= */}
      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-grid">
            <div className="home-footer-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <img src={assetConfig.logo} alt="KOMS Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1.5px solid #c8a951' }} />
                <div>
                  <strong style={{ fontSize: '16px', color: '#ffffff' }}>{cmsData.dojoBranding}</strong>
                  <small style={{ display: 'block', color: '#c8a951', fontSize: '10px' }}>Kobudo Renmei Bukenkan - India</small>
                </div>
              </div>
              <p style={{ fontSize: '12.5px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '12px' }}>
                Dedicated to classical Okinawan Shorin-Ryu Karate Do and traditional Kobudo weaponry.
                Motto: <em>{cmsData.motto}</em>
              </p>
              <small style={{ color: '#64748b', fontSize: '11px' }}>
                Honbu: {cmsData.contactAddress}
              </small>
            </div>

            <div className="home-footer-col">
              <h4>Navigation</h4>
              <ul className="home-footer-links">
                <li><button onClick={() => navigateTo('home')}>Home Overview</button></li>
                <li><button onClick={() => navigateTo('dojos')}>Dojo Directory</button></li>
                <li><button onClick={() => navigateTo('masters')}>Masters & Instructors</button></li>
                <li><button onClick={() => navigateTo('belts')}>Training Levels & Belts</button></li>
                <li><button onClick={() => navigateTo('events')}>Events & Tournaments</button></li>
                <li><button onClick={() => navigateTo('gallery')}>Activity Gallery</button></li>
              </ul>
            </div>

            <div className="home-footer-col">
              <h4>Portals & Registration</h4>
              <ul className="home-footer-links">
                <li><button onClick={() => navigateTo('join-us')}>Join Us / Admission</button></li>
                <li><button onClick={() => navigateTo('join-us')}>Track Application Status</button></li>
                <li><button onClick={() => navigateTo('login')}>Student Portal Login</button></li>
                <li><button onClick={() => navigateTo('login')}>Sensei / Master Portal</button></li>
                <li><button onClick={() => navigateTo('login')}>Grand Master Administration</button></li>
                <li><button onClick={() => setCmsModalOpen(true)}>Common UI CMS</button></li>
              </ul>
            </div>

            <div className="home-footer-col">
              <h4>Help & Legal</h4>
              <ul className="home-footer-links">
                <li><button onClick={() => navigateTo('help')}>Frequently Asked Questions</button></li>
                <li><button onClick={() => navigateTo('help')}>Contact Administrative Support</button></li>
                <li><button onClick={() => navigateTo('help')}>Privacy Policy (DPDP Act)</button></li>
                <li><button onClick={() => navigateTo('help')}>Child & Guardian Privacy</button></li>
                <li><button onClick={() => navigateTo('help')}>Photo & Media Consent</button></li>
                <li><button onClick={() => navigateTo('tradition')}>Dojo Kun & Etiquette</button></li>
              </ul>
            </div>
          </div>

          <div className="home-footer-bottom">
            <span>© 2026 Kobudo Renmei Bukenkan - India | MASS DRAGON DOJO (KOMS). All rights reserved.</span>
            <span>Okinawan Shorin Ryu Karate Do Heritage · Chennai, Tamil Nadu</span>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          PINNED BOTTOM NAVIGATION BAR (MATCHING SCREENSHOT)
          ========================================================================= */}
      <nav className="pinned-bottom-bar" aria-label="Bottom Navigation">
        <button
          className={`bottom-nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => navigateTo('home')}
        >
          <div className="bottom-nav-icon">
            <svg viewBox="0 0 24 24" width={20} height={20} fill={activeTab === 'home' ? '#ef4444' : 'none'} stroke={activeTab === 'home' ? '#ef4444' : '#94a3b8'} strokeWidth="2">
              <path d="m3 11 9-8 9 8v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
              <path d="M9 22V12h6v10" />
            </svg>
          </div>
          <span className="bottom-nav-label">Home</span>
          {activeTab === 'home' && <span className="bottom-nav-indicator" />}
        </button>

        <button
          className={`bottom-nav-item ${activeTab === 'dojos' ? 'active' : ''}`}
          onClick={() => navigateTo('dojos')}
        >
          <div className="bottom-nav-icon">
            <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={activeTab === 'dojos' ? '#ef4444' : '#94a3b8'} strokeWidth="2">
              <path d="M2 5.5c6-1.5 14-1.5 20 0" />
              <path d="M4 9h16" />
              <line x1="6.5" y1="5.5" x2="6.5" y2="21" />
              <line x1="17.5" y1="5.5" x2="17.5" y2="21" />
            </svg>
          </div>
          <span className="bottom-nav-label">Dojo</span>
          {activeTab === 'dojos' && <span className="bottom-nav-indicator" />}
        </button>

        <button
          className={`bottom-nav-item ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => navigateTo('events')}
        >
          <div className="bottom-nav-icon">
            <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={activeTab === 'events' ? '#ef4444' : '#94a3b8'} strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <span className="bottom-nav-label">Events</span>
          {activeTab === 'events' && <span className="bottom-nav-indicator" />}
        </button>

        <button
          className={`bottom-nav-item ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => navigateTo('gallery')}
        >
          <div className="bottom-nav-icon">
            <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={activeTab === 'gallery' ? '#ef4444' : '#94a3b8'} strokeWidth="2">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
          <span className="bottom-nav-label">Gallery</span>
          {activeTab === 'gallery' && <span className="bottom-nav-indicator" />}
        </button>

        <button
          className={`bottom-nav-item ${activeTab === 'belts' ? 'active' : ''}`}
          onClick={() => navigateTo('belts')}
        >
          <div className="bottom-nav-icon">
            <GiUniformIcon size={20} color={activeTab === 'belts' ? '#ef4444' : '#94a3b8'} />
          </div>
          <span className="bottom-nav-label">Training Level</span>
          {activeTab === 'belts' && <span className="bottom-nav-indicator" />}
        </button>
      </nav>
    </div>
  )
}
