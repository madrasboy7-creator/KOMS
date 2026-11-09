import { Component, lazy, Suspense, useEffect, useState, type ErrorInfo, type ReactNode } from 'react'
import { GeneralHomeScreen } from './home/GeneralHomeScreen'
import { komsStore } from './services/komsStore'
import { KomsMobileApp, type ScreenId } from './mobile/KomsMobileApp'

const AdminPanel = lazy(() => import('./admin/AdminPanel'))
const StudentPanel = lazy(() => import('./student/StudentPanel'))

class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('KOMS panel failed to render', error, info)
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="app-state">
          <span>K</span>
          <h1>We couldn’t open this panel</h1>
          <p>Please refresh the page. If the issue continues, contact KOMS support.</p>
          <button onClick={() => window.location.reload()}>Reload panel</button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const [session, setSession] = useState(komsStore.getSession())

  // Detect mobile device or viewport
  const isMobileDetected = () => {
    if (typeof window === 'undefined') return false
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get('view') === 'mobile') return true
    if (searchParams.get('view') === 'desktop') return false
    const ua = navigator.userAgent || ''
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|KOMS-Android-App/i.test(ua)
    const isNarrowScreen = window.innerWidth <= 840
    return isMobileUA || isNarrowScreen
  }

  const [isMobileMode, setIsMobileMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('koms_view_mode')
    if (saved === 'mobile') return true
    if (saved === 'desktop') return false
    return isMobileDetected()
  })

  useEffect(() => {
    const handleResize = () => {
      const saved = localStorage.getItem('koms_view_mode')
      if (!saved) {
        setIsMobileMode(isMobileDetected())
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    return komsStore.subscribe(() => {
      setSession(komsStore.getSession())
    })
  }, [])

  // ACCESS CONTROL:
  // Master Control Panel is accessible by Grand Master, Dojo Masters, Admins, and authorized Seniors
  const isMasterOrAdmin =
    session.role === 'grandmaster' ||
    session.role === 'admin' ||
    session.role === 'master' ||
    session.role === 'senior'
  const isStudent = session.role === 'student'

  // Render Dedicated 18-Screen Mobile App on phones / mobile screens
  if (isMobileMode) {
    return (
      <AppErrorBoundary>
        <KomsMobileApp
          initialScreen="dashboard"
          onExitMobile={() => {
            localStorage.setItem('koms_view_mode', 'desktop')
            setIsMobileMode(false)
          }}
        />
        {/* Floating switch to desktop button */}
        <button
          type="button"
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '12px',
            zIndex: 9990,
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            borderRadius: '9999px',
            padding: '6px 12px',
            fontSize: '10px',
            fontWeight: 700,
            backdropFilter: 'blur(8px)',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
          onClick={() => {
            localStorage.setItem('koms_view_mode', 'desktop')
            setIsMobileMode(false)
          }}
        >
          🖥 Desktop
        </button>
      </AppErrorBoundary>
    )
  }

  // Desktop View
  return (
    <AppErrorBoundary>
      {/* Floating button to switch to 18-Screen Mobile Mode */}
      <button
        type="button"
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
          border: '1px solid #f87171',
          color: '#ffffff',
          borderRadius: '9999px',
          padding: '10px 18px',
          fontSize: '12px',
          fontWeight: 800,
          boxShadow: '0 8px 24px rgba(239, 68, 68, 0.5)',
          cursor: 'pointer',
          letterSpacing: '0.04em',
        }}
        onClick={() => {
          localStorage.setItem('koms_view_mode', 'mobile')
          setIsMobileMode(true)
        }}
      >
        📱 18-Screen Mobile View
      </button>

      <Suspense
        fallback={
          <div className="app-state app-state--loading">
            <span>K</span>
            <i />
            <p>Opening Okinawa Shorin Ryu Portal…</p>
          </div>
        }
      >
        {isMasterOrAdmin ? (
          <AdminPanel
            userSession={session}
            onSignOut={() => {
              komsStore.logout()
              setSession(komsStore.getSession())
            }}
          />
        ) : isStudent ? (
          <StudentPanel
            initialStudent={session.student}
            onSignOut={() => {
              komsStore.logout()
              setSession(komsStore.getSession())
            }}
          />
        ) : (
          <GeneralHomeScreen onLoginSuccess={() => setSession(komsStore.getSession())} />
        )}
      </Suspense>
    </AppErrorBoundary>
  )
}
