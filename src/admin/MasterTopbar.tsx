import React, { useState } from 'react'
import type { MasterTabId } from './MasterSidebar'
import type { MasterProfileData } from './masterData'

interface MasterTopbarProps {
  activeTab: MasterTabId
  profile: MasterProfileData
  onOpenMenu: () => void
  onOpenScanner: () => void
  onSelectTab: (tab: MasterTabId) => void
  onSignOut: () => void
  role?: string
}

export const MasterTopbar: React.FC<MasterTopbarProps> = ({
  activeTab,
  profile,
  onOpenMenu,
  onOpenScanner,
  onSelectTab,
  onSignOut,
  role,
}) => {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const isSenior = role === 'senior'

  const notifications = [
    { id: 1, title: 'New Registration', desc: 'Arun Prasath enrolled for White Belt', time: '10m ago', unread: true },
    { id: 2, title: 'Fee Payment Received', desc: '₹1,000 paid by Karthik S', time: '1h ago', unread: true },
    { id: 3, title: 'Tournament Alert', desc: 'Chennai Championship registration is live', time: '3h ago', unread: false },
  ]

  const tabTitles: Record<MasterTabId, string> = {
    Dashboard: isSenior ? 'Senior Dashboard' : 'Master Dashboard',
    Profile: 'My Profile',
    Students: 'Students Directory',
    Attendance: 'Attendance Register & Reports',
    Fees: 'Fee Collection',
    Achievements: 'Achievements & Belts',
    Tournaments: 'Tournaments & Championships',
    Notes: 'Notes & Announcements',
    Schedule: 'Class Schedule Management',
    Settings: 'Settings & Dojo Control',
  }

  return (
    <header className="master-topbar">
      <div className="master-topbar-left">
        <button
          className="master-menu-toggle-btn"
          onClick={onOpenMenu}
          aria-label="Open sidebar menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="master-topbar-breadcrumb">
          <span className="master-topbar-eyebrow">
            {isSenior ? 'SENIOR INSTRUCTOR PORTAL • RANGA NAGAR' : 'MASTER PORTAL'}
          </span>
          <h1 className="master-topbar-heading">{tabTitles[activeTab]}</h1>
        </div>
      </div>


      <div className="master-topbar-right">
        {/* Quick QR Pass Scanner */}
        <button
          className="master-topbar-tool-btn"
          onClick={onOpenScanner}
          title="Scan Student QR Pass"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="6" height="6" x="3" y="3" rx="1" />
            <rect width="6" height="6" x="15" y="3" rx="1" />
            <rect width="6" height="6" x="3" y="15" rx="1" />
            <path d="M15 15h2v2h-2z" />
            <path d="M19 15h2v6h-6v-2" />
            <path d="M12 3v4" />
            <path d="M12 11v2" />
            <path d="M3 12h5" />
            <path d="M12 16v5" />
          </svg>
          <span className="master-topbar-btn-label">QR Scanner</span>
        </button>

        {/* Notifications Icon with Dropdown */}
        <div className="master-dropdown-rel">
          <button
            className="master-icon-circle-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            title="Notifications"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span className="master-notif-dot" />
          </button>

          {showNotifications && (
            <div className="master-dropdown-menu master-notif-menu">
              <div className="master-dropdown-head">
                <strong>Dojo Notifications</strong>
                <span className="master-badge-pill">3 New</span>
              </div>
              <div className="master-notif-list">
                {notifications.map((n) => (
                  <div key={n.id} className={`master-notif-item ${n.unread ? 'is-unread' : ''}`}>
                    <div className="master-notif-title">{n.title}</div>
                    <div className="master-notif-desc">{n.desc}</div>
                    <small className="master-notif-time">{n.time}</small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar with status and dropdown */}
        <div className="master-dropdown-rel">
          <button
            className="master-avatar-pill-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-label="Sensei profile menu"
          >
            <div className="master-avatar-wrap">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="master-topbar-avatar"
              />
              <span className="master-online-indicator" />
            </div>
            <div className="master-avatar-text">
              <strong>{profile.name}</strong>
              <small>Ranga Nagar Dojo</small>
            </div>
          </button>

          {showProfileMenu && (
            <div className="master-dropdown-menu master-profile-menu">
              <div className="master-dropdown-head">
                <strong>{profile.name}</strong>
                <small style={{ color: '#64748b', display: 'block' }}>{profile.role}</small>
              </div>
              <button
                className="master-dropdown-item"
                onClick={() => {
                  onSelectTab('Profile')
                  setShowProfileMenu(false)
                }}
              >
                👤 View Sensei Profile
              </button>
              <button
                className="master-dropdown-item"
                onClick={() => {
                  onSelectTab('Settings')
                  setShowProfileMenu(false)
                }}
              >
                ⚙️ Dojo Settings
              </button>
              <div className="master-dropdown-divider" />
              <button
                className="master-dropdown-item master-logout-item"
                onClick={onSignOut}
              >
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
