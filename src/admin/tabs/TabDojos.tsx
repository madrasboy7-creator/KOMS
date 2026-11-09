import React, { useState } from 'react'
import { komsStore, type RegisteredDojo } from '../../services/komsStore'

interface TabDojosProps {
  role?: string
  onSelectDojoForDetails?: (dojo: RegisteredDojo) => void
}

export const TabDojos: React.FC<TabDojosProps> = ({ role }) => {
  const [dojos, setDojos] = useState<RegisteredDojo[]>(() => komsStore.getRegisteredDojos(true))
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'SUSPENDED'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [reviewModalDojo, setReviewModalDojo] = useState<RegisteredDojo | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [suspendReason, setSuspendReason] = useState('')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  function reloadDojos() {
    setDojos(komsStore.getRegisteredDojos(true))
  }

  const isGrandMaster = role === 'grandmaster' || role === 'admin'

  const totalDojos = dojos.length
  const activeCount = dojos.filter((d) => d.status === 'ACTIVE').length
  const pendingCount = dojos.filter((d) => d.status === 'PENDING').length
  const suspendedCount = dojos.filter((d) => d.status === 'SUSPENDED').length

  const filteredDojos = dojos.filter((d) => {
    if (selectedFilter !== 'ALL' && d.status !== selectedFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = d.name.toLowerCase().includes(q)
      const matchMaster = d.masterName.toLowerCase().includes(q)
      const matchArea = d.area.toLowerCase().includes(q)
      const matchReg = d.registrationId.toLowerCase().includes(q)
      return matchName || matchMaster || matchArea || matchReg
    }
    return true
  })

  function handleApprove(dojoId: string) {
    const ok = komsStore.approveDojo(dojoId)
    if (ok) {
      showToast('Dojo successfully approved and activated in the public directory!')
      reloadDojos()
      setReviewModalDojo(null)
    }
  }

  function handleReject(dojoId: string) {
    if (!rejectReason.trim()) {
      alert('Please specify a rejection reason for the audit log.')
      return
    }
    const ok = komsStore.rejectDojo(dojoId, rejectReason)
    if (ok) {
      showToast('Dojo application rejected and logged.')
      reloadDojos()
      setReviewModalDojo(null)
      setRejectReason('')
    }
  }

  function handleSuspend(dojoId: string) {
    if (!suspendReason.trim()) {
      alert('Please specify the suspension reason for compliance records.')
      return
    }
    const ok = komsStore.suspendDojo(dojoId, suspendReason)
    if (ok) {
      showToast('Dojo has been suspended.')
      reloadDojos()
      setSuspendReason('')
    }
  }

  function handleReactivate(dojoId: string) {
    const ok = komsStore.reactivateDojo(dojoId)
    if (ok) {
      showToast('Dojo reactivated and restored to active directory!')
      reloadDojos()
    }
  }

  return (
    <div className="tab-pane animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {toastMsg && (
        <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, background: '#10b981', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontWeight: 600 }}>
          {toastMsg}
        </div>
      )}

      {/* Header & Stats Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: isGrandMaster ? '#fef2f2' : '#f8fafc', color: isGrandMaster ? '#b91c1c' : '#475569', border: '1px solid #fecaca', letterSpacing: '0.05em' }}>
              {isGrandMaster ? 'GRAND MASTER OVERSIGHT' : 'CHENNAI AFFILIATED DOJOS'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {isGrandMaster ? 'Multi-Dojo Control & Approvals' : 'Chennai Dojo Directory'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
            Manage registered martial arts branches across Chennai, review applications, and enforce organization standards.
          </p>
        </div>

        {/* 4 Metric Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>TOTAL</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{totalDojos}</div>
          </div>
          <div style={{ padding: '0.5rem 1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}>ACTIVE</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>{activeCount}</div>
          </div>
          <div style={{ padding: '0.5rem 1rem', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706' }}>PENDING</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706' }}>{pendingCount}</div>
          </div>
          <div style={{ padding: '0.5rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626' }}>SUSPENDED</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#dc2626' }}>{suspendedCount}</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '10px' }}>
          {(['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedFilter(tab)}
              style={{
                padding: '0.4rem 0.9rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                background: selectedFilter === tab ? '#fff' : 'transparent',
                color: selectedFilter === tab ? '#0f172a' : '#64748b',
                boxShadow: selectedFilter === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {tab === 'PENDING' && pendingCount > 0 ? `PENDING (${pendingCount})` : tab}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search by dojo name, area, or Master..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            fontSize: '0.85rem',
            minWidth: '280px',
            outline: 'none',
          }}
        />
      </div>

      {/* Dojos Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filteredDojos.map((dojo) => {
          const isPending = dojo.status === 'PENDING'
          const isSuspended = dojo.status === 'SUSPENDED'
          const isActive = dojo.status === 'ACTIVE'

          return (
            <div
              key={dojo.id}
              style={{
                background: '#fff',
                border: isPending ? '2px solid #f59e0b' : isSuspended ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                position: 'relative',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', background: '#f8fafc', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                    {dojo.registrationId}
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      background: isPending ? '#fef3c7' : isSuspended ? '#fee2e2' : '#dcfce7',
                      color: isPending ? '#b45309' : isSuspended ? '#b91c1c' : '#15803d',
                    }}
                  >
                    ● {dojo.status}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0', lineHeight: 1.3 }}>
                  {dojo.name}
                </h3>

                <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '1rem' }}>
                  <div><strong>Master:</strong> {dojo.masterName}</div>
                  <div><strong>Area:</strong> {dojo.area}</div>
                  <div><strong>Style:</strong> {dojo.karateStyle}</div>
                  <div><strong>Timings:</strong> {dojo.classTimings}</div>
                  <div><strong>Classes:</strong> {dojo.weeklySchedule?.join(', ') || 'Sat, Sun'}</div>
                  <div><strong>Fee Structure:</strong> Entry: ₹{dojo.entryFee} • Monthly: ₹{dojo.monthlyFee}</div>
                </div>

                {isSuspended && dojo.suspensionReason && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.5rem', fontSize: '0.75rem', color: '#991b1b', marginBottom: '0.75rem' }}>
                    <strong>Suspension Reason:</strong> {dojo.suspensionReason}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {isGrandMaster && isPending && (
                  <>
                    <button
                      onClick={() => handleApprove(dojo.id)}
                      style={{ flex: 1, padding: '0.45rem 0.75rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      ✓ Approve Dojo
                    </button>
                    <button
                      onClick={() => setReviewModalDojo(dojo)}
                      style={{ padding: '0.45rem 0.75rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      ✕ Reject
                    </button>
                  </>
                )}

                {isGrandMaster && isActive && (
                  <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                    <button
                      onClick={() => {
                        const reason = prompt('Enter suspension reason for ' + dojo.name + ':')
                        if (reason) {
                          komsStore.suspendDojo(dojo.id, reason)
                          showToast('Dojo suspended.')
                          reloadDojos()
                        }
                      }}
                      style={{ padding: '0.4rem 0.75rem', background: '#fff', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Suspend Dojo
                    </button>
                    <button
                      onClick={() => alert(`Dojo: ${dojo.name}\nActive Students: ${dojo.studentCount}\nAssigned Seniors: ${dojo.seniorCount}\nAddress: ${dojo.address}\nPhone: ${dojo.masterPhone}`)}
                      style={{ flex: 1, padding: '0.4rem 0.75rem', background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Inspect Profile
                    </button>
                  </div>
                )}

                {isGrandMaster && isSuspended && (
                  <button
                    onClick={() => handleReactivate(dojo.id)}
                    style={{ width: '100%', padding: '0.45rem 0.75rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    ↺ Reactivate Dojo
                  </button>
                )}

                {!isGrandMaster && (
                  <button
                    onClick={() => alert(`Branch: ${dojo.name}\nArea: ${dojo.area}\nHead Sensei: ${dojo.masterName}\nContact: ${dojo.masterPhone}`)}
                    style={{ width: '100%', padding: '0.45rem 0.75rem', background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    View Public Dojo Card
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Reject Reason Modal */}
      {reviewModalDojo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              Reject Dojo Application
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem 0' }}>
              Please provide the official reason for rejecting <strong>{reviewModalDojo.name}</strong>. This explanation will be logged into the permanent audit records.
            </p>
            <textarea
              rows={4}
              placeholder="e.g. Incomplete master certification credentials or overlapping territory..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setReviewModalDojo(null)}
                style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(reviewModalDojo.id)}
                style={{ padding: '0.5rem 1.25rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

