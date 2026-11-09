import React, { useState, useMemo, useEffect } from 'react'
import type { MasterStudent } from '../masterData'
import { komsStore } from '../../services/komsStore'

export interface TabStudentsProps {
  students: MasterStudent[]
  pendingRegistrationsCount: number
  onViewStudent: (student: MasterStudent) => void
  onOpenApprovals: () => void
  activeSubTab?: string
  onSelectSubTab?: (subTab: string) => void
  onAddStudent?: (student: Partial<MasterStudent>) => void
  onPromoteBelt?: (studentId: string, newRank: string) => void
}

export const TabStudents: React.FC<TabStudentsProps> = ({
  students,
  pendingRegistrationsCount,
  onViewStudent,
  onOpenApprovals,
  activeSubTab = 'all',
  onSelectSubTab,
  onAddStudent,
  onPromoteBelt,
}) => {
  const [currentSubTab, setCurrentSubTab] = useState<string>(activeSubTab || 'all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all')
  const [selectedBeltFilter, setSelectedBeltFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Sync subTab
  useEffect(() => {
    if (activeSubTab) setCurrentSubTab(activeSubTab)
  }, [activeSubTab])

  function handleTabChange(tab: string) {
    setCurrentSubTab(tab)
    if (onSelectSubTab) onSelectSubTab(tab)
  }

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  // Add Student Form State
  const [addMethod, setAddMethod] = useState<'master' | 'request'>('master')
  const [newName, setNewName] = useState('')
  const [newCode, setNewCode] = useState('KOMS-STU-016')
  const [newDob, setNewDob] = useState('2014-06-15')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newGuardian, setNewGuardian] = useState('')
  const [newGuardianPhone, setNewGuardianPhone] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const [newJoiningDate, setNewJoiningDate] = useState(new Date().toISOString().split('T')[0])
  const [newBelt, setNewBelt] = useState('White Belt (Beginner)')
  const [newMonthlyFee, setNewMonthlyFee] = useState(1000)

  // Belt Promotion Modal State
  const [promoteModalStudent, setPromoteModalStudent] = useState<MasterStudent | null>(null)
  const [promoteNewBelt, setPromoteNewBelt] = useState('Yellow Belt')
  const [promoteExamDate, setPromoteExamDate] = useState(new Date().toISOString().split('T')[0])
  const [promoteRemarks, setPromoteRemarks] = useState('Passed 8th Kyu examination with high marks')

  // Inactive / Paused Students State
  const [inactiveStudentsList, setInactiveStudentsList] = useState<Array<MasterStudent & { pauseReason?: string; pauseDate?: string }>>([
    {
      id: 'KOMS043',
      name: 'Ravi Kumar',
      memberId: 'KOMS043',
      rank: 'Yellow Belt',
      beltColor: '#FACC15',
      attendancePct: 75,
      feeStatus: 'Pending',
      feeAmount: 1000,
      feeDueOn: '01-10-2026',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      pauseReason: '10th Standard Board Exams preparation',
      pauseDate: '15-09-2026',
    },
    {
      id: 'KOMS044',
      name: 'Deepak V',
      memberId: 'KOMS044',
      rank: 'Orange Belt',
      beltColor: '#FB923C',
      attendancePct: 82,
      feeStatus: 'Paid',
      feeAmount: 1000,
      feeDueOn: '01-10-2026',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      pauseReason: 'Family relocation to Coimbatore for 3 months',
      pauseDate: '01-10-2026',
    },
  ])

  // Registration Requests from komsStore
  const [regRequests, setRegRequests] = useState(() => komsStore.getRegistrationRequests())
  useEffect(() => {
    return komsStore.subscribe(() => {
      setRegRequests(komsStore.getRegistrationRequests())
    })
  }, [])

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.memberId.toLowerCase().includes(q) ||
        s.rank.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q))

      const matchFilter =
        selectedFilter === 'all' ||
        (selectedFilter === 'paid' && s.feeStatus === 'Paid') ||
        (selectedFilter === 'pending' && s.feeStatus === 'Pending') ||
        (selectedFilter === 'overdue' && s.feeStatus === 'Overdue')

      const matchBelt =
        selectedBeltFilter === 'all' ||
        s.rank.toLowerCase().includes(selectedBeltFilter.toLowerCase())

      return matchSearch && matchFilter && matchBelt
    })
  }, [students, searchQuery, selectedFilter, selectedBeltFilter])

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredStudents.slice(start, start + pageSize)
  }, [filteredStudents, currentPage])

  // Belt grouping for Belt Management
  const beltTiers = [
    { rank: 'White Belt', color: '#FFFFFF', kyu: '10th & 9th Kyu', count: 12 },
    { rank: 'Yellow Belt', color: '#FACC15', kyu: '8th Kyu', count: 10 },
    { rank: 'Orange Belt', color: '#FB923C', kyu: '7th Kyu', count: 8 },
    { rank: 'Green Belt', color: '#16A34A', kyu: '6th & 5th Kyu', count: 9 },
    { rank: 'Blue Belt', color: '#2563EB', kyu: '4th Kyu', count: 4 },
    { rank: 'Purple Belt', color: '#9333EA', kyu: '3rd Kyu', count: 3 },
    { rank: 'Brown Belt', color: '#78350F', kyu: '2nd & 1st Kyu', count: 1 },
    { rank: 'Black Belt (Dan)', color: '#0F172A', kyu: 'Shodan (1st Dan)', count: 1 },
  ]

  // Submit Master Created Student
  function handleCreateStudentSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) {
      showToast('Please enter student full name.')
      return
    }

    const created: Partial<MasterStudent> = {
      id: newCode,
      name: newName.trim(),
      memberId: newCode,
      rank: newBelt,
      feeStatus: 'Pending',
      feeAmount: Number(newMonthlyFee),
      feeDueOn: '10th of every month',
      dob: newDob,
      phone: newPhone || '+91 98402 11223',
      guardian: newGuardian ? `${newGuardian} (${newGuardianPhone})` : 'Parent',
      address: newAddress || 'Ranga Nagar, Chennai',
      avatar: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=300',
    }

    if (onAddStudent) {
      onAddStudent(created)
    }

    // Try backend call
    try {
      fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name: newName.trim(),
          student_code: newCode,
          joining_date: newJoiningDate,
          status: 'active',
          rank: newBelt,
          monthly_fee: newMonthlyFee,
        }),
      }).catch(() => {})
    } catch (_) {}

    showToast(`Student ${newName} successfully enrolled with code ${newCode}!`)
    setNewName('')
    setNewPhone('')
    setNewGuardian('')
    setNewAddress('')
    handleTabChange('all')
  }

  // Handle Approve Request
  function handleApproveReq(req: any) {
    komsStore.approveStudentRegistration(req.id, 'Sensei Rubeshwaren')
    setRegRequests(komsStore.getRegistrationRequests())
    showToast(`Registration approved for ${req.fullName || req.name}! Student enrolled.`)
  }

  // Handle Reject Request
  function handleRejectReq(req: any) {
    komsStore.rejectStudentRegistration(req.id, 'Dojo capacity full for this time slot')
    setRegRequests(komsStore.getRegistrationRequests())
    showToast(`Registration request rejected for ${req.fullName || req.name}.`)
  }

  // Handle Belt Promotion
  function handleConfirmBeltPromotion() {
    if (!promoteModalStudent) return
    if (onPromoteBelt) {
      onPromoteBelt(promoteModalStudent.id, promoteNewBelt)
    }

    // Backend call
    try {
      fetch(`/api/students/${promoteModalStudent.id}/belt`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rank: promoteNewBelt }),
      }).catch(() => {})
    } catch (_) {}

    showToast(`Belt promoted to ${promoteNewBelt} for ${promoteModalStudent.name}!`)
    setPromoteModalStudent(null)
  }

  // Handle Reactivate Student
  function handleReactivate(studentId: string) {
    setInactiveStudentsList((prev) => prev.filter((s) => s.id !== studentId))
    showToast(`Student account reactivated! Restored to active attendance roster.`)
  }

  return (
    <div className="master-tab-view master-students-view">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold border border-rose-500/50 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span>🥋</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Pane Header */}
      <div className="master-pane-header">
        <div>
          <h2 className="master-pane-title">Student Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dojo roster, registrations, belt progression & profile archives
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTabChange('add')}
            className="master-btn-primary flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Enroll New Student</span>
          </button>
        </div>
      </div>

      {/* Submodule Navigation Bar */}
      <div className="master-filter-pill-bar" style={{ overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'all', label: 'All Students' },
          { id: 'add', label: '+ Add Student' },
          { id: 'requests', label: `Requests (${regRequests.filter((r) => r.status === 'PENDING').length})`, badge: true },
          { id: 'active', label: 'Active Students' },
          { id: 'inactive', label: `Inactive (${inactiveStudentsList.length})` },
          { id: 'history', label: 'Student History' },
          { id: 'belts', label: 'Belt Management' },
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

      {/* SUBMODULE 1: ALL STUDENTS */}
      {(currentSubTab === 'all' || !currentSubTab) && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="master-search-filter-bar">
            <div className="master-search-input-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="master-search-icon">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="master-search-input"
                placeholder="Search by name, ID, phone or belt..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>

            {/* Belt Filter */}
            <div className="master-select-pill" style={{ minWidth: '130px' }}>
              <select
                value={selectedBeltFilter}
                onChange={(e) => {
                  setSelectedBeltFilter(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="all">All Belt Ranks</option>
                <option value="White">White Belts</option>
                <option value="Yellow">Yellow Belts</option>
                <option value="Orange">Orange Belts</option>
                <option value="Green">Green Belts</option>
                <option value="Blue">Blue Belts</option>
                <option value="Purple">Purple Belts</option>
                <option value="Brown">Brown Belts</option>
                <option value="Black">Black Belts</option>
              </select>
            </div>

            {/* Fee Status Filter Toggle */}
            <button
              className="master-btn-filter"
              onClick={() => {
                if (selectedFilter === 'all') setSelectedFilter('pending')
                else if (selectedFilter === 'pending') setSelectedFilter('overdue')
                else if (selectedFilter === 'overdue') setSelectedFilter('paid')
                else setSelectedFilter('all')
                setCurrentPage(1)
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              <span>Fee: {selectedFilter.toUpperCase()}</span>
            </button>
          </div>

          {/* Student Roster Table Card */}
          <div className="master-card master-table-card">
            <div className="master-card-head-simple flex justify-between items-center">
              <h3 className="master-card-title-sm">
                Enrolled Dojo Students ({filteredStudents.length})
              </h3>
              <span className="text-xs text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            <div className="master-table-responsive">
              <table className="master-data-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Belt Rank</th>
                    <th>Fee Status</th>
                    <th>Attendance</th>
                    <th>Account</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((st) => (
                    <tr key={st.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <img
                            src={st.avatar}
                            alt={st.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0"
                            onError={(e) => {
                              ;(e.currentTarget as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                            }}
                          />
                          <div>
                            <strong className="master-student-name block leading-tight">{st.name}</strong>
                            <span className="master-student-id block text-[11px] text-slate-400">{st.memberId}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className="master-rank-badge"
                          style={{
                            display: 'inline-flex',
                            borderColor: st.beltColor === '#FFFFFF' ? '#cbd5e1' : st.beltColor,
                          }}
                        >
                          <span className="master-belt-color-dot" style={{ background: st.beltColor }} />
                          {st.rank}
                        </span>
                      </td>

                      <td>
                        <span className={`master-status-pill is-${st.feeStatus.toLowerCase()}`}>
                          {st.feeStatus}
                        </span>
                      </td>

                      <td>
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full"
                              style={{ width: `${st.attendancePct}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-700">{st.attendancePct}%</span>
                        </div>
                      </td>

                      <td>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => onViewStudent(st)}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => {
                              setPromoteModalStudent(st)
                              setPromoteNewBelt(
                                st.rank.includes('White')
                                  ? 'Yellow Belt'
                                  : st.rank.includes('Yellow')
                                  ? 'Orange Belt'
                                  : st.rank.includes('Orange')
                                  ? 'Green Belt'
                                  : 'Blue Belt'
                              )
                            }}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition"
                          >
                            Promote
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-3 border-t border-slate-100">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 text-xs font-bold rounded-lg border border-slate-300 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 text-xs font-bold rounded-lg border border-slate-300 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBMODULE 2: ADD STUDENT */}
      {currentSubTab === 'add' && (
        <div className="master-card p-6 max-w-3xl mx-auto space-y-6">
          <div className="flex border-b border-slate-200 pb-3 justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">Enroll New Student</h3>
              <p className="text-xs text-slate-500">Create a dojo registration record or process an online submission</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAddMethod('master')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  addMethod === 'master'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Direct Master Entry
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('requests')}
                className="px-3 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Review Requests ({regRequests.filter((r) => r.status === 'PENDING').length})
              </button>
            </div>
          </div>

          <form onSubmit={handleCreateStudentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Generated Student Code *</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={() => setNewCode(`KOMS-STU-${Math.floor(100 + Math.random() * 900)}`)}
                    className="px-2 py-1 text-xs bg-slate-200 rounded-lg hover:bg-slate-300 font-bold"
                    title="Generate New Code"
                  >
                    🔄
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name (Student) *</label>
                <input
                  type="text"
                  placeholder="e.g. S. Vignesh"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Date of Birth *</label>
                <input
                  type="date"
                  value={newDob}
                  onChange={(e) => setNewDob(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Joining Date *</label>
                <input
                  type="date"
                  value={newJoiningDate}
                  onChange={(e) => setNewJoiningDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Contact Phone / WhatsApp *</label>
                <input
                  type="text"
                  placeholder="+91 98402 XXXXX"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="student@gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Guardian / Parent Name *</label>
                <input
                  type="text"
                  placeholder="Father / Mother Name"
                  value={newGuardian}
                  onChange={(e) => setNewGuardian(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Guardian Emergency Phone *</label>
                <input
                  type="text"
                  placeholder="+91 98402 XXXXX"
                  value={newGuardianPhone}
                  onChange={(e) => setNewGuardianPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Full Residential Address *</label>
                <textarea
                  rows={2}
                  placeholder="House number, Street, Area, Pin code..."
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Initial Belt Rank</label>
                <select
                  value={newBelt}
                  onChange={(e) => setNewBelt(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="White Belt (Beginner)">White Belt (Beginner - 10th Kyu)</option>
                  <option value="Yellow Belt">Yellow Belt (8th Kyu)</option>
                  <option value="Orange Belt">Orange Belt (7th Kyu)</option>
                  <option value="Green Belt">Green Belt (6th Kyu)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Monthly Fee (₹)</label>
                <input
                  type="number"
                  value={newMonthlyFee}
                  onChange={(e) => setNewMonthlyFee(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => handleTabChange('all')}
                className="px-4 py-2 text-xs font-bold border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700 shadow-sm"
              >
                Enroll & Save Student
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUBMODULE 3: REGISTRATION REQUESTS */}
      {currentSubTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">
              Pending Online Registration Requests ({regRequests.filter((r) => r.status === 'PENDING').length})
            </h3>
            <button
              onClick={onOpenApprovals}
              className="text-xs text-rose-600 font-bold hover:underline"
            >
              Open Full Approvals Modal →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regRequests.map((req) => (
              <div key={req.id} className="master-card p-4 border border-slate-200 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <strong className="text-sm font-bold text-slate-900 block">{req.fullName}</strong>
                    <span className="text-xs text-slate-500">
                      Age: {req.age} yrs • DOB: {req.dateOfBirth}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      req.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div><strong>Phone:</strong> {req.phone}</div>
                  <div><strong>Guardian:</strong> {req.guardianName} ({req.guardianPhone})</div>
                  <div><strong>Address:</strong> {req.address}</div>
                  <div><strong>Requested Dojo:</strong> {req.requestedDojoId || 'Ranga Nagar Dojo'}</div>
                </div>

                {req.status === 'PENDING' && (
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleApproveReq(req)}
                      className="flex-1 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                    >
                      ✓ Approve & Enroll
                    </button>
                    <button
                      onClick={() => handleRejectReq(req)}
                      className="px-3 py-1.5 text-xs font-bold border border-rose-300 text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBMODULE 4: ACTIVE STUDENTS */}
      {currentSubTab === 'active' && (
        <div className="master-card master-table-card">
          <div className="master-card-head-simple">
            <h3 className="master-card-title-sm">Active Students ({students.length})</h3>
          </div>
          <div className="master-table-responsive">
            <table className="master-data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Belt Rank</th>
                  <th>Monthly Fee</th>
                  <th>Attendance %</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr key={st.id}>
                    <td>
                      <strong>{st.name}</strong>
                      <span className="block text-[11px] text-slate-400">{st.memberId}</span>
                    </td>
                    <td><span className="text-xs">{st.rank}</span></td>
                    <td>₹ {st.feeAmount}</td>
                    <td><strong className="text-emerald-600">{st.attendancePct}%</strong></td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => onViewStudent(st)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBMODULE 5: INACTIVE / PAUSED STUDENTS */}
      {currentSubTab === 'inactive' && (
        <div className="space-y-4">
          <div className="master-card master-table-card">
            <div className="master-card-head-simple">
              <h3 className="master-card-title-sm">Paused / Inactive Students ({inactiveStudentsList.length})</h3>
            </div>
            <div className="master-table-responsive">
              <table className="master-data-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Rank</th>
                    <th>Paused On</th>
                    <th>Reason Given</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inactiveStudentsList.map((st) => (
                    <tr key={st.id}>
                      <td>
                        <strong>{st.name}</strong>
                        <span className="block text-[11px] text-slate-400">{st.memberId}</span>
                      </td>
                      <td><span className="text-xs">{st.rank}</span></td>
                      <td>{st.pauseDate || '15-09-2026'}</td>
                      <td><span className="text-xs text-slate-600">{st.pauseReason}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleReactivate(st.id)}
                          className="px-3 py-1 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                        >
                          Reactivate Account
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBMODULE 6: STUDENT HISTORY */}
      {currentSubTab === 'history' && (
        <div className="master-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Dojo Student Milestones & Progression Timeline</h3>
          <div className="relative pl-6 space-y-6 border-l-2 border-slate-200 ml-3">
            <div className="relative">
              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
              <strong className="text-xs font-bold text-slate-900 block">Karthik S – Promoted to Yellow Belt</strong>
              <span className="text-[11px] text-slate-500">Graduation Exam passed with distinction • 28 Oct 2026</span>
            </div>
            <div className="relative">
              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-rose-500 border-2 border-white" />
              <strong className="text-xs font-bold text-slate-900 block">Divya S – State Championship Gold Medal</strong>
              <span className="text-[11px] text-slate-500">Kata Performance (Girls Under-14) • 18 Oct 2026</span>
            </div>
            <div className="relative">
              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-white" />
              <strong className="text-xs font-bold text-slate-900 block">Arun Prasath – 100% Attendance Award</strong>
              <span className="text-[11px] text-slate-500">Completed 45 consecutive dojo classes without absence • 15 Oct 2026</span>
            </div>
            <div className="relative">
              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-amber-500 border-2 border-white" />
              <strong className="text-xs font-bold text-slate-900 block">New Student Enrolment Batch Completed</strong>
              <span className="text-[11px] text-slate-500">6 new students successfully onboarded to Ranga Nagar Dojo • 01 Oct 2026</span>
            </div>
          </div>
        </div>
      )}

      {/* SUBMODULE 7: BELT MANAGEMENT */}
      {currentSubTab === 'belts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {beltTiers.map((b) => (
              <div key={b.rank} className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-300"
                    style={{ backgroundColor: b.color }}
                  />
                  <strong className="text-xs text-slate-800">{b.rank}</strong>
                </div>
                <span className="text-[11px] text-slate-400 block">{b.kyu}</span>
                <strong className="text-lg font-bold text-slate-900 block mt-1">{b.count} Students</strong>
              </div>
            ))}
          </div>

          <div className="master-card master-table-card">
            <div className="master-card-head-simple flex justify-between items-center">
              <h3 className="master-card-title-sm">Candidates for Next Belt Promotion Exam</h3>
            </div>
            <div className="master-table-responsive">
              <table className="master-data-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Current Rank</th>
                    <th>Target Promotion</th>
                    <th>Attendance</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.slice(0, 5).map((st) => (
                    <tr key={st.id}>
                      <td>
                        <strong>{st.name}</strong>
                        <span className="block text-[11px] text-slate-400">{st.memberId}</span>
                      </td>
                      <td>{st.rank}</td>
                      <td><span className="text-xs font-semibold text-rose-600">Next Grade Eligible</span></td>
                      <td><strong>{st.attendancePct}%</strong></td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            setPromoteModalStudent(st)
                            setPromoteNewBelt(
                              st.rank.includes('White')
                                ? 'Yellow Belt'
                                : st.rank.includes('Yellow')
                                ? 'Orange Belt'
                                : 'Green Belt'
                            )
                          }}
                          className="px-3 py-1 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition"
                        >
                          Promote Belt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* BELT PROMOTION MODAL */}
      {promoteModalStudent && (
        <div className="master-modal-backdrop" onClick={() => setPromoteModalStudent(null)}>
          <div
            className="master-modal-content p-5 max-w-md w-full bg-white rounded-xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              Promote Student Belt Rank
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Promoting <strong>{promoteModalStudent.name}</strong> ({promoteModalStudent.memberId})
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Current Belt Rank</label>
                <input
                  type="text"
                  disabled
                  value={promoteModalStudent.rank}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg font-bold text-slate-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">New Promoted Belt *</label>
                <select
                  value={promoteNewBelt}
                  onChange={(e) => setPromoteNewBelt(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-bold"
                >
                  <option value="Yellow Belt">Yellow Belt (8th Kyu)</option>
                  <option value="Orange Belt">Orange Belt (7th Kyu)</option>
                  <option value="Green Belt">Green Belt (6th Kyu)</option>
                  <option value="Blue Belt">Blue Belt (4th Kyu)</option>
                  <option value="Purple Belt">Purple Belt (3rd Kyu)</option>
                  <option value="Brown Belt">Brown Belt (1st Kyu)</option>
                  <option value="Black Belt (1st Dan)">Black Belt (Shodan / 1st Dan)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Examination / Promotion Date</label>
                <input
                  type="date"
                  value={promoteExamDate}
                  onChange={(e) => setPromoteExamDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Sensei Remarks & Grading Certificate No.</label>
                <input
                  type="text"
                  value={promoteRemarks}
                  onChange={(e) => setPromoteRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 mt-4">
              <button
                onClick={() => setPromoteModalStudent(null)}
                className="px-4 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBeltPromotion}
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
              >
                Confirm Belt Promotion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
