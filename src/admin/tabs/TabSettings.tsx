import React, { useState, useEffect } from 'react'
import type { MasterProfileData } from '../masterData'
import { initialMasterProfile } from '../masterData'

export interface TabSettingsProps {
  onSignOut: () => void
  onOpenPasswordModal?: () => void
  onOpenNotificationsModal?: () => void
  onOpenDojoInfoModal?: () => void
  onOpenHelpModal?: () => void
  onOpenScanner?: () => void
  activeSubTab?: string
  onSelectSubTab?: (subTab: string) => void
}

export const TabSettings: React.FC<TabSettingsProps> = ({
  onSignOut,
  onOpenScanner,
  activeSubTab = 'profile',
  onSelectSubTab,
}) => {
  const [currentSubTab, setCurrentSubTab] = useState<string>(activeSubTab || 'profile')

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  // Sync subTab
  useEffect(() => {
    if (activeSubTab) setCurrentSubTab(activeSubTab)
  }, [activeSubTab])

  function handleTabChange(tab: string) {
    setCurrentSubTab(tab)
    if (onSelectSubTab) onSelectSubTab(tab)
  }

  // Profile State
  const [profile, setProfile] = useState<MasterProfileData>(initialMasterProfile)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editName, setEditName] = useState(profile.name)
  const [editPhone, setEditPhone] = useState(profile.phone)
  const [editEmail, setEditEmail] = useState(profile.email)
  const [editExperience, setEditExperience] = useState(profile.experience)
  const [editStyle, setEditStyle] = useState(profile.style)

  // Notification Preferences State
  const [notifyNewRegistration, setNotifyNewRegistration] = useState(true)
  const [notifyFeePayments, setNotifyFeePayments] = useState(true)
  const [notifyAbsenceAlerts, setNotifyAbsenceAlerts] = useState(true)
  const [notifyTournaments, setNotifyTournaments] = useState(true)
  const [whatsappReceipts, setWhatsappReceipts] = useState(true)

  // Fee Preferences State
  const [feeRate, setFeeRate] = useState(1000)
  const [feeDueDay, setFeeDueDay] = useState(10)
  const [feeGraceDays, setFeeGraceDays] = useState(5)
  const [receiptPrefix, setReceiptPrefix] = useState('RCP')

  // Schedule Preferences State
  const [classDurationMins, setClassDurationMins] = useState(90)
  const [checkInWindowMins, setCheckInWindowMins] = useState(15)
  const [lateCutoffMins, setLateCutoffMins] = useState(15)

  // Password State
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Activity History State
  const activityLogs = [
    { id: 1, action: 'Recorded Tuition Payment', detail: 'Received ₹1,000 via UPI for Arun Prasath (KOMS001)', time: '28 Oct 2026, 07:15 PM', category: 'Fee' },
    { id: 2, action: 'Promoted Belt Rank', detail: 'Promoted Karthik S (KOMS002) to Yellow Belt (8th Kyu)', time: '26 Oct 2026, 08:30 PM', category: 'Grading' },
    { id: 3, action: 'Saved Attendance Record', detail: 'Marked 42 Present, 3 Late, 3 Absent for Evening Kihon', time: '26 Oct 2026, 08:05 PM', category: 'Attendance' },
    { id: 4, action: 'Broadcast Announcement', detail: 'Published State Championship Selection Trials notice', time: '24 Oct 2026, 09:00 AM', category: 'Announcement' },
    { id: 5, action: 'Approved Student Registration', detail: 'Approved online request for S. Vignesh (KOMS-STU-015)', time: '22 Oct 2026, 04:45 PM', category: 'Registration' },
  ]

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfile((prev) => ({
      ...prev,
      name: editName,
      phone: editPhone,
      email: editEmail,
      experience: editExperience,
      style: editStyle,
    }))
    setIsEditingProfile(false)
    showToast('Master profile updated successfully!')
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!oldPassword || !newPassword) {
      showToast('Please provide current and new passwords.')
      return
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match!')
      return
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters.')
      return
    }
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
    showToast('Password changed successfully!')
  }

  return (
    <div className="master-tab-view master-settings-view">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold border border-rose-500/50 flex items-center gap-2">
          <span>⚙️</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="master-pane-header">
        <div>
          <h2 className="master-pane-title">Master Settings & Configuration</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dojo authority profile, operational preferences, security & audit trail
          </p>
        </div>

        <button
          onClick={onSignOut}
          className="px-3 py-1.5 text-xs font-bold rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-50 transition"
        >
          Sign Out of Dojo
        </button>
      </div>

      {/* Submodule Navigation Bar */}
      <div className="master-filter-pill-bar" style={{ overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'profile', label: 'My Profile' },
          { id: 'dojo', label: 'Assigned Dojo' },
          { id: 'notifications', label: 'Notifications' },
          { id: 'fees', label: 'Fee Preferences' },
          { id: 'schedule', label: 'Schedule Preferences' },
          { id: 'password', label: 'Change Password' },
          { id: 'history', label: 'Activity History' },
        ].map((item) => (
          <button
            key={item.id}
            className={`master-filter-pill ${currentSubTab === item.id ? 'is-active' : ''}`}
            onClick={() => handleTabChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* SUBMODULE 1: MY PROFILE */}
      {(currentSubTab === 'profile' || !currentSubTab) && (
        <div className="master-card p-6 max-w-2xl mx-auto space-y-6">
          <div className="flex justify-between items-start pb-4 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-rose-600 shadow-sm"
              />
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">{profile.name}</h3>
                <span className="text-xs font-bold text-rose-600 block mt-0.5">4th Dan Black Belt • Master / Sensei</span>
                <span className="text-xs text-slate-500">{profile.dojo}</span>
              </div>
            </div>

            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="px-3 py-1 text-xs font-bold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              {isEditingProfile ? 'Cancel Edit' : '✏️ Edit Profile'}
            </button>
          </div>

          {!isEditingProfile ? (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Contact Phone</span>
                  <strong className="text-slate-800">{profile.phone}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Official Email</span>
                  <strong className="text-slate-800">{profile.email}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Teaching Experience</span>
                  <strong className="text-slate-800">{profile.experience}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Martial Arts Lineage</span>
                  <strong className="text-slate-800">{profile.trainedBy}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 md:col-span-2">
                  <span className="text-slate-400 block mb-0.5">Primary Style & Weapons</span>
                  <strong className="text-slate-800">{profile.style}</strong>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-800 mb-2">Recognitions & Dan Credentials</h5>
                <ul className="space-y-1.5 text-slate-600">
                  {profile.achievements.map((ach, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-rose-600 font-bold">🎖️</span>
                      <span>{ach}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Experience</label>
                  <input
                    type="text"
                    value={editExperience}
                    onChange={(e) => setEditExperience(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Martial Arts Style</label>
                  <input
                    type="text"
                    value={editStyle}
                    onChange={(e) => setEditStyle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                >
                  Save Profile
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* SUBMODULE 2: ASSIGNED DOJO */}
      {currentSubTab === 'dojo' && (
        <div className="master-card p-6 max-w-2xl mx-auto space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
              Affiliation ID: KOMS-DOJO-001
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">Ranga Nagar Dojo – Mudichur Branch</h3>
            <p className="text-xs text-slate-500">Authorized Branch of Okinawa Shorin Ryu Matsumura Seito Karate-Do</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Chief Sensei</span>
              <strong className="text-slate-800">Sensei Rubeshwaren (4th Dan)</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Assistant Instructor</span>
              <strong className="text-slate-800">Sensei Ashokan A. (3rd Dan)</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 md:col-span-2">
              <span className="text-slate-400 block mb-0.5">Dojo Facility Address</span>
              <strong className="text-slate-800">
                No. 18, 2nd Main Road, Ranga Nagar, Mudichur Road, West Tambaram, Chennai – 600048
              </strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Weekly Class Days</span>
              <strong className="text-slate-800">Mon, Wed, Fri (Evening) • Sat (Morning)</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Active Student Count</span>
              <strong className="text-emerald-600">42 Active Karatekas Enrolled</strong>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 leading-relaxed">
            * Dojo records are isolated strictly to this branch. Masters cannot access other dojos' financial or student records.
          </p>
        </div>
      )}

      {/* SUBMODULE 3: NOTIFICATIONS */}
      {currentSubTab === 'notifications' && (
        <div className="master-card p-6 max-w-xl mx-auto space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
            Notification & Communication Settings
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div>
                <strong className="text-slate-800 block">New Student Registration Requests</strong>
                <span className="text-slate-500">Immediate push alert when a parent submits an online application</span>
              </div>
              <input
                type="checkbox"
                checked={notifyNewRegistration}
                onChange={(e) => setNotifyNewRegistration(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div>
                <strong className="text-slate-800 block">Tuition Fee Receipts & Alerts</strong>
                <span className="text-slate-500">Auto-generate and email vouchers upon payment logging</span>
              </div>
              <input
                type="checkbox"
                checked={notifyFeePayments}
                onChange={(e) => setNotifyFeePayments(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div>
                <strong className="text-slate-800 block">WhatsApp Tuition Payment Reminders</strong>
                <span className="text-slate-500">Send WhatsApp reminder to parents on the 8th of each month</span>
              </div>
              <input
                type="checkbox"
                checked={whatsappReceipts}
                onChange={(e) => setWhatsappReceipts(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <div>
                <strong className="text-slate-800 block">Consecutive Absence Alerts</strong>
                <span className="text-slate-500">Notify Sensei when a student misses 3 consecutive training classes</span>
              </div>
              <input
                type="checkbox"
                checked={notifyAbsenceAlerts}
                onChange={(e) => setNotifyAbsenceAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600"
              />
            </label>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              onClick={() => showToast('Notification preferences saved!')}
              className="px-4 py-2 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
            >
              Save Notification Preferences
            </button>
          </div>
        </div>
      )}

      {/* SUBMODULE 4: FEE PREFERENCES */}
      {currentSubTab === 'fees' && (
        <div className="master-card p-6 max-w-xl mx-auto space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
            Fee Billing Preferences
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Standard Monthly Tuition Fee (₹)</label>
              <input
                type="number"
                value={feeRate}
                onChange={(e) => setFeeRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Monthly Due Day (Day of Month)</label>
              <input
                type="number"
                min={1}
                max={28}
                value={feeDueDay}
                onChange={(e) => setFeeDueDay(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Grace Period Days</label>
              <input
                type="number"
                value={feeGraceDays}
                onChange={(e) => setFeeGraceDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Voucher Number Prefix</label>
              <input
                type="text"
                value={receiptPrefix}
                onChange={(e) => setReceiptPrefix(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              onClick={() => showToast('Fee billing preferences updated!')}
              className="px-4 py-2 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* SUBMODULE 5: SCHEDULE PREFERENCES */}
      {currentSubTab === 'schedule' && (
        <div className="master-card p-6 max-w-xl mx-auto space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
            Training Session & Timetable Preferences
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Default Training Class Duration (Minutes)</label>
              <input
                type="number"
                value={classDurationMins}
                onChange={(e) => setClassDurationMins(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">QR Pass Check-In Early Window (Minutes)</label>
              <input
                type="number"
                value={checkInWindowMins}
                onChange={(e) => setCheckInWindowMins(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Late Cutoff Threshold (Minutes)</label>
              <input
                type="number"
                value={lateCutoffMins}
                onChange={(e) => setLateCutoffMins(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
              <span className="text-[11px] text-slate-400">Students checking in after this are marked "LATE"</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              onClick={() => showToast('Schedule preferences updated!')}
              className="px-4 py-2 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
            >
              Save Schedule Settings
            </button>
          </div>
        </div>
      )}

      {/* SUBMODULE 6: CHANGE PASSWORD */}
      {currentSubTab === 'password' && (
        <div className="master-card p-6 max-w-md mx-auto space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
            Change Master Access Password
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Current Password *</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">New Password *</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Confirm New Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUBMODULE 7: ACTIVITY HISTORY */}
      {currentSubTab === 'history' && (
        <div className="master-card master-table-card">
          <div className="master-card-head-simple">
            <h3 className="master-card-title-sm">Master Operational Audit Trail</h3>
          </div>
          <div className="master-table-responsive">
            <table className="master-data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>Module</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.map((log) => (
                  <tr key={log.id}>
                    <td><span className="text-xs text-slate-500">{log.time}</span></td>
                    <td><strong>{log.action}</strong></td>
                    <td><span className="text-xs text-slate-700">{log.detail}</span></td>
                    <td>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {log.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
