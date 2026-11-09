import React, { useState, useMemo, useEffect } from 'react'
import { komsStore, type UserSession } from '../../services/komsStore'
import type { ScheduleSession, ClassType } from '../../models/koms'
import { CreateMonthlyScheduleModal } from '../modals/CreateMonthlyScheduleModal'
import { SessionDetailModal } from '../modals/SessionDetailModal'

interface TabScheduleProps {
  onNavigateToAttendance?: (session: ScheduleSession) => void
  userSession?: UserSession
  activeSubTab?: string
  onSelectSubTab?: (subTab: string) => void
}

export const TabSchedule: React.FC<TabScheduleProps> = ({
  onNavigateToAttendance,
  userSession,
  activeSubTab = 'dashboard',
  onSelectSubTab,
}) => {
  const [currentSubTab, setCurrentSubTab] = useState<string>(activeSubTab || 'dashboard')

  useEffect(() => {
    if (activeSubTab) {
      setCurrentSubTab(activeSubTab)
      if (activeSubTab === 'add-class') {
        setAddSingleClassModalOpen(true)
      } else if (activeSubTab === 'calendar') {
        setViewMode('calendar')
      } else if (activeSubTab === 'weekly' || activeSubTab === 'history') {
        setViewMode('list')
      }
    }
  }, [activeSubTab])

  function handleSubTabSelect(tab: string) {
    setCurrentSubTab(tab)
    if (onSelectSubTab) onSelectSubTab(tab)
    if (tab === 'add-class') {
      setAddSingleClassModalOpen(true)
    } else if (tab === 'calendar') {
      setViewMode('calendar')
    } else if (tab === 'weekly' || tab === 'history') {
      setViewMode('list')
    }
  }
  const isSenior = userSession?.role === 'senior'
  const defaultDojo = isSenior
    ? userSession?.assignedDojos?.[0] || 'dojo-ranganagar'
    : 'dojo-ranganagar'

  const [selectedDojoId, setSelectedDojoId] = useState(defaultDojo)
  const [selectedYear, setSelectedYear] = useState(2026)
  const [selectedMonth, setSelectedMonth] = useState(10) // October 2026 pre-selected
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')

  // Modals
  const [createScheduleModalOpen, setCreateScheduleModalOpen] = useState(false)
  const [selectedSessionForEdit, setSelectedSessionForEdit] = useState<ScheduleSession | null>(null)
  const [addSingleClassModalOpen, setAddSingleClassModalOpen] = useState(false)
  const [holidayModalOpen, setHolidayModalOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Single class form state
  const [singleDate, setSingleDate] = useState('2026-10-15')
  const [singleStart, setSingleStart] = useState('06:30 PM')
  const [singleEnd, setSingleEnd] = useState('08:00 PM')
  const [singleType, setSingleType] = useState<ClassType>('Special Training')
  const [singleNotes, setSingleNotes] = useState('Special Kata Bunkai & Weapons Intensive')
  const [singleInstructor, setSingleInstructor] = useState('Sensei Ashokan A.')

  // Holiday form state
  const [holDate, setHolDate] = useState('2026-10-31')
  const [holTitle, setHolTitle] = useState('Dojo Festival Holiday')
  const [holDesc, setHolDesc] = useState('Dojo classes suspended for festival celebration')

  // Reactive subscription
  const [, setTick] = useState(0)
  useEffect(() => {
    return komsStore.subscribe(() => {
      setTick((t) => t + 1)
    })
  }, [])

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const dojos = komsStore.getDojos()
  const activeDojo = dojos.find((d) => d.id === selectedDojoId) || dojos[0]

  // Month sessions
  const sessions = useMemo(() => {
    return komsStore.getScheduleSessions({
      dojoId: selectedDojoId,
      year: selectedYear,
      month: selectedMonth,
    })
  }, [selectedDojoId, selectedYear, selectedMonth])

  // KPI counts
  const totalScheduled = sessions.length
  const completedCount = sessions.filter((s) => s.sessionStatus === 'completed').length
  const cancelledCount = sessions.filter((s) => s.sessionStatus === 'cancelled').length
  const holidayCount = sessions.filter((s) => s.sessionStatus === 'holiday').length
  const upcomingCount = sessions.filter((s) => s.sessionStatus === 'scheduled').length

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  // Calendar Grid Data
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()
  const firstDayOfWeek = new Date(selectedYear, selectedMonth - 1, 1).getDay()

  const calendarDays = useMemo(() => {
    const list: Array<{ dayNumber: number; dateStr: string; sessions: ScheduleSession[] }> = []
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const daySessions = sessions.filter((s) => s.classDate === dateStr)
      list.push({
        dayNumber: d,
        dateStr,
        sessions: daySessions,
      })
    }
    return list
  }, [selectedYear, selectedMonth, daysInMonth, sessions])

  // Today session spotlight (e.g. today or next upcoming)
  const todaySession = useMemo(() => {
    const todayStr = '2026-11-02'
    return (
      sessions.find((s) => s.classDate === todayStr) ||
      sessions.find((s) => s.sessionStatus === 'scheduled') ||
      sessions[0]
    )
  }, [sessions])

  function handleCreateMonthlySchedule(params: {
    dojoId: string
    year: number
    month: number
    daysOfWeek: number[]
    startTime: string
    endTime: string
    classType: ClassType
    notes?: string
    instructor?: string
    createdBy: string
  }) {
    const res = komsStore.generateMonthlyClasses(params)
    showToast(`Success! ${res.sessions.length} class sessions generated for ${monthNames[params.month - 1]} ${params.year}.`)
  }

  function handleUpdateSession(id: string, patch: Partial<ScheduleSession>) {
    komsStore.updateScheduleSession(id, patch)
    showToast('Class session updated successfully.')
  }

  function handleDeleteSession(id: string, force = false) {
    const res = komsStore.deleteScheduleSession(id, force)
    if (res.success) {
      showToast(res.message)
    } else {
      showToast(res.message)
    }
  }

  function handleAddSingleClass(e: React.FormEvent) {
    e.preventDefault()
    const newSession = komsStore.addScheduleSession({
      scheduleId: `sched-${selectedDojoId}-${selectedYear}-${selectedMonth}`,
      dojoId: selectedDojoId,
      classDate: singleDate,
      startTime: singleStart,
      endTime: singleEnd,
      classType: singleType,
      sessionStatus: 'scheduled',
      notes: singleNotes,
      instructor: singleInstructor,
      title: `${singleType} (${singleStart} - ${singleEnd})`,
    })
    setAddSingleClassModalOpen(false)
    showToast(`Additional class scheduled on ${singleDate}!`)
  }

  function handleAddHoliday(e: React.FormEvent) {
    e.preventDefault()
    komsStore.addScheduleSession({
      scheduleId: `sched-${selectedDojoId}-${selectedYear}-${selectedMonth}`,
      dojoId: selectedDojoId,
      classDate: holDate,
      startTime: 'All Day',
      endTime: 'All Day',
      classType: 'Regular Training',
      sessionStatus: 'holiday',
      notes: holDesc,
      instructor: 'Dojo Committee',
      title: `🏖 ${holTitle}`,
    })
    setHolidayModalOpen(false)
    showToast(`Dojo Holiday "${holTitle}" posted for ${holDate}. Classes suspended.`)
  }

  return (
    <div className="master-tab-view master-schedule-view">
      {/* Toast */}
      {toastMsg && (
        <div className="master-toast-notification">
          <span>🥋</span> {toastMsg}
        </div>
      )}

      {/* Top Header & Selectors */}
      <div className="master-attendance-header-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="master-pane-title">Class Schedule Management</h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Configure monthly class days, manage individual dates, and track tatami schedules
          </span>
        </div>

        {/* Filters and Selectors */}
        <div className="master-attendance-selectors" style={{ flexWrap: 'wrap' }}>
          {/* Dojo Selector */}
          <div className="master-select-pill">
            <span style={{ fontSize: '14px' }}>🥋</span>
            {isSenior ? (
              <span style={{ fontSize: '13px', fontWeight: 700, padding: '4px 8px', color: '#0f172a' }}>
                {activeDojo.shortName} (Assigned)
              </span>
            ) : (
              <select
                value={selectedDojoId}
                onChange={(e) => setSelectedDojoId(e.target.value)}
                aria-label="Select Dojo"
              >
                {dojos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.shortName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Month Selector */}
          <div className="master-select-pill">
            <span style={{ fontSize: '14px' }}>🗓</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              aria-label="Select Month"
            >
              {monthNames.map((name, i) => (
                <option key={i + 1} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div className="master-select-pill">
            <span style={{ fontSize: '14px' }}>📆</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              aria-label="Select Year"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>

          {/* View Toggle */}
          <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <button
              onClick={() => setViewMode('calendar')}
              style={{
                padding: '6px 12px',
                border: 'none',
                background: viewMode === 'calendar' ? '#b91c1c' : '#ffffff',
                color: viewMode === 'calendar' ? '#ffffff' : '#475569',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              📅 Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '6px 12px',
                border: 'none',
                background: viewMode === 'list' ? '#b91c1c' : '#ffffff',
                color: viewMode === 'list' ? '#ffffff' : '#475569',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              📋 Class List
            </button>
          </div>
        </div>
      </div>

      {/* Submodule Navigation Bar */}
      <div className="master-filter-pill-bar" style={{ overflowX: 'auto', paddingBottom: '4px', marginTop: '12px' }}>
        {[
          { id: 'dashboard', label: 'Schedule Dashboard' },
          { id: 'weekly', label: 'Weekly Schedule' },
          { id: 'calendar', label: 'Monthly Calendar' },
          { id: 'add-class', label: '+ Add New Class' },
          { id: 'history', label: 'Class History' },
        ].map((item) => (
          <button
            key={item.id}
            className={`master-filter-pill ${currentSubTab === item.id ? 'is-active' : ''}`}
            onClick={() => handleSubTabSelect(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* KPI Stats Bar */}
      <div className="master-schedule-stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginTop: '16px' }}>
        <div className="master-card master-schedule-stat-box">
          <span className="master-stat-box-icon">📅</span>
          <div>
            <span className="master-stat-box-label">Total Classes</span>
            <strong className="master-stat-box-val">{totalScheduled}</strong>
          </div>
        </div>

        <div className="master-card master-schedule-stat-box">
          <span className="master-stat-box-icon">✅</span>
          <div>
            <span className="master-stat-box-label">Completed</span>
            <strong className="master-stat-box-val" style={{ color: '#16a34a' }}>
              {completedCount}
            </strong>
          </div>
        </div>

        <div className="master-card master-schedule-stat-box">
          <span className="master-stat-box-icon">⏳</span>
          <div>
            <span className="master-stat-box-label">Upcoming</span>
            <strong className="master-stat-box-val" style={{ color: '#0284c7' }}>
              {upcomingCount}
            </strong>
          </div>
        </div>

        <div className="master-card master-schedule-stat-box">
          <span className="master-stat-box-icon">🚫</span>
          <div>
            <span className="master-stat-box-label">Cancelled</span>
            <strong className="master-stat-box-val" style={{ color: '#dc2626' }}>
              {cancelledCount}
            </strong>
          </div>
        </div>

        <div className="master-card master-schedule-stat-box">
          <span className="master-stat-box-icon">🏖</span>
          <div>
            <span className="master-stat-box-label">Holidays</span>
            <strong className="master-stat-box-val" style={{ color: '#ea580c' }}>
              {holidayCount}
            </strong>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
        <button
          className="master-btn-primary"
          onClick={() => setCreateScheduleModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span>✨</span> + Create Monthly Schedule (Auto-Generate)
        </button>

        <button
          className="master-btn-outline"
          onClick={() => {
            setSingleDate(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-15`)
            setAddSingleClassModalOpen(true)
          }}
          style={{ background: '#ffffff' }}
        >
          ➕ Add Single Class
        </button>

        <button
          className="master-btn-outline"
          onClick={() => {
            setHolDate(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-25`)
            setHolidayModalOpen(true)
          }}
          style={{ background: '#ffffff', color: '#c2410c', borderColor: '#fed7aa' }}
        >
          🏖 Post Dojo Holiday / Closure
        </button>
      </div>

      {/* VIEW 1: MONTHLY CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="master-card" style={{ marginTop: '20px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              🗓 {monthNames[selectedMonth - 1]} {selectedYear} • {activeDojo.name}
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Click any class session to edit timings, reschedule, cancel, or take roll call.
            </span>
          </div>

          {/* Calendar Day Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '8px',
              textAlign: 'center',
              fontWeight: 800,
              fontSize: '12px',
              color: '#475569',
              paddingBottom: '8px',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <div>SUN</div>
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
          </div>

          {/* Calendar Grid Cells */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '8px',
              marginTop: '8px',
            }}
          >
            {/* Offset empty boxes for start of month */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div
                key={`offset-${i}`}
                style={{
                  minHeight: '100px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  opacity: 0.5,
                }}
              />
            ))}

            {/* Days */}
            {calendarDays.map((item) => {
              const isToday = item.dateStr === '2026-11-02'
              return (
                <div
                  key={item.dayNumber}
                  style={{
                    minHeight: '108px',
                    borderRadius: '8px',
                    background: isToday ? '#fff1f2' : '#ffffff',
                    border: isToday ? '2px solid #b91c1c' : '1px solid #e2e8f0',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  {/* Date number */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 800,
                        color: isToday ? '#b91c1c' : '#0f172a',
                      }}
                    >
                      {item.dayNumber}
                    </span>
                    {isToday && (
                      <span
                        style={{
                          fontSize: '9px',
                          fontWeight: 800,
                          padding: '1px 5px',
                          borderRadius: '8px',
                          background: '#b91c1c',
                          color: '#ffffff',
                        }}
                      >
                        TODAY
                      </span>
                    )}
                  </div>

                  {/* Sessions in day */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    {item.sessions.map((sess) => {
                      let bg = '#e0f2fe'
                      let color = '#0369a1'
                      let badge = 'Active'

                      if (sess.sessionStatus === 'completed') {
                        bg = '#dcfce7'
                        color = '#15803d'
                        badge = 'Done'
                      } else if (sess.sessionStatus === 'cancelled') {
                        bg = '#fee2e2'
                        color = '#b91c1c'
                        badge = 'Cancelled'
                      } else if (sess.sessionStatus === 'holiday') {
                        bg = '#ffedd5'
                        color = '#c2410c'
                        badge = 'Holiday'
                      } else if (sess.classType === 'Special Training') {
                        bg = '#ede9fe'
                        color = '#6d28d9'
                        badge = 'Special'
                      } else if (sess.classType === 'Grading Practice') {
                        bg = '#fef3c7'
                        color = '#b45309'
                        badge = 'Grading'
                      }

                      return (
                        <button
                          key={sess.id}
                          type="button"
                          onClick={() => setSelectedSessionForEdit(sess)}
                          style={{
                            textAlign: 'left',
                            padding: '4px 6px',
                            borderRadius: '6px',
                            background: bg,
                            color,
                            border: 'none',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            lineHeight: '1.2',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ textDecoration: sess.sessionStatus === 'cancelled' ? 'line-through' : 'none' }}>
                              {sess.startTime}
                            </span>
                            <span style={{ fontSize: '9px', textTransform: 'uppercase', opacity: 0.8 }}>
                              {badge}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 500,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {sess.title || sess.classType}
                          </span>
                        </button>
                      )
                    })}

                    {item.sessions.length === 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSingleDate(item.dateStr)
                          setAddSingleClassModalOpen(true)
                        }}
                        style={{
                          marginTop: 'auto',
                          background: 'transparent',
                          border: '1px dashed #e2e8f0',
                          borderRadius: '4px',
                          color: '#94a3b8',
                          fontSize: '10px',
                          padding: '3px',
                          cursor: 'pointer',
                        }}
                      >
                        + Add Class
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: CLASS LIST VIEW */}
      {viewMode === 'list' && (
        <div className="master-card master-table-card" style={{ marginTop: '20px' }}>
          <div className="master-card-head-simple" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 className="master-card-title-sm">
              All Scheduled Classes ({sessions.length}) • {monthNames[selectedMonth - 1]} {selectedYear}
            </h3>
          </div>

          <div className="master-table-responsive">
            <table className="master-data-table">
              <thead>
                <tr>
                  <th>Date & Day</th>
                  <th>Timings</th>
                  <th>Class Session</th>
                  <th>Type</th>
                  <th>Instructor</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((sess) => {
                  const dayName = new Date(sess.classDate).toLocaleDateString('en-US', { weekday: 'short' })
                  return (
                    <tr key={sess.id}>
                      <td>
                        <strong>{sess.classDate}</strong> ({dayName})
                      </td>
                      <td>
                        <span className="master-schedule-time-badge">{sess.startTime} - {sess.endTime}</span>
                      </td>
                      <td>
                        <strong>{sess.title || sess.classType}</strong>
                        {sess.notes && (
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{sess.notes}</div>
                        )}
                      </td>
                      <td>
                        <span className="master-schedule-session-tag">{sess.classType}</span>
                      </td>
                      <td>{sess.instructor || 'Sensei'}</td>
                      <td>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background:
                              sess.sessionStatus === 'completed'
                                ? '#dcfce7'
                                : sess.sessionStatus === 'cancelled'
                                ? '#fee2e2'
                                : sess.sessionStatus === 'holiday'
                                ? '#ffedd5'
                                : '#e0f2fe',
                            color:
                              sess.sessionStatus === 'completed'
                                ? '#15803d'
                                : sess.sessionStatus === 'cancelled'
                                ? '#b91c1c'
                                : sess.sessionStatus === 'holiday'
                                ? '#c2410c'
                                : '#0369a1',
                          }}
                        >
                          {sess.sessionStatus.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => setSelectedSessionForEdit(sess)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Edit
                          </button>
                          {onNavigateToAttendance && (
                            <button
                              onClick={() => onNavigateToAttendance(sess)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: 'none',
                                background: '#1d4ed8',
                                color: '#ffffff',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Roll Call
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                      No classes scheduled for this month. Click "+ Create Monthly Schedule" to auto-generate!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Today's Spotlight Session */}
      {todaySession && (
        <div className="master-card master-today-schedule-card" style={{ marginTop: '20px' }}>
          <div className="master-today-schedule-date">
            🥋 Active Spotlight: {todaySession.classDate} • {todaySession.startTime} - {todaySession.endTime}
          </div>
          <div className="master-today-schedule-body">
            <div className="master-today-schedule-icon">🥋</div>
            <div className="master-today-schedule-details">
              <strong className="master-today-schedule-name">
                {todaySession.title || todaySession.classType}
              </strong>
              <span className="master-today-schedule-time">
                Instructor: {todaySession.instructor || 'Sensei'} • {todaySession.notes || 'Dojo Tatami'}
              </span>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              <span
                className="master-status-pill is-paid"
                style={{
                  background: todaySession.sessionStatus === 'completed' ? '#dcfce7' : '#e0f2fe',
                  color: todaySession.sessionStatus === 'completed' ? '#15803d' : '#0369a1',
                }}
              >
                {todaySession.sessionStatus === 'completed' ? 'Completed' : 'Ready for Roll Call'}
              </span>
              {onNavigateToAttendance && (
                <button
                  className="master-btn-primary"
                  onClick={() => onNavigateToAttendance(todaySession)}
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                >
                  Take Attendance Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Create Monthly Schedule Generator */}
      <CreateMonthlyScheduleModal
        isOpen={createScheduleModalOpen}
        onClose={() => setCreateScheduleModalOpen(false)}
        onGenerate={handleCreateMonthlySchedule}
        currentDojoId={selectedDojoId}
        currentYear={selectedYear}
        currentMonth={selectedMonth}
        allowedDojos={isSenior ? userSession?.assignedDojos : undefined}
        userName={userSession?.userName || userSession?.masterName}
      />

      {/* MODAL 2: Session Detail & Customization */}
      <SessionDetailModal
        session={selectedSessionForEdit}
        isOpen={!!selectedSessionForEdit}
        onClose={() => setSelectedSessionForEdit(null)}
        onUpdate={handleUpdateSession}
        onDelete={handleDeleteSession}
        onTakeAttendance={(sess) => {
          setSelectedSessionForEdit(null)
          if (onNavigateToAttendance) onNavigateToAttendance(sess)
        }}
        hasAttendance={selectedSessionForEdit ? komsStore.hasAttendanceForSession(selectedSessionForEdit.id) : false}
        attendanceCount={
          selectedSessionForEdit
            ? komsStore.getStudentAttendance({ sessionId: selectedSessionForEdit.id }).length
            : 0
        }
      />

      {/* MODAL 3: Add Single Class */}
      {addSingleClassModalOpen && (
        <div className="master-modal-backdrop" onClick={() => setAddSingleClassModalOpen(false)}>
          <div className="master-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="master-modal-header">
              <h3 className="master-modal-title">➕ Add Individual Class Session</h3>
              <button className="master-modal-close" onClick={() => setAddSingleClassModalOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleAddSingleClass} className="master-modal-form" style={{ padding: '20px' }}>
              <div className="master-form-field">
                <label>📅 Class Date</label>
                <input
                  type="date"
                  value={singleDate}
                  onChange={(e) => setSingleDate(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="master-form-field">
                  <label>⏰ Start Time</label>
                  <input
                    type="text"
                    value={singleStart}
                    onChange={(e) => setSingleStart(e.target.value)}
                    required
                  />
                </div>
                <div className="master-form-field">
                  <label>⏰ End Time</label>
                  <input
                    type="text"
                    value={singleEnd}
                    onChange={(e) => setSingleEnd(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="master-form-field">
                <label>🏷 Class Type</label>
                <select
                  value={singleType}
                  onChange={(e) => setSingleType(e.target.value as ClassType)}
                >
                  <option value="Regular Training">Regular Training</option>
                  <option value="Special Training">Special Training</option>
                  <option value="Grading Practice">Grading Practice</option>
                  <option value="Tournament Practice">Tournament Practice</option>
                </select>
              </div>

              <div className="master-form-field">
                <label>👤 Instructor</label>
                <input
                  type="text"
                  value={singleInstructor}
                  onChange={(e) => setSingleInstructor(e.target.value)}
                />
              </div>

              <div className="master-form-field">
                <label>📝 Drills / Notes</label>
                <input
                  type="text"
                  value={singleNotes}
                  onChange={(e) => setSingleNotes(e.target.value)}
                />
              </div>

              <div className="master-modal-footer" style={{ marginTop: '20px', padding: 0 }}>
                <button type="button" className="master-btn-outline" onClick={() => setAddSingleClassModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="master-btn-primary">
                  Add Class Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Post Dojo Holiday / Closure */}
      {holidayModalOpen && (
        <div className="master-modal-backdrop" onClick={() => setHolidayModalOpen(false)}>
          <div className="master-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="master-modal-header">
              <h3 className="master-modal-title">🏖 Post Dojo Holiday or Tatami Closure</h3>
              <button className="master-modal-close" onClick={() => setHolidayModalOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleAddHoliday} className="master-modal-form" style={{ padding: '20px' }}>
              <div className="master-form-field">
                <label>📅 Holiday Date</label>
                <input
                  type="date"
                  value={holDate}
                  onChange={(e) => setHolDate(e.target.value)}
                  required
                />
              </div>

              <div className="master-form-field">
                <label>🏷 Holiday Title</label>
                <input
                  type="text"
                  value={holTitle}
                  onChange={(e) => setHolTitle(e.target.value)}
                  placeholder="e.g. Diwali Holiday, Tatami Maintenance"
                  required
                />
              </div>

              <div className="master-form-field">
                <label>📝 Description / Notice to Students</label>
                <textarea
                  value={holDesc}
                  onChange={(e) => setHolDesc(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="master-modal-footer" style={{ marginTop: '20px', padding: 0 }}>
                <button type="button" className="master-btn-outline" onClick={() => setHolidayModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="master-btn-primary" style={{ background: '#c2410c' }}>
                  Post Dojo Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
