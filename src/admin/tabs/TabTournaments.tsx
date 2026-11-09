import React, { useState } from 'react'
import { komsStore } from '../../services/komsStore'
import type { Tournament, TournamentStudentApplication } from '../../models/koms'

interface TabTournamentsProps {
  tournaments: any[]
  pastTournaments: { id: string; title: string; date: string; location: string }[]
  onAddTournament: () => void
  onRegisterStudent: (tournament: any) => void
  onViewDetails: (tournament: any) => void
  onViewAllPast: () => void
  role?: string
  userSession?: any
}

export const TabTournaments: React.FC<TabTournamentsProps> = ({
  tournaments,
  pastTournaments,
  onAddTournament,
  onRegisterStudent,
  onViewDetails,
  onViewAllPast,
  role,
  userSession,
}) => {
  const isGrandMaster = role === 'grandmaster' || role === 'admin'
  const currentDojoId = userSession?.assignedDojos?.[0] || 'dojo-ranganagar'

  const [subTab, setSubTab] = useState<'Upcoming' | 'Nominations' | 'Past'>('Upcoming')
  const [storeTournaments, setStoreTournaments] = useState<Tournament[]>(() => komsStore.getTournaments())
  const [applications, setApplications] = useState<TournamentStudentApplication[]>(() =>
    komsStore.getTournamentApplications(undefined, isGrandMaster ? undefined : currentDojoId)
  )

  const [toastMsg, setToastMsg] = useState<string | null>(null)
  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  function reloadData() {
    setStoreTournaments(komsStore.getTournaments())
    setApplications(komsStore.getTournamentApplications(undefined, isGrandMaster ? undefined : currentDojoId))
  }

  // Master nominates participant
  function handleMasterNominate(appId: string, status: 'SELECTED' | 'REPLACED' | 'REJECTED') {
    const ok = komsStore.nominateTournamentParticipant(appId, status)
    if (ok) {
      showToast(`Candidate nomination updated to ${status}.`)
      reloadData()
    }
  }

  // Grand Master gives final sanction
  function handleGrandMasterApprove(appId: string, status: 'APPROVED' | 'REJECTED') {
    const ok = komsStore.grandMasterApproveTournamentNomination(appId, status)
    if (ok) {
      showToast(`Grand Master finalized participant sanction: ${status}!`)
      reloadData()
    }
  }

  return (
    <div className="master-tab-view master-tournaments-view animate-fade-in">
      {toastMsg && (
        <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, background: '#10b981', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontWeight: 600 }}>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="master-pane-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', letterSpacing: '0.05em' }}>
            {isGrandMaster ? 'CENTRAL SANCTION BOARD' : 'DOJO TOURNAMENT HUB'}
          </span>
          <h2 className="master-pane-title" style={{ margin: '0.25rem 0 0 0' }}>
            Tournaments & Kobudo Championships
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
            Kata, Kumite & Kobudo weapons events (Nunchaku, Sai, Bo, Tekko). Master nomination followed by Grand Master final approval.
          </p>
        </div>

        {isGrandMaster && (
          <button className="master-btn-primary" onClick={onAddTournament}>
            + Create Championship
          </button>
        )}
      </div>

      {/* Subtabs */}
      <div className="master-filter-pill-bar" style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
        {(['Upcoming', 'Nominations', 'Past'] as const).map((tab) => (
          <button
            key={tab}
            className={`master-filter-pill ${subTab === tab ? 'is-active' : ''}`}
            onClick={() => setSubTab(tab)}
          >
            {tab === 'Nominations' ? `Nominations & Approvals (${applications.length})` : tab}
          </button>
        ))}
      </div>

      {/* TAB 1: UPCOMING TOURNAMENTS */}
      {subTab === 'Upcoming' && (
        <div className="master-tournament-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {storeTournaments.map((tour) => (
            <div key={tour.id} className="master-card master-tournament-card" style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '9999px', background: '#dcfce7', color: '#15803d' }}>
                    {tour.status}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Max: {tour.maxParticipants} slots
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0', lineHeight: 1.3 }}>
                  {tour.name}
                </h3>

                <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '1rem' }}>
                  <div>📅 <strong>Date:</strong> {tour.date}</div>
                  <div>📍 <strong>Venue:</strong> {tour.venue}</div>
                  <div>🥋 <strong>Category:</strong> {tour.category}</div>
                  <div>⏳ <strong>Deadline:</strong> {tour.registrationDeadline}</div>
                  <div>📋 <strong>Events:</strong> {tour.eventTypes?.join(' • ')}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                <button
                  className="master-btn-outline-sm"
                  style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: '8px', cursor: 'pointer' }}
                  onClick={() => onViewDetails(tour as any)}
                >
                  View Rules
                </button>
                <button
                  className="master-btn-primary-sm"
                  style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem', fontWeight: 700, background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  onClick={() => onRegisterStudent(tour as any)}
                >
                  Register Students
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: NOMINATIONS & APPROVALS WORKFLOW */}
      {subTab === 'Nominations' && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Tournament Nominations & Sanction Workflow
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
              {isGrandMaster
                ? 'Grand Master Final Sanction: Review student rosters proposed by Dojo Masters and grant official competition approval.'
                : 'Dojo Master Nomination: Review students who self-registered, select the top contenders, and submit to Grand Master.'}
            </p>
          </div>

          {applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b', fontSize: '0.9rem' }}>
              No student tournament applications currently logged.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Student</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Tournament</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Event Category</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Dojo</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Master Nomination</th>
                    <th style={{ padding: '0.75rem 1rem' }}>GM Approval</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                        {app.studentName} <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>{app.memberId}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>{app.tournamentName}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>{app.eventType || app.category}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{app.dojoId}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '9999px',
                            background: app.masterSelectionStatus === 'SELECTED' ? '#dcfce7' : '#fef3c7',
                            color: app.masterSelectionStatus === 'SELECTED' ? '#15803d' : '#b45309',
                          }}
                        >
                          {app.masterSelectionStatus}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '9999px',
                            background: app.grandMasterApprovalStatus === 'APPROVED' ? '#dcfce7' : app.grandMasterApprovalStatus === 'REJECTED' ? '#fee2e2' : '#f1f5f9',
                            color: app.grandMasterApprovalStatus === 'APPROVED' ? '#15803d' : app.grandMasterApprovalStatus === 'REJECTED' ? '#b91c1c' : '#475569',
                          }}
                        >
                          {app.grandMasterApprovalStatus}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {/* Master actions */}
                          {!isGrandMaster && (
                            <>
                              <button
                                onClick={() => handleMasterNominate(app.id, 'SELECTED')}
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                              >
                                Nominate
                              </button>
                              <button
                                onClick={() => handleMasterNominate(app.id, 'REJECTED')}
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                              >
                                Replace
                              </button>
                            </>
                          )}

                          {/* Grand Master actions */}
                          {isGrandMaster && (
                            <>
                              <button
                                onClick={() => handleGrandMasterApprove(app.id, 'APPROVED')}
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                              >
                                ✓ Sanction
                              </button>
                              <button
                                onClick={() => handleGrandMasterApprove(app.id, 'REJECTED')}
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                              >
                                ✕ Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PAST TOURNAMENTS */}
      {subTab === 'Past' && (
        <div className="master-tournament-list">
          {pastTournaments.map((p) => (
            <div key={p.id} className="master-card master-past-tournament-card" style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '2rem' }}>🏆</div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{p.title}</h4>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                  📅 {p.date} • 📍 {p.location}
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '9999px', background: '#dcfce7', color: '#15803d', display: 'inline-block', marginTop: '0.4rem' }}>
                  ✓ Official Results Certified
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
