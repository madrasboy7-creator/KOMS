import React, { useState, useEffect } from 'react'
import { MasterSidebar, type MasterTabId } from './MasterSidebar'
import { MasterTopbar } from './MasterTopbar'
import {
  initialMasterProfile,
  initialMasterStudents,
  initialAchievements,
  initialRecentAchievements,
  initialTournaments,
  initialPastTournaments,
  initialNotes,
  initialSchedule,
  initialActivities,
  type MasterStudent,
  type MasterProfileData,
  type MasterAchievement,
  type MasterTournament,
  type MasterNote,
  type MasterScheduleItem,
  type MasterActivityItem,
} from './masterData'
import { komsStore } from '../services/komsStore'

// Tab components
import { TabDashboard } from './tabs/TabDashboard'
import { TabProfile } from './tabs/TabProfile'
import { TabStudents } from './tabs/TabStudents'
import { TabAttendance } from './tabs/TabAttendance'
import { TabFees } from './tabs/TabFees'
import { TabAchievements } from './tabs/TabAchievements'
import { TabTournaments } from './tabs/TabTournaments'
import { TabNotes } from './tabs/TabNotes'
import { TabSchedule } from './tabs/TabSchedule'
import { TabSettings } from './tabs/TabSettings'
import { TabDojos } from './tabs/TabDojos'
import { TabSeniors } from './tabs/TabSeniors'
import { TabBeltGrading } from './tabs/TabBeltGrading'
import { TabAuditLogs } from './tabs/TabAuditLogs'
import { TabReports } from './tabs/TabReports'

// Modals
import { StudentDetailModal } from './modals/StudentDetailModal'
import { EditProfileModal } from './modals/EditProfileModal'
import { AddAchievementModal } from './modals/AddAchievementModal'
import { AddTournamentModal, RegisterTournamentModal } from './modals/AddTournamentModal'
import { CreateNoteModal } from './modals/CreateNoteModal'
import { EditScheduleModal } from './modals/EditScheduleModal'
import { PendingApprovalsModal } from './modals/PendingApprovalsModal'
import { QrScannerModal } from './modals/QrScannerModal'

import './admin.css'

interface AdminPanelProps {
  onSignOut?: () => void
  userSession?: any
}

