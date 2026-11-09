import React, { useState } from 'react'
import './mobile.css'
import {
  mobileStudents,
  mobileAchievements,
  mobileTournaments,
  mobileEvents,
  mobileRequests,
  mobileAnnouncements,
  mobileNotifications,
  beltLevels,
  calendarDaysOct2025,
  type MobileStudent,
} from './mobileData'

export type ScreenId =
  | 'splash'
  | 'login'
  | 'dashboard'
  | 'profile'
  | 'students'
  | 'student-profile'
  | 'attendance'
  | 'fees'
  | 'belt-progress'
  | 'achievements'
  | 'tournaments'
  | 'events'
  | 'dojo-management'
  | 'requests'
  | 'announcements'
  | 'reports'
  | 'notifications'
  | 'settings'

interface KomsMobileAppProps {
  initialScreen?: ScreenId
  onExitMobile?: () => void
}

export const KomsMobileApp: React.FC<KomsMobileAppProps> = ({
  initialScreen = 'dashboard',
  onExitMobile,
}) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(initialScreen)
  const [selectedStudent, setSelectedStudent] = useState<MobileStudent>(mobileStudents[0])
  const [userRole, setUserRole] = useState<'student' | 'grandmaster'>('student')
  const [showScreenPicker, setShowScreenPicker] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Sub-tabs
  const [loginTab, setLoginTab] = useState<'email' | 'otp'>('email')
  const [studentTab, setStudentTab] = useState<'overview' | 'attendance' | 'fees' | 'belt'>('overview')
  const [tournamentTab, setTournamentTab] = useState<'upcoming' | 'registered' | 'results'>('upcoming')
  const [requestsTab, setRequestsTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [announcementsTab, setAnnouncementsTab] = useState<'all' | 'masters' | 'students' | 'dojo'>('all')
  const [notificationsTab, setNotificationsTab] = useState<'all' | 'system' | 'approvals'>('all')

  // Search & filter
  const [studentSearch, setStudentSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All')

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const navigateTo = (screen: ScreenId) => {
    const gmScreens: ScreenId[] = ['dojo-management', 'requests', 'reports']
    if (gmScreens.includes(screen) && userRole !== 'grandmaster') {
      showToast('🔒 GM Access Required — Switching to Grand Master Role')
      setUserRole('grandmaster')
    }
    setCurrentScreen(screen)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const screensList: { id: ScreenId; num: number; title: string; category: string }[] = [
    { id: 'splash', num: 1, title: 'Splash Screen', category: 'Auth' },
    { id: 'login', num: 2, title: 'Login Screen', category: 'Auth' },
    { id: 'dashboard', num: 3, title: 'Dashboard (Student)', category: 'Student' },
    { id: 'profile', num: 4, title: 'My Profile', category: 'Student' },
    { id: 'students', num: 5, title: 'Students (List)', category: 'Directory' },
    { id: 'student-profile', num: 6, title: 'Student Profile Detail', category: 'Directory' },
    { id: 'attendance', num: 7, title: 'Attendance Calendar', category: 'Student' },
    { id: 'fees', num: 8, title: 'Fees & Invoices', category: 'Student' },
    { id: 'belt-progress', num: 9, title: 'Belt Progress Chain', category: 'Martial' },
    { id: 'achievements', num: 10, title: 'Achievements & Awards', category: 'Martial' },
    { id: 'tournaments', num: 11, title: 'Tournaments', category: 'Events' },
    { id: 'events', num: 12, title: 'Events & Camps', category: 'Events' },
    { id: 'dojo-management', num: 13, title: 'Dojo Management (GM)', category: 'Executive (GM)' },
    { id: 'requests', num: 14, title: 'Requests & Approvals (GM)', category: 'Executive (GM)' },
    { id: 'announcements', num: 15, title: 'Announcements', category: 'Broadcast' },
    { id: 'reports', num: 16, title: 'Reports 8-Tile Grid (GM)', category: 'Executive (GM)' },
    { id: 'notifications', num: 17, title: 'Notifications Center', category: 'Broadcast' },
    { id: 'settings', num: 18, title: 'Settings', category: 'System' },
  ]

  const filteredStudents = mobileStudents.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      st.rollNo.toLowerCase().includes(studentSearch.toLowerCase()) ||
      st.belt.toLowerCase().includes(studentSearch.toLowerCase())
    const matchesStatus = statusFilter === 'All' || st.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="koms-mobile-viewport">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid #ef4444',
            color: '#f8fafc',
            padding: '10px 18px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 600,
            zIndex: 10000,
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            maxWidth: '90%',
            textAlign: 'center',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* =========================================================================
          SCREEN 1: SPLASH SCREEN
          ========================================================================= */}
      {currentScreen === 'splash' && (
        <div className="koms-splash-screen" onClick={() => navigateTo('login')}>
          <div className="koms-splash-emblem">
            <svg
              className="splash-dragon-art"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="100" cy="100" r="92" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.6" />
              <circle cx="100" cy="100" r="82" fill="radial-gradient(circle, #7f1d1d 0%, #1e1115 100%)" />
              <path
                d="M100 22 C145 22 178 58 178 100 C178 142 145 178 100 178 C55 178 22 142 22 100 C22 58 55 22 100 22 Z"
                fill="none"
                stroke="#dc2626"
                strokeWidth="1.5"
                opacity="0.4"
              />
              <path
                d="M65 140 C55 120 60 95 75 80 C85 70 105 65 115 75 C122 82 118 92 110 94 C100 96 92 88 85 95 C75 105 82 125 100 128 C115 130 135 120 142 105 C146 95 142 85 135 80 C130 76 132 68 138 70 C148 74 158 90 152 112 C145 135 120 152 95 150 C80 148 70 145 65 140 Z"
                fill="#ef4444"
              />
              <circle cx="100" cy="108" r="5" fill="#fecaca" />
              <path d="M100 113 L100 128 L92 140 M100 128 L108 140 M90 119 L110 117" stroke="#fecaca" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>

          <div className="splash-title-wrap">
            <h1 className="splash-koms-title">KOMS</h1>
            <div className="splash-koms-sub">Karate Organization Management System</div>
            <div className="splash-koms-org">Kobudo Renmei Bukankan - India</div>
            <div className="splash-motto-tag">Discipline • Strength • Internal Peace.</div>
          </div>

          <div className="splash-loading-wrap">
            <div className="splash-progress-track">
              <div className="splash-progress-bar" />
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '0.08em' }}>
              Loading... (Tap anywhere to start)
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 2: LOGIN SCREEN
          ========================================================================= */}
      {currentScreen === 'login' && (
        <div className="koms-mobile-screen" style={{ paddingBottom: '90px' }}>
          {/* Torii Gate Hero Header */}
          <div className="login-torii-hero">
            <div className="torii-sun-art">
              <div className="torii-karate-silhouette">
                <svg width="48" height="58" viewBox="0 0 48 58" fill="#ffffff">
                  <circle cx="24" cy="10" r="7" />
                  <path d="M24 18 L24 36 L15 52 M24 36 L33 52 M12 25 L36 22" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Brand Titles */}
          <div className="login-form-wrap">
            <div className="login-brand-header">
              <h2 className="login-title-text">KOMS</h2>
              <div className="login-sub-text">Karate Organization Management System</div>
              <div className="login-org-text">Kobudo Renmei Bukankan - India</div>
            </div>

            {/* Email / OTP Toggle */}
            <div className="login-pill-tabs">
              <button
                className={`login-pill-tab ${loginTab === 'email' ? 'active' : ''}`}
                onClick={() => setLoginTab('email')}
              >
                Email Login
              </button>
              <button
                className={`login-pill-tab ${loginTab === 'otp' ? 'active' : ''}`}
                onClick={() => setLoginTab('otp')}
              >
                OTP Login
              </button>
            </div>

            {/* Inputs */}
            {loginTab === 'email' ? (
              <>
                <div className="mobile-input-group">
                  <span className="mobile-input-icon">✉</span>
                  <input
                    type="email"
                    className="mobile-input-field"
                    placeholder="Email Address"
                    defaultValue="arjun@email.com"
                  />
                </div>
                <div className="mobile-input-group">
                  <span className="mobile-input-icon">🔒</span>
                  <input
                    type="password"
                    className="mobile-input-field"
                    placeholder="Password"
                    defaultValue="••••••••"
                  />
                  <span className="mobile-input-icon-right">👁</span>
                </div>
              </>
            ) : (
              <div className="mobile-input-group">
                <span className="mobile-input-icon">📱</span>
                <input
                  type="tel"
                  className="mobile-input-field"
                  placeholder="Enter Registered Mobile Number"
                  defaultValue="+91 98765 43210"
                />
              </div>
            )}

            {/* Options */}
            <div className="login-remember-row">
              <label className="login-checkbox-label">
                <input type="checkbox" defaultChecked />
                <span>Remember Me</span>
              </label>
              <a href="#forgot" className="login-forgot-link" onClick={(e) => { e.preventDefault(); showToast('Password reset link sent'); }}>
                Forgot Password?
              </a>
            </div>

            {/* Red Action Button */}
            <button className="mobile-btn-primary" onClick={() => navigateTo('dashboard')}>
              Login
            </button>

            {/* Demo Role Switcher */}
            <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', textAlign: 'center' }}>
                Quick Demo Logins
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #22c55e',
                    background: userRole === 'student' ? 'rgba(34,197,94,0.15)' : 'transparent',
                    color: '#86efac',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setUserRole('student')
                    showToast('Logged in as Arjun R (Student)')
                    navigateTo('dashboard')
                  }}
                >
                  🥋 Student (Arjun)
                </button>
                <button
                  type="button"
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #ef4444',
                    background: userRole === 'grandmaster' ? 'rgba(239,68,68,0.15)' : 'transparent',
                    color: '#fca5a5',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setUserRole('grandmaster')
                    showToast('Logged in as Grand Master (Full Controls)')
                    navigateTo('dojo-management')
                  }}
                >
                  👑 Grand Master
                </button>
              </div>
            </div>

            <div className="login-footer-text">
              Don't have an account?{' '}
              <a href="#contact" onClick={(e) => { e.preventDefault(); showToast('Please contact your Dojo Master for admission registration.'); }}>
                Contact your dojo
              </a>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 3: DASHBOARD (STUDENT)
          ========================================================================= */}
      {currentScreen === 'dashboard' && (
        <div className="koms-mobile-screen">
          {/* Top Bar with restricted logo size */}
          <div className="koms-mobile-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigateTo('splash')}>
              <img
                src="/assets/koms-logo.png"
                alt="KOMS"
                style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'contain' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <span className="mobile-header-title">KOMS</span>
            </div>
            <div className="mobile-header-actions">
              <button className="mobile-icon-btn" onClick={() => navigateTo('notifications')} title="Notifications">
                <span style={{ fontSize: '18px' }}>🔔</span>
                <span className="mobile-notif-dot" />
              </button>
              <div style={{ cursor: 'pointer' }} onClick={() => navigateTo('profile')}>
                <img
                  src="/assets/card_student_gi.jpg"
                  alt="Arjun R"
                  className="mobile-header-avatar"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Red Sun Kata Banner */}
          <div className="mobile-dash-banner">
            <div className="dash-banner-left">
              <div className="dash-banner-motto">
                Discipline.<br />
                Strength.<br />
                Internal Peace.
              </div>
              <div className="dash-banner-sub">Kobudo Renmei Bukankan</div>
            </div>
            <div className="dash-banner-sun-circle">
              {/* Kick silhouette inside sun circle */}
              <svg width="68" height="68" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="48" fill="#ef4444" />
                <circle cx="50" cy="22" r="8" fill="#090b12" />
                <path
                  d="M50 30 L46 52 L26 70 M46 52 L78 30 M42 40 L65 38 M42 40 L26 45"
                  stroke="#090b12"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M26 70 L12 78 M78 30 L90 26" stroke="#090b12" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Student Profile Strip */}
          <div className="mobile-profile-strip" onClick={() => navigateTo('profile')}>
            <img
              src="/assets/card_student_gi.jpg"
              alt="Arjun R"
              className="profile-strip-avatar"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
              }}
            />
            <div className="profile-strip-info">
              <div className="profile-strip-name">Arjun R</div>
              <div className="profile-strip-role">Student</div>
              <div className="profile-strip-dojo">Chennai Dojo</div>
            </div>
            <span className="status-pill-green">Active</span>
          </div>

          {/* 4-Stat Metric Grid */}
          <div className="mobile-metric-grid">
            <div className="mobile-metric-card" onClick={() => navigateTo('attendance')}>
              <div className="metric-top-row">
                <div className="metric-icon-bubble" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                  📊
                </div>
                <span className="metric-label">Attendance</span>
              </div>
              <div className="metric-value">88%</div>
            </div>

            <div className="mobile-metric-card" onClick={() => navigateTo('belt-progress')}>
              <div className="metric-top-row">
                <div className="metric-icon-bubble" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
                  🥋
                </div>
                <span className="metric-label">Belt Progress</span>
              </div>
              <div className="metric-value" style={{ color: '#22c55e' }}>Green</div>
            </div>

            <div className="mobile-metric-card" onClick={() => navigateTo('achievements')}>
              <div className="metric-top-row">
                <div className="metric-icon-bubble" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                  🏆
                </div>
                <span className="metric-label">Achievements</span>
              </div>
              <div className="metric-value">5</div>
            </div>

            <div className="mobile-metric-card" onClick={() => navigateTo('events')}>
              <div className="metric-top-row">
                <div className="metric-icon-bubble" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                  📅
                </div>
                <span className="metric-label">Upcoming Events</span>
              </div>
              <div className="metric-value">2</div>
            </div>
          </div>

          {/* Quick Actions (4 Columns) */}
          <div className="mobile-section-title">Quick Actions</div>
          <div className="mobile-quick-actions">
            <div className="quick-action-btn" onClick={() => navigateTo('attendance')}>
              <div style={{ fontSize: '20px' }}>📋</div>
              <span>Attendance</span>
            </div>
            <div className="quick-action-btn" onClick={() => navigateTo('fees')}>
              <div style={{ fontSize: '20px' }}>💳</div>
              <span>Fees</span>
            </div>
            <div className="quick-action-btn" onClick={() => navigateTo('events')}>
              <div style={{ fontSize: '20px' }}>🥋</div>
              <span>Events</span>
            </div>
            <div className="quick-action-btn" onClick={() => navigateTo('profile')}>
              <div style={{ fontSize: '20px' }}>👤</div>
              <span>Profile</span>
            </div>
          </div>

          {/* Directory Shortcuts */}
          <div style={{ margin: '0 16px 14px', display: 'flex', gap: '8px' }}>
            <button
              className="mobile-btn-primary"
              style={{ padding: '10px 14px', fontSize: '12px' }}
              onClick={() => navigateTo('students')}
            >
              👥 Students Directory
            </button>
            <button
              className="mobile-btn-primary"
              style={{ padding: '10px 14px', fontSize: '12px', background: '#1e293b' }}
              onClick={() => navigateTo('tournaments')}
            >
              🏆 Tournaments
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 4: PROFILE (MY PROFILE)
          ========================================================================= */}
      {currentScreen === 'profile' && (
        <div className="koms-mobile-screen">
          <div className="koms-mobile-header">
            <div className="mobile-header-back-wrap">
              <button className="mobile-back-btn" onClick={() => navigateTo('dashboard')}>‹</button>
              <span className="mobile-header-page-title">My Profile</span>
            </div>
            <button className="mobile-icon-btn" onClick={() => showToast('Profile edit saved')}>✏</button>
          </div>

          <div className="mobile-profile-hero">
            <div className="profile-large-avatar-wrap">
              <img
                src="/assets/card_student_gi.jpg"
                alt="Arjun R"
                className="profile-large-avatar"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
                }}
              />
              <div className="profile-camera-badge" onClick={() => showToast('Update profile photo')}>📷</div>
            </div>
            <h2 className="profile-hero-name">Arjun R</h2>
            <div className="profile-hero-sub">Student • Chennai Dojo</div>
            <span className="status-pill-green">Active</span>
          </div>

          <div className="mobile-menu-list">
            <div className="mobile-menu-item" onClick={() => { setSelectedStudent(mobileStudents[0]); navigateTo('student-profile'); }}>
              <div className="menu-item-left">
                <span>👤</span>
                <span>Personal Details</span>
              </div>
              <span className="menu-chevron">›</span>
            </div>
            <div className="mobile-menu-item" onClick={() => { setSelectedStudent(mobileStudents[0]); setStudentTab('overview'); navigateTo('student-profile'); }}>
              <div className="menu-item-left">
                <span>📞</span>
                <span>Contact Details</span>
              </div>
              <span className="menu-chevron">›</span>
            </div>
            <div className="mobile-menu-item" onClick={() => showToast('Rank: Green Belt (4th Kyu) • 3 Years Active')}>
              <div className="menu-item-left">
                <span>🥋</span>
                <span>Professional Details</span>
              </div>
              <span className="menu-chevron">›</span>
            </div>
            <div className="mobile-menu-item" onClick={() => navigateTo('belt-progress')}>
              <div className="menu-item-left">
                <span>⚔️</span>
                <span>Karate Experience</span>
              </div>
              <span className="menu-chevron">›</span>
            </div>
            <div className="mobile-menu-item" onClick={() => navigateTo('achievements')}>
              <div className="menu-item-left">
                <span>🏆</span>
                <span>Achievements</span>
              </div>
              <span className="menu-chevron">›</span>
            </div>
            <div className="mobile-menu-item" onClick={() => showToast('Password change security check')}>
              <div className="menu-item-left">
                <span>🔒</span>
                <span>Change Password</span>
              </div>
              <span className="menu-chevron">›</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 5: STUDENTS (LIST)
          ========================================================================= */}
      {currentScreen === 'students' && (
        <div className="koms-mobile-screen">
          <div className="koms-mobile-header">
            <div className="mobile-header-back-wrap">
              <button className="mobile-back-btn" onClick={() => navigateTo('dashboard')}>‹</button>
              <span className="mobile-header-page-title">Students</span>
            </div>
            <button className="mobile-icon-btn" onClick={() => showToast('Add new student (GM/Master only)')}>＋</button>
          </div>

          <div className="student-search-bar">
            <span>🔍</span>
            <input
              type="text"
              className="student-search-input"
              placeholder="Search by name or roll number..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
            {studentSearch && (
              <span style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => setStudentSearch('')}>✕</span>
            )}
          </div>

          <div className="student-filters-row">
            <div className="student-filter-select">All Dojos ▼</div>
            <div
              className="student-filter-select"
              style={{ cursor: 'pointer', color: statusFilter !== 'All' ? '#ef4444' : '#94a3b8' }}
              onClick={() => {
                if (statusFilter === 'All') setStatusFilter('Active')
                else if (statusFilter === 'Active') setStatusFilter('Inactive')
                else setStatusFilter('All')
              }}
            >
              Status: {statusFilter} ▼
            </div>
          </div>

          <div className="students-card-list">
            {filteredStudents.map((st) => (
              <div
                key={st.id}
                className="student-list-item"
                onClick={() => {
                  setSelectedStudent(st)
                  navigateTo('student-profile')
                }}
              >
                <div className="student-item-left">
                  <img
                    src={st.avatar}
                    alt={st.name}
                    className="student-item-avatar"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
                    }}
                  />
                  <div>
                    <div className="student-item-name">{st.name}</div>
                    <div className="student-item-meta">
                      {st.rollNo} • <span style={{ color: st.beltColor }}>{st.belt}</span>
                    </div>
                  </div>
                </div>
                <span className={st.status === 'Active' ? 'status-pill-green' : 'badge-inactive'}>
                  {st.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 6: STUDENT PROFILE (DETAIL VIEW)
          ========================================================================= */}
      {currentScreen === 'student-profile' && (
        <div className="koms-mobile-screen">
          <div className="koms-mobile-header">
            <div className="mobile-header-back-wrap">
              <button className="mobile-back-btn" onClick={() => navigateTo('students')}>‹</button>
              <span className="mobile-header-page-title">Student Profile</span>
            </div>
            <button className="mobile-icon-btn" onClick={() => showToast(`Edit profile for ${selectedStudent.name}`)}>✏</button>
          </div>

          <div className="mobile-profile-hero" style={{ paddingBottom: '12px' }}>
            <div className="profile-large-avatar-wrap">
              <img
                src={selectedStudent.avatar}
                alt={selectedStudent.name}
                className="profile-large-avatar"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=140&q=80'
                }}
              />
            </div>
            <h2 className="profile-hero-name">{selectedStudent.name}</h2>
            <div className="profile-hero-sub">
              {selectedStudent.rollNo} • <span style={{ color: selectedStudent.beltColor }}>{selectedStudent.belt}</span>
            </div>
            <span className={selectedStudent.status === 'Active' ? 'status-pill-green' : 'badge-inactive'}>
              {selectedStudent.status}
            </span>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="mobile-tabs-pill-row">
            <button
              className={`pill-tab ${studentTab === 'overview' ? 'active' : ''}`}
              onClick={() => setStudentTab('overview')}
            >
              Overview
            </button>
            <button
              className={`pill-tab ${studentTab === 'attendance' ? 'active' : ''}`}
              onClick={() => { setStudentTab('attendance'); navigateTo('attendance'); }}
            >
              Attendance
            </button>
            <button
              className={`pill-tab ${studentTab === 'fees' ? 'active' : ''}`}
              onClick={() => { setStudentTab('fees'); navigateTo('fees'); }}
            >
              Fees
            </button>
            <button
              className={`pill-tab ${studentTab === 'belt' ? 'active' : ''}`}
              onClick={() => { setStudentTab('belt'); navigateTo('belt-progress'); }}
            >
              Belt Progress
            </button>
          </div>

          {/* Personal Details Card */}
          <div style={{ margin: '0 16px 14px', background: '#101625', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f87171', marginBottom: '12px' }}>Personal Details</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px' }}>
              <span style={{ color: '#94a3b8' }}>Name</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{selectedStudent.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px' }}>
              <span style={{ color: '#94a3b8' }}>Date of Birth</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{selectedStudent.dob}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px' }}>
              <span style={{ color: '#94a3b8' }}>Gender</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{selectedStudent.gender}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px' }}>
              <span style={{ color: '#94a3b8' }}>Blood Group</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{selectedStudent.bloodGroup}</span>
            </div>
          </div>

          {/* Contact Details Card */}
          <div style={{ margin: '0 16px', background: '#101625', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f87171', marginBottom: '12px' }}>Contact Details</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px' }}>
              <span style={{ color: '#94a3b8' }}>Phone</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{selectedStudent.phone}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px' }}>
              <span style={{ color: '#94a3b8' }}>Email</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{selectedStudent.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px' }}>
              <span style={{ color: '#94a3b8' }}>Address</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{selectedStudent.address}</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 7: ATTENDANCE
          ========================================================================= */}
      {currentScreen === 'attendance' && (
        <div className="koms-mobile-screen">
          <div className="koms-mobile-header">
            <div className="mobile-header-back-wrap">
              <button className="mobile-back-btn" onClick={() => navigateTo('dashboard')}>‹</button>
              <span className="mobile-header-page-title">Attendance</span>
            </div>
            <button className="mobile-icon-btn" onClick={() => showToast('Mark attendance entry')}>＋</button>
          </div>

          {/* 3 Donut Rings */}
          <div className="attendance-stats-row">
            <div className="attendance-stat-box">
              <div className="stat-ring stat-ring--total">24</div>
              <span className="stat-box-label">Total Days</span>
            </div>
            <div className="attendance-stat-box">
              <div className="stat-ring stat-ring--present">21</div>
              <span className="stat-box-label">Present</span>
            </div>
            <div className="attendance-stat-box">
              <div className="stat-ring stat-ring--absent">3</div>
              <span className="stat-box-label">Absent</span>
            </div>
          </div>

          {/* Calendar Card */}
          <div className="attendance-calendar-card">
            <div className="calendar-header-row">
              <span style={{ cursor: 'pointer', color: '#94a3b8' }}>‹</span>
              <span className="calendar-month-title">October 2025</span>
              <span style={{ cursor: 'pointer', color: '#94a3b8' }}>›</span>
            </div>

            <div className="calendar-days-grid" style={{ marginBottom: '8px' }}>
              <span className="calendar-day-label">Mon</span>
              <span className="calendar-day-label">Tue</span>
              <span className="calendar-day-label">Wed</span>
              <span className="calendar-day-label">Thu</span>
              <span className="calendar-day-label">Fri</span>
              <span className="calendar-day-label">Sat</span>
              <span className="calendar-day-label">Sun</span>
            </div>

            <div className="calendar-days-grid">
              {calendarDaysOct2025.map((cell) => (
                <div
                  key={cell.day}
                  className="calendar-date-cell"
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    showToast(
                      `Oct ${cell.day}: ${
                        cell.status === 'present'
                          ? 'Present'
                          : cell.status === 'absent'
                          ? 'Absent'
                          : cell.status === 'leave'
                          ? 'Leave'
                          : 'Holiday'
                      }`
                    )
                  }
                >
                  <span>{cell.day}</span>
                  {cell.status && (
                    <span className={`calendar-dot dot--${cell.status}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="attendance-legend">
              <div className="legend-item">
                <span className="calendar-dot dot--present" style={{ display: 'inline-block' }} />
                <span>Present</span>
              </div>
              <div className="legend-item">
                <span className="calendar-dot dot--absent" style={{ display: 'inline-block' }} />
                <span>Absent</span>
              </div>
              <div className="legend-item">
                <span className="calendar-dot dot--leave" style={{ display: 'inline-block' }} />
                <span>Leave</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 8: FEES
          ========================================================================= */}
      {currentScreen === 'fees' && (
        <div className="koms-mobile-screen">
          <div className="koms-mobile-header">
            <div className="mobile-header-back-wrap">
              <button className="mobile-back-btn" onClick={() => navigateTo('dashboard')}>‹</button>
              <span className="mobile-header-page-title">Fees</span>
            </div>
            <button className="mobile-icon-btn" onClick={() => showToast('Download receipt PDF')}>🧾</button>
          </div>

          <div className="fee-main-card">
            <div className="fee-top-row">
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Monthly Fee</span>
              <span className="status-pill-green">Paid</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff' }}>₹2,000</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>Due Date</span>
                <div style={{ fontSize: '12px', color: '#ffffff', fontWeight: 600 }}>10 Oct 2025</div>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>Status</span>
                <div style={{ fontSize: '12px', color: '#22c55e', fontWeight: 600 }}>Paid</div>
              </div>
            </div>
          </div>

          <div className="mobile-section-title">Fee History</div>
          <div className="mobile-card-list">
            <div className="mobile-info-card">
              <div className="mobile-info-left">
                <div className="mobile-info-title">Oct 2025</div>
                <span style={{ fontSize: '10px', color: '#22c55e' }}>Paid</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>₹2,000</div>
            </div>
            <div className="mobile-info-card">
              <div className="mobile-info-left">
                <div className="mobile-info-title">Sep 2025</div>
                <span style={{ fontSize: '10px', color: '#22c55e' }}>Paid</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>₹2,000</div>
            </div>
            <div className="mobile-info-card">
              <div className="mobile-info-left">
                <div className="mobile-info-title">Aug 2025</div>
                <span style={{ fontSize: '10px', color: '#22c55e' }}>Paid</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>₹2,000</div>
            </div>
            <div className="mobile-info-card">
              <div className="mobile-info-left">
                <div className="mobile-info-title">Jul 2025</div>
                <span style={{ fontSize: '10px', color: '#22c55e' }}>Paid</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>₹2,000</div>
            </div>
          </div>

          <div style={{ padding: '16px' }}>
            <button className="mobile-btn-primary" onClick={() => showToast('Full invoice history loaded')}>
              View Full History
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 9: BELT PROGRESS
          ========================================================================= */}
      {currentScreen === 'belt-progress' && (
        <div className="koms-mobile-screen">
          <div className="koms-mobile-header">
            <div className="mobile-header-back-wrap">
              <button className="mobile-back-btn" onClick={() => navigateTo('dashboard')}>‹</button>
              <span className="mobile-header-page-title">Belt Progress</span>
            </div>
            <button className="mobile-icon-btn" onClick={() => showToast('Belt syllabus loaded')}>📖</button>
          </div>

          {/* 8-Belt Color Nodes */}
          <div className="belt-chain-card">
            <div className="belt-circles-chain">
              {beltLevels.map((b) => (
                <div
                  key={b.name}
                  className={`belt-circle-node ${b.name === 'Green' ? 'selected' : ''}`}
                  style={{ backgroundColor: b.color }}
                  onClick={() => showToast(`${b.name} Belt (${b.rank})`)}
                />
              ))}
            </div>
          </div>

          {/* Current Belt Card */}
          <div className="current-belt-badge-card">
            <div className="belt-large-emblem">🥋</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Current Belt</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>Green Belt</div>
          </div>

          {/* Next Promotion */}
          <div className="promotion-req-card">
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f87171' }}>Next Promotion</div>
            <div className="promo-req-list">
              <div>✓ 90% Attendance</div>
              <div>✓ 5 Advanced Kata</div>
              <div>✓ 3 Tournaments</div>
            </div>
            <div className="promo-progress-wrap">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Requirements Progress</span>
                <span style={{ color: '#22c55e', fontWeight: 700 }}>60%</span>
              </div>
              <div className="promo-bar-track">
                <div className="promo-bar-fill" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 10: ACHIEVEMENTS
          ========================================================================= */}
      {currentScreen === 'achievements' && (
        <div className="koms-mobile-screen">
          <div className="koms-mobile-header">
            <div className="mobile-header-back-wrap">
              <button className="mobile-back-btn" onClick={() => navigateTo('dashboard')}>‹</button>
              <span className="mobile-header-page-title">Achievements</span>
            </div>
            <button className="mobile-icon-btn" onClick={() => showToast('Share achievements badge')}>↗</button>
          </div>

          <div className="mobile-card-list" style={{ marginTop: '14px' }}>
            {mobileAchievements.map((ach) => (
              <div key={ach.id} className="mobile-info-card" onClick={() => showToast(`${ach.title} verified`)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: `${ach.iconColor}22`,
                      border: `1.5px solid ${ach.iconColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                    }}
                  >
                    ⭐
                  </div>
                  <div className="mobile-info-left">
                    <div className="mobile-info-title">{ach.title}</div>
                    <div className="mobile-info-sub">{ach.event} • {ach.date}</div>
                  </div>
                </div>
                <span className="menu-chevron">›</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 11: TOURNAMENTS
          ========================================================================= */}
      {currentScreen === 'tournaments' && (
        <div className="koms-mobile-screen">
          <div className="koms-mobile-header">
            <div className="mobile-header-back-wrap">
              <button className="mobile-back-btn" onClick={() => navigateTo('dashboard')}>‹</button>
              <span className="mobile-header-page-title">Tournaments</span>
            </div>
            <button className="mobile-icon-btn" onClick={() => showToast('Rules & Guidelines')}>ℹ</button>
          </div>

          {/* Hero Banner */}
          <div className="tournament-hero-card">
            <img
              src="/assets/card_event_poster.jpg"
              alt="All India Championship"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=600&q=80'
              }}
            />
            <div className="tournament-hero-overlay">
              <div className="tournament-hero-title">All India Karate Championship 2025</div>
              <div className="tournament-hero-date">15 - 17 Nov 2025 • Chennai</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mobile-tabs-pill-row">
            <button
              className={`pill-tab ${tournamentTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setTournamentTab('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={`pill-tab ${tournamentTab === 'registered' ? 'active' : ''}`}
              onClick={() => setTournamentTab('registered')}
            >
              Registered
            </button>
            <button
              className={`pill-tab ${tournamentTab === 'results' ? 'active' : ''}`}
              onClick={() => setTournamentTab('results')}
            >
              Results
            </button>
          </div>

          {/* Tournaments List */}
          <div className="mobile-card-list">
            {mobileTournaments.map((t) => (
              <div key={t.id} className="mobile-info-card">
                <div className="mobile-info-left">
                  <div className="mobile-info-title">{t.title}</div>
                  <div className="mobile-info-sub">{t.date} | {t.location}</div>
                </div>
                <button
                  className="mobile-action-sm-btn"
                  style={{ background: t.status === 'Register' ? '#ef4444' : '#1e293b' }}
                  onClick={() => showToast(`${t.status} for ${t.title}`)}
                >
                  {t.status}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 12: EVENTS
          ========================================================================= */}
      {currentScreen === 'events' && (
        <div className="koms-mobile-screen">
          <div className="koms-mobile-header">
            <div className="mobile-header-back-wrap">
              <button className="mobile-back-btn" onClick={() => navigateTo('dashboard')}>‹</button>
              <span className="mobile-header-page-title">Events</span>
            </div>
            <button className="mobile-icon-btn" onClick={() => showToast('Calendar synced')}>📅</button>
          </div>

          <div className="mobile-card-list" style={{ marginTop: '14px' }}>
            {mobileEvents.map((evt) => (
              <div key={evt.id} className="mobile-info-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={evt.image}
                    alt={evt.title}
                    style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=300&q=80'
                    }}
                  />
                  <div className="mobile-info-left">
                    <div className="mobile-info-title">{evt.title}</div>
                    <div className="mobile-info-sub">{evt.date} | {evt.location}</div>
                  </div>
                </div>
                <button
                  className="mobile-action-sm-btn"
                  style={{ background: evt.action === 'Register' ? '#ef4444' : '#1e293b' }}
                  onClick={() => showToast(`${evt.action} clicked for ${evt.title}`)}
                >
                  {evt.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 13: DOJO MANAGEMENT (GM ONLY)
          ========================================================================= */}
      {currentScreen === 'dojo-management' && (
        <div className="koms-mobile-screen">
          <div className="koms-mobile-header">
            <div className="mobile-header-back-wrap">
              <button className="mobile-back-btn" onClick={() => navigateTo('dashboard')}>‹</button>
              <span className="mobile-header-page-title">Dojo Management</span>
            </div>
            <span style={{ fontSize: '10px', background: '#dc2626', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              GM
            </span>
          </div>

          {/* Hero Card */}
          <div style={{ margin: '14px 16px', background: '#101625', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/assets/card_master_bow.jpg"
              alt="Chennai Dojo"
              style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80'
              }}
            />
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>Chennai Dojo</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Chennai, Tamil Nadu</div>
              <span className="status-pill-green" style={{ marginTop: '4px' }}>Active</span>
            </div>
          </div>

          {/* Action Rows */}
          <div className="mobile-menu-list">
            <div className="mobile-menu-item" onClick={() => showToast('Dojo Details: 142 Active Members • 3 Masters')}>
              <div className="menu-item-left">
                <span>🏛</span>
                <span>Dojo Details</span>
              </div>
              <span className="menu-chevron">›</span>
            </div>
            <div className="mobile-menu-item" onClick={() => showToast('Chief Instructor: Master Ramesh Kumar (5th Dan)')}>
              <div className="menu-item-left">
                <span>🥋</span>
                <span>Dojo Master</span>
              </div>
              <span className="menu-chevron">›</span>
            </div>
            <div className="mobile-menu-item" onClick={() => navigateTo('students')}>
              <div className="menu-item-left">
                <span>👥</span>
                <span>Dojo Students</span>
              </div>
              <span className="menu-chevron">›</span>
            </div>
            <div className="mobile-menu-item" onClick={() => navigateTo('attendance')}>
              <div className="menu-item-left">
                <span>📋</span>
                <span>Dojo Attendance</span>
              </div>
              <span className="menu-chevron">›</span>
            </div>
            <div className="mobile-menu-item" onClick={() => navigateTo('fees')}>
              <div className="menu-item-left">
                <span>💳</span>
                <span>Dojo Fees</span>
              </div>
              <span className="menu-chevron">›</span>
            </div>
            <div className="mobile-menu-item" onClick={() => navigateTo('reports')}>
              <div className="menu-item-left">
                <span>📊</span>
                <span>Dojo Performance</span>
              </div>
              <span className="menu-chevron">›</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 14: REQUESTS & APPROVALS (GM ONLY)
          ========================================================================= */}
      {currentScreen === 'requests' && (
        <div className="koms-mobile-screen">
          <div className="koms-mobile-header">
            <div className="mobile-header-back-wrap">
              <button className="mobile-back-btn" onClick={() => navigateTo('dashboard')}>‹</button>
              <span className="mobile-header-page-title">Requests & Approvals</span>
            </div>
            <span style={{ fontSize: '10px', background: '#dc2626', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              GM
            </span>
          </div>

          <div className="mobile-tabs-pill-row">
            <button
              className={`pill-tab ${requestsTab === 'pending' ? 'active' : ''}`}
              onClick={() => setRequestsTab('pending')}
            >
              Pending (3)
            </button>
            <button
              className={`pill-tab ${requestsTab === 'approved' ? 'active' : ''}`}
              onClick={() => setRequestsTab('approved')}
            >
              Approved
            </button>
            <button
              className={`pill-tab ${requestsTab === 'rejected' ? 'active' : ''}`}
              onClick={() => setRequestsTab('rejected')}
            >
              Rejected
            </button>
          </div>

          <div className="mobile-card-list">
            {mobileRequests.map((req) => (
              <div key={req.id} className="mobile-info-card">
                <div className="mobile-info-left">
                  <div className="mobile-info-title">{req.type}</div>
                  <div className="mobile-info-sub">{req.target} • {req.date}</div>
                </div>
                <button
                  className="mobile-action-sm-btn"
                  onClick={() => showToast(`Approved request for ${req.target}`)}
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 15: ANNOUNCEMENTS
          ========================================================================= */}
      {currentScreen === 'announcements' && (
        <div className="koms-mobile-screen">
          <div className="koms-mobile-header">
            <div className="mobile-header-back-wrap">
              <button className="mobile-back-btn" onClick={() => navigateTo('dashboard')}>‹</button>
              <span className="mobile-header-page-title">Announcements</span>
            </div>
            <button className="mobile-icon-btn" onClick={() => showToast('New announcement created')}>＋</button>
          </div>

          <div className="mobile-tabs-pill-row">
            <button
              className={`pill-tab ${announcementsTab === 'all' ? 'active' : ''}`}
              onClick={() => setAnnouncementsTab('all')}
            >
              All
            </button>
            <button
              className={`pill-tab ${announcementsTab === 'masters' ? 'active' : ''}`}
              onClick={() => setAnnouncementsTab('masters')}
            >
              Masters
            </button>
            <button
              className={`pill-tab ${announcementsTab === 'students' ? 'active' : ''}`}
              onClick={() => setAnnouncementsTab('students')}
            >
              Students
            </button>
            <button
              className={`pill-tab ${announcementsTab === 'dojo' ? 'active' : ''}`}
              onClick={() => setAnnouncementsTab('dojo')}
            >
              Specific Dojo
            </button>
          </div>

          <div className="mobile-card-list">
            {mobileAnnouncements.map((ann) => (
              <div key={ann.id} className="mobile-info-card">
                <div className="mobile-info-left">
                  <div className="mobile-info-title">{ann.title}</div>
                  <div className="mobile-info-sub">{ann.date} • {ann.target}</div>
                </div>
                <button
                  className="mobile-action-sm-btn"
                  style={{ background: '#1e293b' }}
                  onClick={() => showToast(`Announcement: ${ann.title}`)}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 16: REPORTS (GM ONLY 8-TILE GRID)
          ========================================================================= */}
      {currentScreen === 'reports' && (
        <div className="koms-mobile-screen">
          <div className="koms-mobile-header">
            <div className="mobile-header-back-wrap">
              <button className="mobile-back-btn" onClick={() => navigateTo('dashboard')}>‹</button>
              <span className="mobile-header-page-title">Reports</span>
            </div>
            <span style={{ fontSize: '10px', background: '#dc2626', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              GM
            </span>
          </div>

          <div className="reports-8-grid">
            <div className="report-tile" onClick={() => showToast('Exporting Student Report')}>
              <div style={{ fontSize: '24px' }}>👥</div>
              <span>Student Reports</span>
            </div>
            <div className="report-tile" onClick={() => showToast('Exporting Dojo Report')}>
              <div style={{ fontSize: '24px' }}>🏛</div>
              <span>Dojo Reports</span>
            </div>
            <div className="report-tile" onClick={() => showToast('Exporting Master Report')}>
              <div style={{ fontSize: '24px' }}>🥋</div>
              <span>Master Reports</span>
            </div>
            <div className="report-tile" onClick={() => showToast('Exporting Attendance Report')}>
              <div style={{ fontSize: '24px' }}>📋</div>
              <span>Attendance Reports</span>
            </div>
            <div className="report-tile" onClick={() => showToast('Exporting Fee Reports')}>
              <div style={{ fontSize: '24px' }}>💳</div>
              <span>Fee Reports</span>
            </div>
            <div className="report-tile" onClick={() => showToast('Exporting Belt Reports')}>
              <div style={{ fontSize: '24px' }}>🥋</div>
              <span>Belt Reports</span>
            </div>
            <div className="report-tile" onClick={() => showToast('Exporting Tournament Report')}>
              <div style={{ fontSize: '24px' }}>🏆</div>
              <span>Tournament Reports</span>
            </div>
            <div className="report-tile" onClick={() => showToast('Exporting Event Report')}>
              <div style={{ fontSize: '24px' }}>📅</div>
              <span>Event Reports</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 17: NOTIFICATIONS
          ========================================================================= */}
      {currentScreen === 'notifications' && (
        <div className="koms-mobile-screen">
          <div className="koms-mobile-header">
            <div className="mobile-header-back-wrap">
              <button className="mobile-back-btn" onClick={() => navigateTo('dashboard')}>‹</button>
              <span className="mobile-header-page-title">Notifications</span>
            </div>
            <button className="mobile-icon-btn" onClick={() => showToast('All marked as read')}>✓✓</button>
          </div>

          <div className="mobile-tabs-pill-row">
            <button
              className={`pill-tab ${notificationsTab === 'all' ? 'active' : ''}`}
              onClick={() => setNotificationsTab('all')}
            >
              All
            </button>
            <button
              className={`pill-tab ${notificationsTab === 'system' ? 'active' : ''}`}
              onClick={() => setNotificationsTab('system')}
            >
              System
            </button>
            <button
              className={`pill-tab ${notificationsTab === 'approvals' ? 'active' : ''}`}
              onClick={() => setNotificationsTab('approvals')}
            >
              Approvals
            </button>
          </div>

          <div className="mobile-card-list">
            {mobileNotifications.map((notif) => (
              <div key={notif.id} className="mobile-info-card" onClick={() => showToast(notif.title)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    🔔
                  </div>
                  <div className="mobile-info-left">
                    <div className="mobile-info-title">{notif.title}</div>
                    <div className="mobile-info-sub">{notif.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 18: SETTINGS
          ========================================================================= */}
      {currentScreen === 'settings' && (
        <div className="koms-mobile-screen">
          <div className="koms-mobile-header">
            <div className="mobile-header-back-wrap">
              <button className="mobile-back-btn" onClick={() => navigateTo('dashboard')}>‹</button>
              <span className="mobile-header-page-title">Settings</span>
            </div>
          </div>

          <div className="mobile-menu-list" style={{ marginTop: '14px' }}>
            <div className="mobile-menu-item" onClick={() => showToast('Account Settings')}>
              <div className="menu-item-left">
                <span>👤</span>
                <span>Account Settings</span>
              </div>
              <span className="menu-chevron">›</span>
            </div>
            <div className="mobile-menu-item" onClick={() => showToast('Security Settings')}>
              <div className="menu-item-left">
                <span>🔒</span>
                <span>Security</span>
              </div>
              <span className="menu-chevron">›</span>
            </div>
            <div className="mobile-menu-item" onClick={() => showToast('Notification Settings')}>
              <div className="menu-item-left">
                <span>🔔</span>
                <span>Notification Settings</span>
              </div>
              <span className="menu-chevron">›</span>
            </div>
            <div className="mobile-menu-item" onClick={() => showToast('Organization Settings')}>
              <div className="menu-item-left">
                <span>⚙️</span>
                <span>Organization Settings</span>
              </div>
              <span className="menu-chevron">›</span>
            </div>
            <div className="mobile-menu-item" onClick={() => showToast('System Preferences')}>
              <div className="menu-item-left">
                <span>📱</span>
                <span>System Preferences</span>
              </div>
              <span className="menu-chevron">›</span>
            </div>

            <div style={{ marginTop: '20px' }}>
              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1.5px solid #ef4444',
                  background: 'transparent',
                  color: '#ef4444',
                  fontWeight: 700,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  showToast('Logged out')
                  navigateTo('login')
                }}
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          FIXED BOTTOM NAVIGATION BAR
          ========================================================================= */}
      {currentScreen !== 'splash' && currentScreen !== 'login' && (
        <nav className="koms-mobile-bottom-nav">
          <button
            className={`mobile-bottom-item ${currentScreen === 'dashboard' ? 'active' : ''}`}
            onClick={() => navigateTo('dashboard')}
          >
            <span style={{ fontSize: '18px' }}>🏠</span>
            <span>Home</span>
            {currentScreen === 'dashboard' && <div className="mobile-bottom-indicator" />}
          </button>
          <button
            className={`mobile-bottom-item ${currentScreen === 'attendance' ? 'active' : ''}`}
            onClick={() => navigateTo('attendance')}
          >
            <span style={{ fontSize: '18px' }}>📋</span>
            <span>Attendance</span>
            {currentScreen === 'attendance' && <div className="mobile-bottom-indicator" />}
          </button>
          <button
            className={`mobile-bottom-item ${currentScreen === 'events' ? 'active' : ''}`}
            onClick={() => navigateTo('events')}
          >
            <span style={{ fontSize: '18px' }}>🥋</span>
            <span>Events</span>
            {currentScreen === 'events' && <div className="mobile-bottom-indicator" />}
          </button>
          <button
            className={`mobile-bottom-item ${showScreenPicker ? 'active' : ''}`}
            onClick={() => setShowScreenPicker(!showScreenPicker)}
          >
            <span style={{ fontSize: '18px' }}>⋯</span>
            <span>More</span>
          </button>
        </nav>
      )}

      {/* =========================================================================
          18-SCREEN QUICK DIRECTORY BOTTOM SHEET
          ========================================================================= */}
      {showScreenPicker && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 10001,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            backdropFilter: 'blur(5px)',
          }}
          onClick={() => setShowScreenPicker(false)}
        >
          <div
            style={{
              background: '#090b12',
              borderTop: '2px solid #ef4444',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              padding: '20px 16px 30px',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>
                  18 Screens Master Directory
                </h3>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Tap any screen to view and verify on this phone
                </span>
              </div>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
                onClick={() => setShowScreenPicker(false)}
              >
                ✕
              </button>
            </div>

            {/* Quick role toggle */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #22c55e',
                  background: userRole === 'student' ? 'rgba(34,197,94,0.2)' : 'transparent',
                  color: '#86efac',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setUserRole('student')
                  showToast('Role switched to: Student')
                }}
              >
                Role: Student
              </button>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #ef4444',
                  background: userRole === 'grandmaster' ? 'rgba(239,68,68,0.2)' : 'transparent',
                  color: '#fca5a5',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setUserRole('grandmaster')
                  showToast('Role switched to: Grand Master (GM)')
                }}
              >
                Role: Grand Master
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
              {screensList.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: currentScreen === s.id ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,0.03)',
                    border: currentScreen === s.id ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    navigateTo(s.id)
                    setShowScreenPicker(false)
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: '#ef4444',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {s.num}
                    </span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>
                        {s.title}
                      </div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>{s.category}</div>
                    </div>
                  </div>
                  <span style={{ color: '#94a3b8', fontSize: '14px' }}>➔</span>
                </div>
              ))}
            </div>

            {onExitMobile && (
              <button
                type="button"
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'transparent',
                  color: '#94a3b8',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onClick={onExitMobile}
              >
                Switch to Desktop Web View
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default KomsMobileApp
