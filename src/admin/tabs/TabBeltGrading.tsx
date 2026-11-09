import React, { useState } from 'react'
import { komsStore } from '../../services/komsStore'
import type { GradingEvent, BeltGradingRecord, Student } from '../../models/koms'

interface TabBeltGradingProps {
  role?: string
  userSession?: any
}

const BELT_RANKS = [
  'White Belt',
  'Yellow Belt',
  'Orange Belt',
  'Green Belt',
  'Blue Belt',
  'Purple Belt',
  'Brown Belt',
  'Shodan (1st Dan Black Belt)',
  'Nidan (2nd Dan Black Belt)',
  'Sandan (3rd Dan Black Belt)',
]

export const TabBeltGrading: React.FC<TabBeltGradingProps> = ({ role, userSession }) => {
  const isGrandMaster = role === 'grandmaster' || role === 'admin'
  const currentDojoId = userSession?.assignedDojos?.[0] || 'dojo-ranganagar'

  const [events, setEvents] = useState<GradingEvent[]>(() => komsStore.getGradingEvents())
  const [history, setHistory] = useState<BeltGradingRecord[]>(() => komsStore.getBeltGradingHistory())
  const [students] = useState<Student[]>(() => komsStore.getStudents())

  // Modal states
  const [recordResultOpen, setRecordResultOpen] = useState(false)
  const [createEventOpen, setCreateEventOpen] = useState(false)

  // Record Result Form State
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [targetBelt, setTargetBelt] = useState(BELT_RANKS[1])
  const [examResult, setExamResult] = useState<'PASSED' | 'HONORS' | 'RETEST'>('PASSED')
  const [recommendation, setRecommendation] = useState('')
  const [certNumber, setCertNumber] = useState('')

  // Create Event Form State
  const [eventTitle, setEventTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventVenue, setEventVenue] = useState('')
  const [eventExaminer, setEventExaminer] = useState(userSession?.userName || 'Grand Master Technical Board')

  const [toastMsg, setToastMsg] = useState<string | null>(null)

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  function handleRecordPromotion() {
    if (!selectedStudentId) {
      alert('Please select a student.')
      return
    }
    const student = students.find((s) => s.id === selectedStudentId)
    if (!student) return

    const prevRank = student.rank || 'White Belt'
    const record = komsStore.recordBeltPromotion({
      studentId: student.id,
      studentName: student.name,
      memberId: student.memberId,
      dojoId: student.dojoId || currentDojoId,
      previousBelt: prevRank,
      newBelt: targetBelt,
      gradingDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      examResult,
      masterRecommendation: recommendation || 'Recommended for technical precision in Kata & Kihon drills.',
      approvedBy: userSession?.userName || 'Hanshi Grand Master',
      certificateNumber: certNumber || `CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    })

    showToast(`Belt promotion recorded: ${student.name} promoted to ${targetBelt}!`)
    setHistory(komsStore.getBeltGradingHistory())
    setRecordResultOpen(false)
    setSelectedStudentId('')
    setRecommendation('')
    setCertNumber('')
  }

  function handleCreateEvent() {
    if (!eventTitle || !eventDate || !eventVenue) {
      alert('Please fill out all event details.')
      return
    }

    const newEv = komsStore.createGradingEvent({
      title: eventTitle,
      examDate: eventDate,
      venue: eventVenue,
      examiner: eventExaminer,
      targetRanks: ['Yellow Belt', 'Orange Belt', 'Green Belt', 'Brown Belt', 'Shodan 1st Dan'],
      status: 'UPCOMING',
    })

    showToast(`Grading event published: ${newEv.title}`)
    setEvents(komsStore.getGradingEvents())
    setCreateEventOpen(false)
    setEventTitle('')
    setEventDate('')
    setEventVenue('')
  }

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
            BELT GRADING & PROGRESSION
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0 0' }}>
            Martial Arts Belt Examination & Dan Registry
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
            Permanent Kyu/Dan graduation records. Track examination dates, technical board recommendations, and certified results.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {isGrandMaster && (
            <button
              onClick={() => setCreateEventOpen(true)}
              style={{
                padding: '0.55rem 1.15rem',
                background: '#0f172a',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              + Create Grading Event
            </button>
          )}

          <button
            onClick={() => setRecordResultOpen(true)}
            style={{
              padding: '0.55rem 1.15rem',
              background: '#b91c1c',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(185, 28, 28, 0.2)',
            }}
          >
            + Record Belt Promotion
          </button>
        </div>
      </div>

      {/* Upcoming Examination Events */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.75rem 0' }}>
          Official Examination Events
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {events.map((ev) => (
            <div
              key={ev.id}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '9999px', background: '#dbeafe', color: '#1e40af' }}>
                  {ev.status}
                </span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0.5rem 0 0.25rem 0' }}>
                  {ev.title}
                </h4>
                <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.25rem', margin: '0.5rem 0' }}>
                  <div>📅 <strong>Date:</strong> {ev.examDate}</div>
                  <div>📍 <strong>Venue:</strong> {ev.venue}</div>
                  <div>🥋 <strong>Chief Examiner:</strong> {ev.examiner}</div>
                  <div>🎯 <strong>Ranks Tested:</strong> {ev.targetRanks.join(', ')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Permanent Belt Progression History Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0' }}>
          Permanent Graduation & Promotion Ledger (Never Overwritten)
        </h3>

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b', fontSize: '0.9rem' }}>
            No belt grading results logged yet. Click "+ Record Belt Promotion" to graduate students.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Student Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Member ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Previous Rank</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Promoted Belt</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Exam Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Result</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Approved By</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Certificate #</th>
                </tr>
              </thead>
              <tbody>
                {history.map((rec) => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0f172a' }}>{rec.studentName}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{rec.memberId}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{rec.previousBelt}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ fontWeight: 800, color: '#b91c1c' }}>{rec.newBelt}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{rec.gradingDate}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '9999px', background: '#dcfce7', color: '#166534' }}>
                        {rec.examResult}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{rec.approvedBy}</td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#64748b' }}>{rec.certificateNumber || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Belt Promotion Modal */}
      {recordResultOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              Record Belt Promotion & Issue Certificate
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>
              Select a student, choose their newly confirmed rank, and document the official examination result.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Student:
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="">-- Choose student --</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.memberId}) • Current: {st.rank || 'White Belt'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Promoted New Rank:
                </label>
                <select
                  value={targetBelt}
                  onChange={(e) => setTargetBelt(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                >
                  {BELT_RANKS.map((rank) => (
                    <option key={rank} value={rank}>{rank}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Examination Result:
                </label>
                <select
                  value={examResult}
                  onChange={(e) => setExamResult(e.target.value as any)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="PASSED">PASSED (Standard Promotion)</option>
                  <option value="HONORS">HONORS (Exceptional Precision)</option>
                  <option value="RETEST">RETEST CONDITIONAL</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Master Recommendation Notes:
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Mastered Naihanchi Shodan kata and demonstrated strong kihon focus."
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                onClick={() => setRecordResultOpen(false)}
                style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPromotion}
                style={{ padding: '0.5rem 1.25rem', background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Confirm Belt Promotion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Grading Event Modal */}
      {createEventOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              Publish Grading Announcement
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Event Title:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Winter 2026 Chennai Belt Examination"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Examination Date:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 29 Nov 2026"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Venue:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Central Honbu Dojo, New Perungalathur"
                  value={eventVenue}
                  onChange={(e) => setEventVenue(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                onClick={() => setCreateEventOpen(false)}
                style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                style={{ padding: '0.5rem 1.25rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Publish Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

