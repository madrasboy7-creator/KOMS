import React, { useState } from 'react'
import type { MasterStudent } from '../masterData'

interface StudentDetailModalProps {
  student: MasterStudent | null
  onClose: () => void
  onMarkPaid: (studentId: string) => void
  onUpdateStudent?: (updated: MasterStudent) => void
  onDeactivateStudent?: (studentId: string, reason: string) => void
  onReactivateStudent?: (studentId: string) => void
}

export type StudentProfileTab =
  | 'personal'
  | 'training'
  | 'fees'
  | 'attendance'
  | 'classes'
  | 'announcements'
  | 'account'

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  onMarkPaid,
  onUpdateStudent,
  onDeactivateStudent,
  onReactivateStudent,
}) => {
  if (!student) return null

  const [activeTab, setActiveTab] = useState<StudentProfileTab>('personal')
  const [isEditing, setIsEditing] = useState(false)
  const [confirmDeactivateOpen, setConfirmDeactivateOpen] = useState(false)
  const [deactivateReason, setDeactivateReason] = useState('Academic exam preparation break')

  // Edit form state
  const [editName, setEditName] = useState(student.name)
  const [editDob, setEditDob] = useState(student.dob || '2014-05-14')
  const [editPhone, setEditPhone] = useState(student.phone || '+91 98402 11223')
  const [editGuardian, setEditGuardian] = useState(student.guardian || 'Parent')
  const [editAddress, setEditAddress] = useState(student.address || 'Chennai, Tamil Nadu')
  const [editFeeAmount, setEditFeeAmount] = useState(student.feeAmount || 1000)
  const [editRank, setEditRank] = useState(student.rank || 'White Belt')

  const beltColorsMap: Record<string, string> = {
    'White Belt': '#FFFFFF',
    'Yellow Belt': '#FACC15',
    'Orange Belt': '#FB923C',
    'Green Belt': '#16A34A',
    'Blue Belt': '#2563EB',
    'Purple Belt': '#9333EA',
    'Brown Belt': '#78350F',
    'Black Belt (1st Dan)': '#0F172A',
    'Black Belt (2nd Dan)': '#0F172A',
  }

  function handleSaveEdit() {
    if (onUpdateStudent) {
      onUpdateStudent({
        ...student,
        name: editName,
        dob: editDob,
        phone: editPhone,
        guardian: editGuardian,
        address: editAddress,
        feeAmount: Number(editFeeAmount),
        rank: editRank,
        beltColor: beltColorsMap[editRank] || student.beltColor,
      })
    }
    setIsEditing(false)
  }

  function handleConfirmDeactivate() {
    if (onDeactivateStudent) {
      onDeactivateStudent(student.id, deactivateReason)
    }
    setConfirmDeactivateOpen(false)
  }

  // Sample Fee History
  const feeHistoryRows = [
    { month: 'October 2026', due: student.feeAmount, paid: student.feeStatus === 'Paid' ? student.feeAmount : 0, date: student.feeStatus === 'Paid' ? '02-10-2026' : '-', receipt: 'RCP-202610-001-4921', method: 'UPI', status: student.feeStatus },
    { month: 'September 2026', due: student.feeAmount, paid: student.feeAmount, date: '04-09-2026', receipt: 'RCP-202609-001-3812', method: 'CASH', status: 'Paid' },
    { month: 'August 2026', due: student.feeAmount, paid: student.feeAmount, date: '02-08-2026', receipt: 'RCP-202608-001-2940', method: 'UPI', status: 'Paid' },
    { month: 'July 2026', due: student.feeAmount, paid: student.feeAmount, date: '05-07-2026', receipt: 'RCP-202607-001-1189', method: 'CASH', status: 'Paid' },
  ]

  // Sample Attendance History (Year -> Month -> Class Date)
  const attendanceHistoryRows = [
    { date: '28-10-2026', day: 'Wednesday', timing: '06:30 PM - 08:00 PM', topic: 'Kata Pinan Nidan & Bunkai', status: 'PRESENT', instructor: 'Sensei Rubeshwaren' },
    { date: '26-10-2026', day: 'Monday', timing: '06:30 PM - 08:00 PM', topic: 'Kihon Ido & Stance Transition', status: 'PRESENT', instructor: 'Sensei Rubeshwaren' },
    { date: '24-10-2026', day: 'Saturday', timing: '06:00 AM - 07:30 AM', topic: 'Kumite Sparring & Footwork', status: 'PRESENT', instructor: 'Sensei Ashokan A.' },
    { date: '21-10-2026', day: 'Wednesday', timing: '06:30 PM - 08:00 PM', topic: 'Bo Staff Basic Strikes (Kobudo)', status: 'LATE', instructor: 'Sensei Rubeshwaren' },
    { date: '19-10-2026', day: 'Monday', timing: '06:30 PM - 08:00 PM', topic: 'Core Conditioning & Self Defense', status: 'ABSENT', instructor: 'Sensei Rubeshwaren' },
    { date: '17-10-2026', day: 'Saturday', timing: '06:00 AM - 07:30 AM', topic: 'Kata Application & Target Drills', status: 'PRESENT', instructor: 'Sensei Ashokan A.' },
  ]

  // Sample Announcements delivered to this student
  const studentAnnouncements = [
    { id: 1, title: 'State Karate Championship Selection Trials', date: '24 Oct 2026', category: 'Tournament', read: true, time: '24 Oct, 08:30 PM' },
    { id: 2, title: 'Upcoming Belt Grading Examination - November 2026', date: '20 Oct 2026', category: 'Grading', read: true, time: '21 Oct, 09:15 AM' },
    { id: 3, title: 'Dojo Holiday for Deepavali Festival', date: '15 Oct 2026', category: 'Holiday', read: true, time: '15 Oct, 11:00 AM' },
  ]

  return (
    <div className="master-modal-backdrop" onClick={onClose}>
      <div
        className="master-modal-content master-student-modal"
        style={{ maxWidth: '860px', width: '95%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="master-modal-header flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm">
              🥋
            </span>
            <div>
              <h3 className="master-modal-title text-base font-bold text-slate-900 leading-tight">
                {student.name}
              </h3>
              <span className="text-xs text-slate-500">
                Member ID: <strong className="text-slate-800">{student.memberId}</strong> • Dojo: <strong>Ranga Nagar</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                student.feeStatus === 'Paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              Fee: {student.feeStatus}
            </span>
            <button className="master-modal-close text-slate-400 hover:text-slate-700 text-lg font-bold" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* 7 Tab Navigation Bar */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 px-4 pt-2 bg-slate-50/50">
          {[
            { id: 'personal', label: '1. Personal Info' },
            { id: 'training', label: '2. Training' },
            { id: 'fees', label: '3. Fee History' },
            { id: 'attendance', label: '4. Attendance' },
            { id: 'classes', label: '5. Class History' },
            { id: 'announcements', label: '6. Announcements' },
            { id: 'account', label: '7. Account Info' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as StudentProfileTab)
                setIsEditing(false)
              }}
              className={`px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-rose-600 text-rose-600 bg-white shadow-xs rounded-t-md'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="master-modal-body p-5 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: PERSONAL INFORMATION */}
          {activeTab === 'personal' && (
            <div>
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="master-modal-hero flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                      onError={(e) => {
                        ;(e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold text-slate-900">{student.name}</h4>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-3 py-1 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition shadow-xs"
                        >
                          ✏️ Edit Details
                        </button>
                      </div>
                      <span className="text-xs text-slate-500">Student Code: {student.memberId}</span>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className="master-rank-badge"
                          style={{
                            display: 'inline-flex',
                            borderColor: student.beltColor === '#FFFFFF' ? '#cbd5e1' : student.beltColor,
                          }}
                        >
                          <span className="master-belt-color-dot" style={{ background: student.beltColor }} />
                          {student.rank}
                        </span>
                        <span className="text-xs text-slate-400">• Age: {student.age || '12 yrs'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="master-modal-section">
                    <h5 className="master-modal-section-title text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                      Personal & Contact Details
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">Date of Birth</span>
                        <strong className="text-slate-800">{student.dob || '14.05.2014'}</strong>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">Blood Group</span>
                        <strong className="text-slate-800">{student.bloodGroup || 'O+ve'}</strong>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">Guardian / Parent</span>
                        <strong className="text-slate-800">{student.guardian || 'P. Prasath (Father)'}</strong>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">Contact Phone</span>
                        <strong className="text-slate-800">{student.phone || '+91 98402 11223'}</strong>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 md:col-span-2">
                        <span className="text-slate-400 block mb-0.5">Residential Address</span>
                        <strong className="text-slate-800">{student.address || 'No. 14, Gandhi Road, Ranga Nagar, Mudichur, Chennai'}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Edit Form */
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
                    Edit Student Profile
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={editDob}
                        onChange={(e) => setEditDob(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Guardian Name & Relation</label>
                      <input
                        type="text"
                        value={editGuardian}
                        onChange={(e) => setEditGuardian(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">Residential Address</label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Belt Rank</label>
                      <select
                        value={editRank}
                        onChange={(e) => setEditRank(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                      >
                        {Object.keys(beltColorsMap).map((rk) => (
                          <option key={rk} value={rk}>{rk}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Monthly Fee (₹)</label>
                      <input
                        type="number"
                        value={editFeeAmount}
                        onChange={(e) => setEditFeeAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-1.5 text-xs font-bold rounded-lg border border-slate-300 text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="px-4 py-1.5 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TRAINING INFORMATION */}
          {activeTab === 'training' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-400 block">Attendance Rate</span>
                  <strong className="text-lg font-bold text-emerald-600">{student.attendancePct}%</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-400 block">Classes Attended</span>
                  <strong className="text-lg font-bold text-slate-800">46 Sessions</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-400 block">Current Rank</span>
                  <strong className="text-xs font-bold text-slate-800 block mt-1">{student.rank}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-400 block">Dojo Master</span>
                  <strong className="text-xs font-bold text-slate-800 block mt-1">Sensei Rubeshwaren</strong>
                </div>
              </div>

              <div className="master-card p-4">
                <h5 className="font-bold text-xs text-slate-800 mb-2">Syllabus & Kata Progression</h5>
                <ul className="text-xs space-y-1.5 text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span> Kihon (Fundamentals): Stances (Zenkutsu, Kokutsu, Kiba Dachi)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span> Kata: Fukyugata Ichi, Fukyugata Ni, Pinan Shodan
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-indigo-600 font-bold">⏳</span> Kata in Training: Pinan Nidan (Targeting next grading)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-slate-400">○</span> Kobudo Weapons: Bo Kihon Strikes
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: FEE HISTORY */}
          {activeTab === 'fees' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs text-slate-500">Applicable Monthly Tuition:</span>
                  <strong className="text-sm font-bold text-slate-900 ml-1">₹ {student.feeAmount.toLocaleString('en-IN')}</strong>
                </div>
                {student.feeStatus !== 'Paid' && (
                  <button
                    onClick={() => {
                      onMarkPaid(student.id)
                    }}
                    className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                  >
                    Mark October Fee Paid
                  </button>
                )}
              </div>

              <div className="master-card master-table-card">
                <div className="master-table-responsive">
                  <table className="master-data-table">
                    <thead>
                      <tr>
                        <th>Billing Month</th>
                        <th>Fee Due</th>
                        <th>Amount Paid</th>
                        <th>Payment Date</th>
                        <th>Receipt No.</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeHistoryRows.map((row) => (
                        <tr key={row.month}>
                          <td><strong>{row.month}</strong></td>
                          <td>₹ {row.due}</td>
                          <td className="text-emerald-600 font-semibold">₹ {row.paid}</td>
                          <td>{row.date}</td>
                          <td>
                            <span className="text-xs font-mono text-slate-500">{row.receipt}</span>
                          </td>
                          <td>
                            <span className={`master-status-pill is-${row.status.toLowerCase()}`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ATTENDANCE HISTORY */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                <span>Month: <strong>October 2026</strong></span>
                <span className="text-emerald-600">Attendance Rate: <strong>{student.attendancePct}%</strong></span>
              </div>

              <div className="master-card master-table-card">
                <div className="master-table-responsive">
                  <table className="master-data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Class Session</th>
                        <th>Training Syllabus Topic</th>
                        <th>Status</th>
                        <th>Sensei</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceHistoryRows.map((att) => (
                        <tr key={att.date}>
                          <td><strong>{att.date}</strong></td>
                          <td><span className="text-xs text-slate-500">{att.timing}</span></td>
                          <td>{att.topic}</td>
                          <td>
                            <span
                              className={`master-status-pill ${
                                att.status === 'PRESENT'
                                  ? 'is-paid'
                                  : att.status === 'LATE'
                                  ? 'is-pending'
                                  : 'is-overdue'
                              }`}
                            >
                              {att.status}
                            </span>
                          </td>
                          <td><small className="text-slate-500">{att.instructor}</small></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CLASS HISTORY */}
          {activeTab === 'classes' && (
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-slate-700">Completed Training Sessions Archive</h5>
              <div className="space-y-2">
                {attendanceHistoryRows.map((cls, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <strong className="text-slate-800 block">{cls.topic}</strong>
                      <span className="text-slate-500">{cls.date} • {cls.timing}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white border border-slate-300 text-slate-700">
                      {cls.instructor}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-slate-700">Announcements Received</h5>
              <div className="space-y-2">
                {studentAnnouncements.map((ann) => (
                  <div key={ann.id} className="p-3 rounded-xl border border-slate-200 bg-white">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {ann.category}
                      </span>
                      <span className="text-slate-400">{ann.date}</span>
                    </div>
                    <strong className="text-xs text-slate-800 block">{ann.title}</strong>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="text-emerald-600 font-semibold">✓ Read on {ann.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: ACCOUNT INFORMATION */}
          {activeTab === 'account' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Account Status</span>
                  <strong className="text-emerald-600">ACTIVE MEMBER</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Joining Date</span>
                  <strong className="text-slate-800">01-06-2025</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Assigned Dojo Branch</span>
                  <strong className="text-slate-800">Ranga Nagar Dojo, Mudichur</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Audit Governance</span>
                  <strong className="text-slate-800">Sensei Rubeshwaren Authorized</strong>
                </div>
              </div>

              {/* Account Controls */}
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40">
                <h5 className="font-bold text-xs text-rose-900 mb-1">Dojo Account Governance</h5>
                <p className="text-[11px] text-slate-600 mb-3">
                  Historical attendance, past fee payments, and belt milestones are preserved permanently for compliance. Deactivating pauses billing and attendance logging without deleting historical records.
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDeactivateOpen(true)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition"
                  >
                    Deactivate Account Temporarily
                  </button>
                  <button
                    onClick={() => {
                      if (onReactivateStudent) onReactivateStudent(student.id)
                    }}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                  >
                    Reactivate Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="master-modal-footer flex justify-end gap-2 p-3 border-t border-slate-200">
          <button className="master-btn-outline text-xs px-4 py-1.5" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Deactivation */}
      {confirmDeactivateOpen && (
        <div className="master-modal-backdrop" style={{ zIndex: 100 }} onClick={() => setConfirmDeactivateOpen(false)}>
          <div
            className="master-modal-content p-5 max-w-md w-full bg-white rounded-xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-sm font-bold text-slate-900 mb-2">
              Confirm Student Deactivation
            </h4>
            <p className="text-xs text-slate-600 mb-3">
              Are you sure you want to pause/deactivate the account of <strong>{student.name}</strong>? Historical attendance and fee records will remain intact.
            </p>

            <label className="text-xs font-bold text-slate-700 block mb-1">Reason for Deactivation</label>
            <input
              type="text"
              value={deactivateReason}
              onChange={(e) => setDeactivateReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs mb-4"
              placeholder="e.g. Academic exams, relocation, medical rest..."
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDeactivateOpen(false)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeactivate}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700"
              >
                Confirm Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
