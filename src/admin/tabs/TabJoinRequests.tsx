import React, { useState, useEffect, useMemo } from 'react'
import { komsStore, type RegistrationEnquiry } from '../../services/komsStore'

interface TabJoinRequestsProps {
  onNavigateTab?: (tab: any, subTab?: string) => void
}

export const TabJoinRequests: React.FC<TabJoinRequestsProps> = ({ onNavigateTab }) => {
  const masterProfile = komsStore.getMasterProfile()
  const dojoId = masterProfile.dojoId || 'dojo-ranganagar'

  const [requests, setRequests] = useState<RegistrationEnquiry[]>(() => komsStore.getJoinRequests(dojoId))
  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<RegistrationEnquiry | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Approve Modal State
  const [approveModalReq, setApproveModalReq] = useState<RegistrationEnquiry | null>(null)
  const [assignedBelt, setAssignedBelt] = useState('White Belt (Beginner)')
  const [assignedMonthlyFee, setAssignedMonthlyFee] = useState<number>(800)

  // Reject Modal State
  const [rejectModalReq, setRejectModalReq] = useState<RegistrationEnquiry | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    return komsStore.subscribe(() => {
      setRequests(komsStore.getJoinRequests(dojoId))
    })
  }, [dojoId])

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  // Counts
  const pendingCount = useMemo(() => {
    return requests.filter((r) => r.status === 'pending_review' || (r.status as string) === 'Pending').length
  }, [requests])

  const approvedCount = useMemo(() => {
    return requests.filter((r) => r.status === 'approved' || (r.status as string) === 'Approved').length
  }, [requests])

  const rejectedCount = useMemo(() => {
    return requests.filter((r) => r.status === 'rejected' || (r.status as string) === 'Rejected').length
  }, [requests])

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const isPending = r.status === 'pending_review' || (r.status as string) === 'Pending'
      const isApproved = r.status === 'approved' || (r.status as string) === 'Approved'
      const isRejected = r.status === 'rejected' || (r.status as string) === 'Rejected'

      if (filterStatus === 'pending' && !isPending) return false
      if (filterStatus === 'approved' && !isApproved) return false
      if (filterStatus === 'rejected' && !isRejected) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = r.studentName.toLowerCase().includes(q)
        const matchPhone = (r.guardianPhone || '').includes(q)
        const matchEmail = (r.email || '').toLowerCase().includes(q)
        const matchId = r.id.toLowerCase().includes(q)
        return matchName || matchPhone || matchEmail || matchId
      }
      return true
    })
  }, [requests, filterStatus, searchQuery])

  function handleConfirmApprove() {
    if (!approveModalReq) return
    const newStudent = komsStore.approveJoinRequest(approveModalReq.id, {
      monthlyFee: assignedMonthlyFee,
      rank: assignedBelt,
    })

    if (newStudent) {
      showToast(`🥋 Approved! ${approveModalReq.studentName} is now an Active Student (${newStudent.id}) in Student Management.`)
      setApproveModalReq(null)
      setFilterStatus('approved')
    }
  }

  function handleConfirmReject() {
    if (!rejectModalReq) return
    const ok = komsStore.rejectJoinRequest(rejectModalReq.id, rejectReason || 'Dojo capacity full')
    if (ok) {
      showToast(`Request ${rejectModalReq.id} marked as Rejected.`)
      setRejectModalReq(null)
      setRejectReason('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border border-emerald-400 animate-bounce">
          <span className="text-xl">✅</span>
          <p className="font-semibold text-sm">{toastMsg}</p>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-red-950/40 to-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-red-600/30 text-red-400 border border-red-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                Module 6 • Student Admissions
              </span>
              {pendingCount > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  {pendingCount} Pending Review
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  All Caught Up
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white mt-2 tracking-wide flex items-center gap-3">
              <span>Student Join Requests</span>
              <span className="text-xs font-normal text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700">
                Direct from Common UI
              </span>
            </h1>
            <p className="text-zinc-400 text-sm mt-1 max-w-2xl">
              Review admission requests submitted by prospective students and parents through the public <strong>Common UI → Dojos</strong> directory. Approving a student automatically registers them under your dojo with active attendance and fee tracking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab && onNavigateTab('Students')}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold border border-zinc-700 transition flex items-center space-x-1.5"
            >
              <span>👥</span>
              <span>Open Student Management</span>
            </button>
          </div>
        </div>

        {/* Status Tab Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
              filterStatus === 'pending'
                ? 'bg-amber-950/40 border-amber-500/60 text-white shadow-lg shadow-amber-950/50'
                : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block">Pending Requests</span>
              <span className="text-xl font-black text-amber-400 mt-0.5 block">{pendingCount}</span>
            </div>
            <span className="text-xl">⏳</span>
          </button>

          <button
            onClick={() => setFilterStatus('approved')}
            className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
              filterStatus === 'approved'
                ? 'bg-emerald-950/40 border-emerald-500/60 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block">Approved & Admitted</span>
              <span className="text-xl font-black text-emerald-400 mt-0.5 block">{approvedCount}</span>
            </div>
            <span className="text-xl">✅</span>
          </button>

          <button
            onClick={() => setFilterStatus('rejected')}
            className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
              filterStatus === 'rejected'
                ? 'bg-rose-950/40 border-rose-500/60 text-white shadow-lg shadow-rose-950/50'
                : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block">Rejected / Ineligible</span>
              <span className="text-xl font-black text-rose-400 mt-0.5 block">{rejectedCount}</span>
            </div>
            <span className="text-xl">❌</span>
          </button>

          <button
            onClick={() => setFilterStatus('all')}
            className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
              filterStatus === 'all'
                ? 'bg-red-950/40 border-red-500/60 text-white shadow-lg shadow-red-950/50'
                : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block">All Submissions</span>
              <span className="text-xl font-black text-white mt-0.5 block">{requests.length}</span>
            </div>
            <span className="text-xl">📋</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="relative w-full sm:w-80">
          <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, phone, or ID..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-white text-xs focus:border-red-500 focus:outline-none"
          />
        </div>

        <div className="text-xs text-zinc-400 flex items-center space-x-2">
          <span>Showing <strong className="text-white">{filteredRequests.length}</strong> application(s)</span>
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-12 text-center">
          <span className="text-4xl block mb-2">📭</span>
          <h3 className="text-white font-bold text-base">No join requests found</h3>
          <p className="text-zinc-500 text-xs mt-1">
            {filterStatus === 'pending'
              ? 'There are currently no new student applications waiting for review.'
              : `No applications matching filter "${filterStatus}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.map((req) => {
            const isPending = req.status === 'pending_review' || (req.status as string) === 'Pending'
            const isApproved = req.status === 'approved' || (req.status as string) === 'Approved'
            const isRejected = req.status === 'rejected' || (req.status as string) === 'Rejected'

            return (
              <div
                key={req.id}
                className={`bg-zinc-900/90 border rounded-2xl p-5 shadow-lg transition hover:border-zinc-700 ${
                  isPending
                    ? 'border-amber-900/40 bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/10'
                    : isApproved
                    ? 'border-emerald-900/40'
                    : 'border-zinc-800 opacity-75'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Student Details Left */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-zinc-800 flex items-center justify-center text-white font-black text-base shadow flex-shrink-0">
                      {req.studentName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2.5 flex-wrap">
                        <h3 className="text-base font-bold text-white">{req.studentName}</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 font-mono">
                          {req.id}
                        </span>
                        {isPending && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Pending Review
                          </span>
                        )}
                        {isApproved && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ✓ Approved & Admitted
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            ✕ Rejected
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs text-zinc-400 mt-2">
                        <div>
                          <span className="text-zinc-500">Gender / Age:</span>{' '}
                          <strong className="text-zinc-200">{req.gender || 'Not specified'} • {req.age || '—'}</strong>
                        </div>
                        <div>
                          <span className="text-zinc-500">Guardian:</span>{' '}
                          <strong className="text-zinc-200">{req.fatherName || req.motherName || 'Parent / Guardian'}</strong>
                        </div>
                        <div>
                          <span className="text-zinc-500">Phone:</span>{' '}
                          <strong className="text-zinc-200">{req.guardianPhone}</strong>
                        </div>
                        <div>
                          <span className="text-zinc-500">Training Batch:</span>{' '}
                          <strong className="text-zinc-200">{req.trainingCategory}</strong>
                        </div>
                        <div>
                          <span className="text-zinc-500">Prior Experience:</span>{' '}
                          <strong className="text-zinc-200">{req.priorExperience || 'Beginner'}</strong>
                        </div>
                        <div>
                          <span className="text-zinc-500">Submitted:</span>{' '}
                          <strong className="text-zinc-200">{req.submittedAt}</strong>
                        </div>
                      </div>

                      {req.reviewerNotes && (
                        <div className="mt-2.5 p-2 rounded-lg bg-zinc-950/70 border border-zinc-800 text-[11px] text-zinc-300">
                          <span className="text-zinc-500 font-bold">Reviewer Note:</span> {req.reviewerNotes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-2 lg:flex-col lg:items-end flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedRequest(req)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold border border-zinc-700 transition"
                    >
                      View Details
                    </button>

                    {isPending && (
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setRejectModalReq(req)}
                          className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl text-xs font-bold border border-rose-800/40 transition"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setApproveModalReq(req)
                            setAssignedBelt('White Belt (Beginner)')
                            setAssignedMonthlyFee(800)
                          }}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/40 transition"
                        >
                          ✓ Approve Student
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {approveModalReq && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Admission Approval</span>
                <h3 className="text-lg font-bold text-white mt-0.5">Admit {approveModalReq.studentName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setApproveModalReq(null)}
                className="text-zinc-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300">
              Approving this request will automatically generate a new student membership in <strong>Student Management</strong>, initialize attendance tracking, and set up the student fee record.
            </p>

            <div className="space-y-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase">Initial Belt / Grade</label>
                <select
                  value={assignedBelt}
                  onChange={(e) => setAssignedBelt(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs focus:border-red-500 focus:outline-none"
                >
                  <option value="White Belt (Beginner)">White Belt (Beginner)</option>
                  <option value="Yellow Belt (8th Kyu)">Yellow Belt (8th Kyu)</option>
                  <option value="Orange Belt (7th Kyu)">Orange Belt (7th Kyu)</option>
                  <option value="Green Belt (6th Kyu)">Green Belt (6th Kyu)</option>
                  <option value="Blue Belt (5th Kyu)">Blue Belt (5th Kyu)</option>
                  <option value="Purple Belt (4th Kyu)">Purple Belt (4th Kyu)</option>
                  <option value="Brown Belt 3rd Kyu">Brown Belt (3rd Kyu)</option>
                  <option value="Black Belt (1st Dan)">Black Belt (1st Dan)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase">Assigned Monthly Fee (₹)</label>
                <input
                  type="number"
                  value={assignedMonthlyFee}
                  onChange={(e) => setAssignedMonthlyFee(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs font-bold focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="text-[11px] text-zinc-400 space-y-0.5">
                <div>Dojo: <strong className="text-white">{approveModalReq.dojoName}</strong></div>
                <div>Contact: <strong className="text-white">{approveModalReq.guardianPhone}</strong></div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setApproveModalReq(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/50"
              >
                Confirm & Admit Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalReq && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Reject Request — {rejectModalReq.studentName}</h3>
              <button onClick={() => setRejectModalReq(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <p className="text-xs text-zinc-300">
              Please state a reason for rejecting this application (e.g. batch full, outside age limits, duplicate submission):
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Junior batch at Ranga Nagar is at maximum capacity for this quarter."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-xs focus:border-red-500 focus:outline-none"
            />
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalReq(null)}
                className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-red-400">{selectedRequest.id}</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedRequest.studentName}</h3>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="text-zinc-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Personal Details</span>
                <div>Age: <strong className="text-zinc-200">{selectedRequest.age}</strong></div>
                <div>Gender: <strong className="text-zinc-200">{selectedRequest.gender}</strong></div>
                <div>DOB: <strong className="text-zinc-200">{selectedRequest.dateOfBirth}</strong></div>
                <div>Blood Group: <strong className="text-zinc-200">{selectedRequest.bloodGroup}</strong></div>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Family & Contact</span>
                <div>Father: <strong className="text-zinc-200">{selectedRequest.fatherName || '—'}</strong></div>
                <div>Mother: <strong className="text-zinc-200">{selectedRequest.motherName || '—'}</strong></div>
                <div>Phone: <strong className="text-zinc-200">{selectedRequest.guardianPhone}</strong></div>
                <div>Email: <strong className="text-zinc-200">{selectedRequest.email}</strong></div>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1 col-span-2">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Residential Address</span>
                <p className="text-zinc-200">{selectedRequest.address}</p>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1 col-span-2">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Training Information</span>
                <div>Target Dojo: <strong className="text-white">{selectedRequest.dojoName}</strong></div>
                <div>Batch: <strong className="text-zinc-200">{selectedRequest.trainingCategory}</strong></div>
                <div>Prior Experience: <strong className="text-zinc-200">{selectedRequest.priorExperience || 'None'}</strong></div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