export default function AdminPanel({ onSignOut, userSession }: AdminPanelProps) {
  // Navigation State
  const [activeTab, setActiveTab] = useState<MasterTabId>('Dashboard')
  const [activeSubTab, setActiveSubTab] = useState<string | undefined>(undefined)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Master Data State
  const [profile, setProfile] = useState<MasterProfileData>(() => {
    return {
      ...initialMasterProfile,
      name: userSession?.userName || userSession?.masterName || initialMasterProfile.name,
    }
  })
  const [students, setStudents] = useState<MasterStudent[]>(initialMasterStudents)
  const [achievements, setAchievements] = useState<MasterAchievement[]>(initialAchievements)
  const [tournaments, setTournaments] = useState<MasterTournament[]>(initialTournaments)
  const [notes, setNotes] = useState<MasterNote[]>(initialNotes)
  const [schedule, setSchedule] = useState<MasterScheduleItem[]>(initialSchedule)
  const [activities, setActivities] = useState<MasterActivityItem[]>(initialActivities)
  const [registrations, setRegistrations] = useState(() => komsStore.getRegistrations())

  // Toast Notification
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  // Subscribe to komsStore
  useEffect(() => {
    return komsStore.subscribe(() => {
      setRegistrations(komsStore.getRegistrations())
    })
  }, [])

  // Modals state
  const [selectedStudentForView, setSelectedStudentForView] = useState<MasterStudent | null>(null)
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [addAchievementOpen, setAddAchievementOpen] = useState(false)
  const [addTournamentOpen, setAddTournamentOpen] = useState(false)
  const [registerTournamentModal, setRegisterTournamentModal] = useState<MasterTournament | null>(null)
  const [createNoteOpen, setCreateNoteOpen] = useState(false)
  const [editScheduleOpen, setEditScheduleOpen] = useState(false)
  const [pendingApprovalsOpen, setPendingApprovalsOpen] = useState(false)
  const [qrScannerOpen, setQrScannerOpen] = useState(false)
  const [attendanceSelectedSession, setAttendanceSelectedSession] = useState<string | undefined>(undefined)

  // Extra detail modals
  const [viewAchievementDetail, setViewAchievementDetail] = useState<MasterAchievement | null>(null)
  const [viewTournamentDetail, setViewTournamentDetail] = useState<MasterTournament | null>(null)
  const [viewAttendanceHistoryOpen, setViewAttendanceHistoryOpen] = useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false)
  const [dojoInfoModalOpen, setDojoInfoModalOpen] = useState(false)
  const [helpSupportModalOpen, setHelpSupportModalOpen] = useState(false)

  // Handlers
  function handleMarkFeePaid(studentId: string) {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, feeStatus: 'Paid' } : s))
    )
    const st = students.find((s) => s.id === studentId)
    komsStore.recordPayment(studentId, 'Monthly Dojo Tuition', 1000)
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        title: `Fee paid (${st?.name || 'Student'}) - ₹1,000`,
        timeAgo: 'Just now',
        type: 'fee',
      },
      ...prev,
    ])
    showToast(`Fee marked as PAID for ${st?.name || 'student'}. Voucher generated!`)
  }

  function handleSaveAttendanceRecord(record: {
    date: string
    session: string
    presentIds: string[]
    lateIds: string[]
    absentIds: string[]
  }) {
    record.presentIds.forEach((id) => komsStore.markAttendance(id, 'present', record.session))
    record.lateIds.forEach((id) => komsStore.markAttendance(id, 'late', record.session))
    record.absentIds.forEach((id) => komsStore.markAttendance(id, 'absent', record.session))
    showToast(`Attendance recorded successfully for ${record.date}! (${record.presentIds.length} Present)`)
  }

  function handleApproveRegistration(id: string) {
    komsStore.updateEnquiryStatus(id, 'approved', `Approved by ${profile.name}. Welcome to ${profile.dojoName}!`)
    const regReq = komsStore.getRegistrationRequests().find((r) => r.id === id || r.fullName.toLowerCase() === id.toLowerCase())
    if (regReq) {
      komsStore.approveStudentRegistration(regReq.id, profile.name)
    }
    setRegistrations(komsStore.getRegistrations())
    showToast('Student Application APPROVED! Unique Student ID generated & account activated.')
  }

  function handleRejectRegistration(id: string) {
    komsStore.updateEnquiryStatus(id, 'rejected', 'Application declined.')
    setRegistrations(komsStore.getRegistrations())
    showToast('Application declined.')
  }

  function handleScanToken(rawToken: string) {
    const res = komsStore.scanQrPass(rawToken)
    if (res.success && res.student) {
      showToast(`Pass Verified: ${res.student.name} marked Present!`)
      return {
        success: true,
        message: res.message,
        studentName: res.student.name,
        rank: res.student.rank,
      }
    }
    return {
      success: false,
      message: res.message || 'Student pass not recognized.',
    }
  }

  function handleRegisterStudentForTournament(studentId: string, tourId: string, division: string) {
    const st = students.find((s) => s.id === studentId)
    const tour = tournaments.find((t) => t.id === tourId)
    showToast(`${st?.name} successfully registered for ${tour?.title} (${division})!`)
  }

  const pendingRegistrationsCount = registrations.filter((r) => r.status === 'pending_review').length || 3

  return (
    <div className="master-admin-shell">
      {/* Sidebar Navigation */}
      <MasterSidebar
        activeTab={activeTab}
        activeSubTab={activeSubTab}
        onSelectTab={(tab, subTab) => {
          setActiveTab(tab)
          setActiveSubTab(subTab)
          setSidebarOpen(false)
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSignOut={onSignOut}
        role={userSession?.role}
        assignedDojoName={userSession?.assignedDojos?.[0] ? 'Ranga Nagar Dojo' : undefined}
      />

      {/* Main Container */}
      <div className="master-main">
        {/* Sticky Topbar */}
        <MasterTopbar
          activeTab={activeTab}
          profile={profile}
          onOpenMenu={() => setSidebarOpen(true)}
          onOpenScanner={() => setQrScannerOpen(true)}
          onSelectTab={(tab) => {
            setActiveTab(tab)
            setActiveSubTab(undefined)
          }}
          onSignOut={onSignOut || (() => komsStore.logout())}
          role={userSession?.role}
        />

        {/* Tab Content */}
        <main className="master-content">
          {/* TAB 1: MASTER DASHBOARD (HOME) */}
          {activeTab === 'Dashboard' && (
            <TabDashboard
              profile={profile}
              totalStudents={userSession?.role === 'grandmaster' ? 229 : 48}
              presentCount={userSession?.role === 'grandmaster' ? 204 : 42}
              pendingFeeCount={userSession?.role === 'grandmaster' ? 34 : 12}
              upcomingTournamentCount={userSession?.role === 'grandmaster' ? 3 : 1}
              pendingApprovalsCount={pendingRegistrationsCount}
              activities={activities}
              onNavigate={(tab) => {
                setActiveTab(tab)
                setActiveSubTab(undefined)
              }}
              onOpenApprovals={() => setPendingApprovalsOpen(true)}
            />
          )}

          {/* TAB: DOJOS DIRECTORY & APPROVALS */}
          {activeTab === 'Dojos' && (
            <TabDojos role={userSession?.role} />
          )}

          {/* TAB 2: MY PROFILE */}
          {activeTab === 'Profile' && (
            <TabProfile
              profile={profile}
              onEditProfile={() => setEditProfileOpen(true)}
            />
          )}

          {/* TAB 3: STUDENTS */}
          {activeTab === 'Students' && (
            <TabStudents
              students={students}
              pendingRegistrationsCount={pendingRegistrationsCount}
              onViewStudent={(st) => setSelectedStudentForView(st)}
              onOpenApprovals={() => setPendingApprovalsOpen(true)}
              activeSubTab={activeSubTab}
              onSelectSubTab={(sub) => setActiveSubTab(sub)}
              onAddStudent={(newSt) => setStudents((prev) => [newSt as any, ...prev])}
              onPromoteBelt={(id, rank) => {
                setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, rank } : s)))
              }}
            />
          )}

          {/* TAB 4: ATTENDANCE (PRESERVED SYSTEM) */}
          {activeTab === 'Attendance' && (
            <TabAttendance
              userSession={userSession}
              initialSelectedSessionId={attendanceSelectedSession}
              activeSubTab={activeSubTab}
              onSelectSubTab={(sub) => setActiveSubTab(sub)}
            />
          )}

          {/* TAB 5: FEES */}
          {activeTab === 'Fees' && (
            <TabFees
              students={students}
              onMarkPaid={handleMarkFeePaid}
              activeSubTab={activeSubTab}
              onSelectSubTab={(sub) => setActiveSubTab(sub)}
              onOpenRecordModal={() => {
                const unpaid = students.find((s) => s.feeStatus !== 'Paid')
                if (unpaid) handleMarkFeePaid(unpaid.id)
                else showToast('All registered students are currently paid!')
              }}
              onViewAllHistory={() => showToast('Opening complete offline billing logs...')}
            />
          )}

          {/* TAB: SENIOR DELEGATIONS */}
          {activeTab === 'Seniors' && (
            <TabSeniors userSession={userSession} />
          )}

          {/* TAB: BELT GRADING & DAN PROGRESSION */}
          {activeTab === 'Grading' && (
            <TabBeltGrading role={userSession?.role} userSession={userSession} />
          )}

          {/* TAB 6: ACHIEVEMENTS */}
          {activeTab === 'Achievements' && (
            <TabAchievements
              achievements={achievements}
              recentAchievements={initialRecentAchievements}
              onAddAchievement={() => setAddAchievementOpen(true)}
              onViewAchievement={(ach) => setViewAchievementDetail(ach)}
              onViewAllRecent={() => showToast('Displaying all past graduation certificates.')}
            />
          )}

          {/* TAB 7: TOURNAMENTS */}
          {activeTab === 'Tournaments' && (
            <TabTournaments
              tournaments={tournaments}
              pastTournaments={initialPastTournaments}
              onAddTournament={() => setAddTournamentOpen(true)}
              onRegisterStudent={(tour) => setRegisterTournamentModal(tour)}
              onViewDetails={(tour) => setViewTournamentDetail(tour)}
              onViewAllPast={() => showToast('Opening archived state tournament records.')}
              role={userSession?.role}
              userSession={userSession}
            />
          )}

          {/* TAB 8: NOTES & ANNOUNCEMENTS */}
          {activeTab === 'Notes' && (
            <TabNotes
              notes={notes}
              activeSubTab={activeSubTab}
              onSelectSubTab={(sub) => setActiveSubTab(sub)}
              onCreateNote={() => setCreateNoteOpen(true)}
              onDeleteNote={(id) => {
                setNotes((prev) => prev.filter((n) => n.id !== id))
                showToast('Note deleted.')
              }}
            />
          )}

          {/* TAB 9: CLASS SCHEDULE */}
          {activeTab === 'Schedule' && (
            <TabSchedule
              userSession={userSession}
              activeSubTab={activeSubTab}
              onSelectSubTab={(sub) => setActiveSubTab(sub)}
              onNavigateToAttendance={(sess) => {
                setAttendanceSelectedSession(sess.id)
                setActiveTab('Attendance')
              }}
            />
          )}

          {/* TAB: REPORTS & ANALYTICS */}
          {activeTab === 'Reports' && (
            <TabReports
              activeSubTab={activeSubTab}
              onSelectSubTab={(sub) => setActiveSubTab(sub)}
            />
          )}

          {/* TAB: AUDIT & GOVERNANCE LOGS */}
          {activeTab === 'AuditLogs' && (
            <TabAuditLogs role={userSession?.role} userSession={userSession} />
          )}

          {/* TAB 10: SETTINGS / DOJO MANAGEMENT */}
          {activeTab === 'Settings' && (
            <TabSettings
              activeSubTab={activeSubTab}
              onSelectSubTab={(sub) => setActiveSubTab(sub)}
              onSignOut={onSignOut || (() => komsStore.logout())}
              onOpenPasswordModal={() => setChangePasswordOpen(true)}
              onOpenNotificationsModal={() => setNotificationSettingsOpen(true)}
              onOpenDojoInfoModal={() => setDojoInfoModalOpen(true)}
              onOpenHelpModal={() => setHelpSupportModalOpen(true)}
              onOpenScanner={() => setQrScannerOpen(true)}
            />
          )}
        </main>
      </div>

      {/* ================= MODALS & DIALOGS ================= */}

      {/* Student Profile Details Modal */}
      <StudentDetailModal
        student={selectedStudentForView}
        onClose={() => setSelectedStudentForView(null)}
        onMarkPaid={handleMarkFeePaid}
        onUpdateStudent={(updated) => {
          setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
          setSelectedStudentForView(updated)
          showToast(`Student profile for ${updated.name} updated!`)
        }}
        onDeactivateStudent={(id, reason) => {
          setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, feeStatus: 'Pending' } : s)))
          showToast(`Account for student paused. Reason: ${reason}`)
          setSelectedStudentForView(null)
        }}
        onReactivateStudent={(id) => {
          showToast('Student account reactivated!')
        }}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        profile={profile}
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        onSave={(updated) => {
          setProfile((prev) => ({ ...prev, ...updated }))
          showToast('Sensei profile successfully updated!')
        }}
      />

      {/* Add Achievement Modal */}
      <AddAchievementModal
        students={students}
        isOpen={addAchievementOpen}
        onClose={() => setAddAchievementOpen(false)}
        onAdd={(newAch) => {
          const item: MasterAchievement = {
            ...newAch,
            id: `ach-${Date.now()}`,
          }
          setAchievements((prev) => [item, ...prev])
          setActivities((prev) => [
            {
              id: `act-${Date.now()}`,
              title: `New achievement added (${newAch.studentName} - ${newAch.title})`,
              timeAgo: 'Just now',
              type: 'award',
            },
            ...prev,
          ])
          showToast(`Achievement certificate issued to ${newAch.studentName}!`)
        }}
      />

      {/* Add Tournament Modal */}
      <AddTournamentModal
        isOpen={addTournamentOpen}
        onClose={() => setAddTournamentOpen(false)}
        onAdd={(newTour) => {
          const item: MasterTournament = {
            ...newTour,
            id: `tour-${Date.now()}`,
          }
          setTournaments((prev) => [item, ...prev])
          showToast(`New tournament "${newTour.title}" published!`)
        }}
      />

      {/* Register Student for Tournament Modal */}
      <RegisterTournamentModal
        tournament={registerTournamentModal}
        students={students}
        isOpen={!!registerTournamentModal}
        onClose={() => setRegisterTournamentModal(null)}
        onRegister={handleRegisterStudentForTournament}
      />

      {/* Create Note Modal */}
      <CreateNoteModal
        isOpen={createNoteOpen}
        onClose={() => setCreateNoteOpen(false)}
        onAdd={(newNote) => {
          const item: MasterNote = {
            ...newNote,
            id: `note-${Date.now()}`,
          }
          setNotes((prev) => [item, ...prev])
          showToast('Note published to student board!')
        }}
      />

      {/* Edit Schedule Modal */}
      <EditScheduleModal
        schedule={schedule}
        isOpen={editScheduleOpen}
        onClose={() => setEditScheduleOpen(false)}
        onAddSession={(session) => {
          const item: MasterScheduleItem = {
            ...session,
            id: `sch-${Date.now()}`,
          }
          setSchedule((prev) => [...prev, item])
          showToast(`New class scheduled for ${session.day}!`)
        }}
        onDeleteSession={(id) => {
          setSchedule((prev) => prev.filter((s) => s.id !== id))
          showToast('Schedule session removed.')
        }}
      />

      {/* Pending Approvals Modal */}
      <PendingApprovalsModal
        enquiries={registrations}
        isOpen={pendingApprovalsOpen}
        onClose={() => setPendingApprovalsOpen(false)}
        onApprove={handleApproveRegistration}
        onReject={handleRejectRegistration}
      />

      {/* QR Pass Scanner Modal */}
      <QrScannerModal
        students={students}
        isOpen={qrScannerOpen}
        onClose={() => setQrScannerOpen(false)}
        onScanPass={handleScanToken}
      />

      {/* View Achievement Certificate Detail */}
      {viewAchievementDetail && (
        <div className="master-modal-backdrop" onClick={() => setViewAchievementDetail(null)}>
          <div className="master-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="master-modal-header">
              <h3 className="master-modal-title">Achievement Certificate</h3>
              <button className="master-modal-close" onClick={() => setViewAchievementDetail(null)}>
                ✕
              </button>
            </div>
            <div className="master-modal-body" style={{ textAlign: 'center', padding: '28px 20px' }}>
              <div style={{ fontSize: '42px', marginBottom: '8px' }}>
                {viewAchievementDetail.iconType === 'belt' ? '🥋' : '🏆'}
              </div>
              <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                {viewAchievementDetail.title}
              </h4>
              <p style={{ color: '#475569', fontSize: '14px', margin: 0 }}>
                Awarded to <strong>{viewAchievementDetail.studentName}</strong>
              </p>
              <div style={{ marginTop: '14px', padding: '10px', background: '#f8fafc', borderRadius: '8px', fontSize: '12px', color: '#64748b' }}>
                Date Issued: {viewAchievementDetail.date} · Certified by Sensei Kumar
              </div>
            </div>
            <div className="master-modal-footer">
              <button className="master-btn-primary" onClick={() => setViewAchievementDetail(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Tournament Details Modal */}
      {viewTournamentDetail && (
        <div className="master-modal-backdrop" onClick={() => setViewTournamentDetail(null)}>
          <div className="master-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="master-modal-header">
              <h3 className="master-modal-title">Tournament Overview</h3>
              <button className="master-modal-close" onClick={() => setViewTournamentDetail(null)}>
                ✕
              </button>
            </div>
            <div className="master-modal-body">
              <img
                src={viewTournamentDetail.image}
                alt={viewTournamentDetail.title}
                style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '12px', marginBottom: '14px' }}
              />
              <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
                {viewTournamentDetail.title}
              </h4>
              <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 12px' }}>
                Official Okinawa Shorin Ryu State Karate Championship sanctioned by Kobudo Renmei Bukenkan India.
              </p>
              <div style={{ display: 'grid', gap: '8px', fontSize: '12px', background: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
                <div><strong>Dates:</strong> {viewTournamentDetail.date}</div>
                <div><strong>Venue:</strong> {viewTournamentDetail.location}</div>
                <div><strong>Divisions:</strong> {viewTournamentDetail.category}</div>
                <div><strong>Registered:</strong> {viewTournamentDetail.participantsCount} competitors</div>
              </div>
            </div>
            <div className="master-modal-footer">
              <button className="master-btn-outline" onClick={() => setViewTournamentDetail(null)}>
                Close
              </button>
              <button
                className="master-btn-primary"
                onClick={() => {
                  const t = viewTournamentDetail
                  setViewTournamentDetail(null)
                  setRegisterTournamentModal(t)
                }}
              >
                Register Students
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Attendance History Modal */}
      {viewAttendanceHistoryOpen && (
        <div className="master-modal-backdrop" onClick={() => setViewAttendanceHistoryOpen(false)}>
          <div className="master-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="master-modal-header">
              <h3 className="master-modal-title">Attendance History Logs</h3>
              <button className="master-modal-close" onClick={() => setViewAttendanceHistoryOpen(false)}>
                ✕
              </button>
            </div>
            <div className="master-modal-body">
              {[
                { date: 'Oct 4, 2026', batch: 'Belt Training', present: 42, late: 1, absent: 5 },
                { date: 'Oct 2, 2026', batch: 'Kihon Drills', present: 44, late: 2, absent: 2 },
                { date: 'Sep 30, 2026', batch: 'Kata Sparring', present: 40, late: 3, absent: 5 },
                { date: 'Sep 28, 2026', batch: 'Conditioning', present: 45, late: 1, absent: 2 },
              ].map((log, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <strong style={{ fontSize: '13px', display: 'block', color: '#0f172a' }}>{log.date}</strong>
                    <small style={{ color: '#64748b' }}>{log.batch}</small>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '11px', fontWeight: 700 }}>
                    <span style={{ color: '#16a34a' }}>{log.present} Present</span>
                    <span style={{ color: '#ca8a04' }}>{log.late} Late</span>
                    <span style={{ color: '#dc2626' }}>{log.absent} Absent</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="master-modal-footer">
              <button className="master-btn-outline" onClick={() => setViewAttendanceHistoryOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {changePasswordOpen && (
        <div className="master-modal-backdrop" onClick={() => setChangePasswordOpen(false)}>
          <div className="master-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="master-modal-header">
              <h3 className="master-modal-title">Change Password</h3>
              <button className="master-modal-close" onClick={() => setChangePasswordOpen(false)}>
                ✕
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setChangePasswordOpen(false)
                showToast('Master password successfully changed!')
              }}
              className="master-modal-form"
            >
              <div className="master-form-field">
                <label>Current Password</label>
                <input type="password" required defaultValue="sensei" />
              </div>
              <div className="master-form-field">
                <label>New Password</label>
                <input type="password" required placeholder="Minimum 6 characters" />
              </div>
              <div className="master-form-field">
                <label>Confirm New Password</label>
                <input type="password" required />
              </div>
              <div className="master-modal-footer">
                <button type="button" className="master-btn-outline" onClick={() => setChangePasswordOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="master-btn-primary">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Settings Modal */}
      {notificationSettingsOpen && (
        <div className="master-modal-backdrop" onClick={() => setNotificationSettingsOpen(false)}>
          <div className="master-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="master-modal-header">
              <h3 className="master-modal-title">Notification Settings</h3>
              <button className="master-modal-close" onClick={() => setNotificationSettingsOpen(false)}>
                ✕
              </button>
            </div>
            <div className="master-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Notify me on new student admission requests</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Send fee due reminders to parents automatically</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Alert me 1 hour before scheduled training batches</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Tournament registration closing reminders</span>
                </label>
              </div>
            </div>
            <div className="master-modal-footer">
              <button
                className="master-btn-primary"
                onClick={() => {
                  setNotificationSettingsOpen(false)
                  showToast('Notification preferences saved!')
                }}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dojo Information Modal */}
      {dojoInfoModalOpen && (
        <div className="master-modal-backdrop" onClick={() => setDojoInfoModalOpen(false)}>
          <div className="master-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="master-modal-header">
              <h3 className="master-modal-title">Dojo Information & Management</h3>
              <button className="master-modal-close" onClick={() => setDojoInfoModalOpen(false)}>
                ✕
              </button>
            </div>
            <div className="master-modal-body">
              <div style={{ display: 'grid', gap: '10px', fontSize: '13px' }}>
                <div>
                  <strong>Branch Dojo:</strong> Ranga Nagar Dojo (Mudichur, Chennai)
                </div>
                <div>
                  <strong>Parent Association:</strong> Kobudo Renmei Bukenkan - India
                </div>
                <div>
                  <strong>Style / Lineage:</strong> Okinawa Shorin Ryu Karate Do & Kobudo
                </div>
                <div>
                  <strong>Head Instructor:</strong> Sensei Kumar (4th Dan)
                </div>
                <div>
                  <strong>Location Address:</strong> 1/38, 2nd Street, Ranga Nagar, Mudichur, Chennai - 600 048
                </div>
                <div>
                  <strong>Direct Helpline:</strong> +91 98765 43210 / +91 96001 03987
                </div>
                <div>
                  <strong>Operating Days:</strong> Monday, Wednesday, Friday, Sunday
                </div>
              </div>
            </div>
            <div className="master-modal-footer">
              <button className="master-btn-primary" onClick={() => setDojoInfoModalOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help & Support Modal */}
      {helpSupportModalOpen && (
        <div className="master-modal-backdrop" onClick={() => setHelpSupportModalOpen(false)}>
          <div className="master-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="master-modal-header">
              <h3 className="master-modal-title">KOMS Help & Support</h3>
              <button className="master-modal-close" onClick={() => setHelpSupportModalOpen(false)}>
                ✕
              </button>
            </div>
            <div className="master-modal-body">
              <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 14px' }}>
                For operational assistance, technical support or student record corrections, contact the KOMS central administrator desk.
              </p>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', display: 'grid', gap: '8px', fontSize: '12px' }}>
                <div>📞 Technical Helpline: <strong>+91 96001 03987</strong></div>
                <div>📧 Sensei Support: <strong>support@koms-karate.in</strong></div>
                <div>🥋 Chief Honbu: <strong>New Perungalathur Central Tatami</strong></div>
              </div>
            </div>
            <div className="master-modal-footer">
              <button className="master-btn-primary" onClick={() => setHelpSupportModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="master-toast-bubble">
          <span>✓</span>
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  )
}
