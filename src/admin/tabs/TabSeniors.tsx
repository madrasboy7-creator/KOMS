import React, { useState } from 'react'
import { komsStore } from '../../services/komsStore'
import type { SeniorAssignment, SeniorPermissionSet, Student } from '../../models/koms'

interface TabSeniorsProps {
  userSession?: any
}

const defaultPermissions: SeniorPermissionSet = {
  canViewStudents: true,
  canMarkAttendance: true,
  canViewAttendanceHistory: false,
  canVerifyStudentDetails: false,
  canViewBeltDetails: true,
  canRecommendGrading: false,
  canUploadPhotos: true,
  canViewClassSchedules: true,
  canViewAnnouncements: true,
}

export const TabSeniors: React.FC<TabSeniorsProps> = ({ userSession }) => {
  const currentDojoId = userSession?.assignedDojos?.[0] || 'dojo-ranganagar'
  const [seniors, setSeniors] = useState<SeniorAssignment[]>(() => komsStore.getSeniors(currentDojoId))
  const [students] = useState<Student[]>(() => komsStore.getStudents().filter((s) => s.dojoId === currentDojoId || !s.dojoId))
  
  // Assign Senior Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [newPermissions, setNewPermissions] = useState<SeniorPermissionSet>(defaultPermissions)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  function reloadSeniors() {
    setSeniors(komsStore.getSeniors(currentDojoId))
  }

  function handleTogglePermission(senior: SeniorAssignment, permKey: keyof SeniorPermissionSet) {
    const updated = {
      ...senior.permissions,
      [permKey]: !senior.permissions[permKey],
    }
    const ok = komsStore.updateSeniorPermissions(senior.id, updated)
    if (ok) {
      showToast(`Updated "${String(permKey)}" for Senior ${senior.studentName}`)
      reloadSeniors()
    }
  }

  function handleRevokeSenior(seniorId: string, name: string) {
    if (confirm(`Are you sure you want to revoke Senior sub-admin privileges for ${name}?`)) {
      komsStore.revokeSenior(seniorId)
      showToast(`Revoked Senior permissions for ${name}.`)
      reloadSeniors()
    }
  }

  function handleCreateAssignment() {
    if (!selectedStudentId) {
      alert('Please select a student to promote to Senior.')
      return
    }
    const student = students.find((s) => s.id === selectedStudentId)
    const res = komsStore.assignSenior(
      currentDojoId,
      selectedStudentId,
      newPermissions,
      userSession?.userName || 'Dojo Master'
    )
    if (res) {
      showToast(`Successfully promoted ${student?.name} to Senior Sub-Administrator!`)
      reloadSeniors()
      setAssignModalOpen(false)
      setSelectedStudentId('')
      setNewPermissions(defaultPermissions)
    }
  }

  const permissionLabels: { key: keyof SeniorPermissionSet; label: string; desc: string }[] = [
    { key: 'canMarkAttendance', label: 'Mark Class Attendance', desc: 'Conduct daily roll call during scheduled training' },
    { key: 'canViewStudents', label: 'View Student Directory', desc: 'Read basic roster and contact records' },
    { key: 'canViewAttendanceHistory', label: 'View Attendance History', desc: 'Review historical student attendance rates' },
    { key: 'canVerifyStudentDetails', label: 'Verify Student Details', desc: 'Check student identity during examinations' },
    { key: 'canViewBeltDetails', label: 'View Belt & Syllabus', desc: 'Inspect current Kyu/Dan ranks and katas' },
    { key: 'canRecommendGrading', label: 'Recommend for Belt Grading', desc: 'Propose candidates to Master for upcoming exams' },
    { key: 'canUploadPhotos', label: 'Upload Training Photos', desc: 'Publish training photos to dojo gallery' },
    { key: 'canViewClassSchedules', label: 'View Class Schedules', desc: 'Access weekly schedule details' },
    { key: 'canViewAnnouncements', label: 'View Dojo Announcements', desc: 'Read internal notices and bulleting' },
  ]

  return (
    <div className="tab-pane animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {toastMsg && (
        <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, background: '#10b981', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontWeight: 600 }}>
          {toastMsg}
        </div>
      )}

      {/* Header Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', letterSpacing: '0.05em' }}>
            SUB-ADMINISTRATOR DELEGATIONS
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
            Senior Instructor & Black-Belt Delegations
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
            Masters maintain full authority over Seniors. Configure granular privileges for attendance, candidate recommendations, and class supervision.
          </p>
        </div>

        <button
          onClick={() => setAssignModalOpen(true)}
          style={{
            padding: '0.6rem 1.25rem',
            background: '#b91c1c',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 2px 6px rgba(185, 28, 28, 0.2)',
          }}
        >
          <span>+</span> Assign Senior
        </button>
      </div>

      {/* Seniors List */}
      {seniors.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #cbd5e1', borderRadius: '16px', padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🥋</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>No Seniors Assigned Yet</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '400px', margin: '0.5rem auto 1.5rem auto' }}>
            Promote an experienced black-belt student to assist with attendance roll calls, session supervision, and belt grading recommendations.
          </p>
          <button
            onClick={() => setAssignModalOpen(true)}
            style={{ padding: '0.5rem 1.25rem', background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Assign First Senior
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {seniors.map((senior) => (
            <div
              key={senior.id}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              {/* Senior Profile Header */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                    🥋
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {senior.studentName}
                      </h3>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '9999px', background: '#0f172a', color: '#f8fafc' }}>
                        SENIOR SUB-ADMIN
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                      ID: <strong>{senior.memberId}</strong> • Assigned on: {senior.assignedDate} by {senior.assignedByMaster}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleRevokeSenior(senior.id, senior.studentName)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      background: '#fff',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Revoke Permissions
                  </button>
                </div>
              </div>

              {/* Permissions Control Matrix */}
              <div style={{ marginTop: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.75rem 0' }}>
                  Configurable Sub-Admin Permissions
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                  {permissionLabels.map(({ key, label, desc }) => {
                    const isEnabled = !!senior.permissions[key]
                    return (
                      <div
                        key={key}
                        onClick={() => handleTogglePermission(senior, key)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem',
                          borderRadius: '10px',
                          border: isEnabled ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                          background: isEnabled ? '#f0fdf4' : '#f8fafc',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ paddingRight: '0.5rem' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isEnabled ? '#166534' : '#475569' }}>
                            {label}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.1rem' }}>
                            {desc}
                          </div>
                        </div>

                        {/* Switch indicator */}
                        <div
                          style={{
                            width: '38px',
                            height: '20px',
                            borderRadius: '9999px',
                            background: isEnabled ? '#16a34a' : '#cbd5e1',
                            position: 'relative',
                            flexShrink: 0,
                            transition: 'background 0.2s',
                          }}
                        >
                          <div
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              background: '#fff',
                              position: 'absolute',
                              top: '2px',
                              left: isEnabled ? '20px' : '2px',
                              transition: 'left 0.2s',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Senior Modal */}
      {assignModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              Assign Senior Sub-Administrator
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>
              Select an advanced student to appoint as Senior for <strong>{currentDojoId}</strong> and configure initial permissions.
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Select Dojo Student:
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
              >
                <option value="">-- Choose a student from roster --</option>
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.memberId}) • {st.rank || 'White Belt'}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                Initial Delegated Permissions:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {permissionLabels.map(({ key, label }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!!newPermissions[key]}
                      onChange={(e) => setNewPermissions((prev) => ({ ...prev, [key]: e.target.checked }))}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setAssignModalOpen(false)}
                style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAssignment}
                style={{ padding: '0.5rem 1.25rem', background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Confirm Promotion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

