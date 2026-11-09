import React from 'react'
import { assetConfig } from '../config/assets'

export type MasterTabId =
  | 'Dashboard'
  | 'Students'
  | 'Fees'
  | 'Attendance'
  | 'Schedule'
  | 'Notes'
  | 'Reports'
  | 'Settings'
  | 'Dojos'
  | 'Seniors'
  | 'Grading'
  | 'Achievements'
  | 'Tournaments'
  | 'AuditLogs'

export interface MasterSidebarProps {
  activeTab: MasterTabId
  onSelectTab: (tab: MasterTabId, subTab?: string) => void
  isOpen: boolean
  onClose: () => void
  onSignOut?: () => void
  role?: string
  assignedDojoName?: string
  activeSubTab?: string
}

export const MasterSidebar: React.FC<MasterSidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  role,
  assignedDojoName,
  activeSubTab,
}) => {
  const isSenior = role === 'senior'
  const isGrandMaster = role === 'grandmaster'

  const allNavItems: {
    id: MasterTabId
    label: string
    icon: React.ReactNode
    roles: string[]
    submodules?: { id: string; label: string }[]
  }[] = [
    {
      id: 'Dashboard',
      label: isGrandMaster ? 'Executive Dashboard' : 'Master Dashboard',
      roles: ['grandmaster', 'master', 'admin', 'senior'],
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: 'Students',
      label: 'Student Management',
      roles: ['grandmaster', 'master', 'admin', 'senior'],
      submodules: [
        { id: 'all', label: 'All Students' },
        { id: 'add', label: 'Add Student' },
        { id: 'requests', label: 'Registration Requests' },
        { id: 'active', label: 'Active Students' },
        { id: 'inactive', label: 'Inactive Students' },
        { id: 'history', label: 'Student History' },
        { id: 'belts', label: 'Belt Management' },
      ],
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: 'Fees',
      label: 'Fee Management',
      roles: ['grandmaster', 'master', 'admin'],
      submodules: [
        { id: 'dashboard', label: 'Fee Dashboard' },
        { id: 'collect', label: 'Collect Fee' },
        { id: 'paid', label: 'Paid Fees' },
        { id: 'pending', label: 'Pending Fees' },
        { id: 'partial', label: 'Partial Payments' },
        { id: 'overdue', label: 'Overdue Fees' },
        { id: 'waived', label: 'Waived Fees' },
        { id: 'history', label: 'Month-wise History' },
        { id: 'receipts', label: 'Payment Receipts' },
        { id: 'reports', label: 'Fee Reports' },
      ],
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      ),
    },
    {
      id: 'Attendance',
      label: 'Attendance Tracking',
      roles: ['grandmaster', 'master', 'admin', 'senior'],
      submodules: [
        { id: 'dashboard', label: 'Attendance Dashboard' },
        { id: 'daily-attendance', label: 'Daily Attendance' },
        { id: 'weekly-schedule', label: 'Weekly Schedule' },
        { id: 'monthly-calendar', label: 'Monthly Calendar' },
        { id: 'attendance-history', label: 'Attendance History' },
        { id: 'monthly-register', label: 'Monthly Matrix Sheet' },
        { id: 'reports', label: 'Attendance Reports' },
      ],
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
          <path d="m9 16 2 2 4-4" />
        </svg>
      ),
    },
    {
      id: 'Schedule',
      label: 'Class Scheduling',
      roles: ['grandmaster', 'master', 'admin', 'senior'],
      submodules: [
        { id: 'dashboard', label: 'Schedule Dashboard' },
        { id: 'weekly', label: 'Weekly Schedule' },
        { id: 'calendar', label: 'Monthly Calendar' },
        { id: 'add-class', label: 'Add New Class' },
        { id: 'history', label: 'Class History' },
      ],
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      id: 'Notes',
      label: 'Announcements',
      roles: ['grandmaster', 'master', 'admin', 'senior'],
      submodules: [
        { id: 'all', label: 'All Announcements' },
        { id: 'create', label: 'Create Announcement' },
        { id: 'scheduled', label: 'Scheduled' },
        { id: 'drafts', label: 'Drafts' },
        { id: 'archived', label: 'Archived' },
      ],
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" x2="8" y1="13" y2="13" />
          <line x1="16" x2="8" y1="17" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      id: 'Reports',
      label: 'Reports & Analytics',
      roles: ['master', 'admin', 'grandmaster'],
      submodules: [
        { id: 'overview', label: 'Reports Overview' },
        { id: 'students', label: 'Student Reports' },
        { id: 'fees', label: 'Fee Reports' },
        { id: 'revenue', label: 'Monthly Revenue' },
        { id: 'attendance', label: 'Attendance Reports' },
        { id: 'classes', label: 'Class Reports' },
        { id: 'belts', label: 'Belt Distribution' },
        { id: 'annual', label: 'Annual Reports' },
      ],
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" x2="18" y1="20" y2="10" />
          <line x1="12" x2="12" y1="20" y2="4" />
          <line x1="6" x2="6" y1="20" y2="14" />
        </svg>
      ),
    },
    {
      id: 'Settings',
      label: 'Master Settings',
      roles: ['grandmaster', 'master', 'admin', 'senior'],
      submodules: [
        { id: 'profile', label: 'My Profile' },
        { id: 'dojo', label: 'Assigned Dojo' },
        { id: 'notifications', label: 'Notification Settings' },
        { id: 'fees', label: 'Fee Preferences' },
        { id: 'schedule', label: 'Schedule Preferences' },
        { id: 'password', label: 'Change Password' },
        { id: 'history', label: 'Activity History' },
      ],
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ]

  const userRole = role || 'master'
  const navItems = allNavItems.filter((item) => item.roles.includes(userRole))

  return (
    <>
      {isOpen && (
        <div
          className="master-sidebar-backdrop"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}

      <aside className={`master-sidebar ${isOpen ? 'is-open' : ''}`}>
        {/* Brand Header */}
        <div className="master-sidebar-header">
          <div className="master-brand-row">
            <div className="master-logo-badge">
              <img
                src={assetConfig.logo}
                alt="KOMS Logo"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=80&auto=format&fit=crop&q=80'
                }}
              />
            </div>
            <div className="master-brand-meta">
              <span className="master-brand-title">KOMS</span>
              <span className="master-brand-subtitle">
                Karate Organization Management System
              </span>
              <span className="master-brand-portal">
                {isSenior ? `SENIOR PORTAL • ${assignedDojoName || 'Assigned Dojo'}` : `MASTER CONTROL PANEL • ${assignedDojoName || 'Ranga Nagar Dojo'}`}
              </span>
            </div>
          </div>
          <button
            className="master-sidebar-close-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Navigation list */}
        <nav className="master-nav-list" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 140px)' }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id
            const hasSubmodules = item.submodules && item.submodules.length > 0

            return (
              <div key={item.id} className="master-nav-group" style={{ marginBottom: '4px' }}>
                <button
                  type="button"
                  className={`master-nav-btn ${isActive ? 'is-active' : ''}`}
                  onClick={() => {
                    onSelectTab(item.id)
                    if (!hasSubmodules) onClose()
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: 'none',
                    background: isActive ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05))' : 'transparent',
                    color: isActive ? '#ef4444' : '#cbd5e1',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="master-nav-icon">{item.icon}</span>
                    <span className="master-nav-label" style={{ fontSize: '13px' }}>{item.label}</span>
                  </div>
                  {hasSubmodules && (
                    <span style={{ fontSize: '10px', color: isActive ? '#ef4444' : '#64748b' }}>
                      {isActive ? '▾' : '▸'}
                    </span>
                  )}
                </button>

                {/* Submodule Items when active */}
                {isActive && hasSubmodules && (
                  <div
                    style={{
                      paddingLeft: '34px',
                      paddingTop: '4px',
                      paddingBottom: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    {item.submodules!.map((sub) => {
                      const isSubActive = activeSubTab === sub.id
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => {
                            onSelectTab(item.id, sub.id)
                            onClose()
                          }}
                          style={{
                            textAlign: 'left',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            background: isSubActive ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                            color: isSubActive ? '#f87171' : '#94a3b8',
                            fontSize: '11.5px',
                            fontWeight: isSubActive ? 700 : 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <span style={{ fontSize: '8px', opacity: isSubActive ? 1 : 0.4 }}>●</span>
                          <span>{sub.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
export default MasterSidebar
