import React, { useState } from 'react'
import { komsStore } from '../../services/komsStore'
import type { Student, StudentMonthlyAttendanceSummary } from '../../models/koms'

interface StudentAttendanceProfileModalProps {
  student: Student | null
  month: number
  year: number
  dojoId: string
  isOpen: boolean
  onClose: () => void
}

export const StudentAttendanceProfileModal: React.FC<StudentAttendanceProfileModalProps> = ({
  student,
  month,
  year,
  dojoId,
  isOpen,
  onClose,
}) => {
  const [selectedDayDetail, setSelectedDayDetail] = useState<{
    date: string
    time: string
    status: string
    remarks: string
    markedBy: string
    updatedAt: string
    classType: string
  } | null>(null)

  const [activeTab, setActiveTab] = useState<'calendar' | 'log'>('calendar')

  if (!isOpen || !student) return null

  const dojo = komsStore.getDojo(dojoId)
  const summary: StudentMonthlyAttendanceSummary = komsStore.calculateStudentMonthlyAttendance(
    student.id,
    dojoId,
    year,
    month
  )

  const monthSessions = komsStore.getScheduleSessions({ dojoId, year, month })
  const studentAttendanceRecords = komsStore.getStudentAttendance({
    studentId: student.id,
    dojoId,
    year,
    month,
  })

  const fullHistory = komsStore.getStudentFullAttendanceHistory(student.id)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  // Prepare calendar days
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay() // 0 = Sun

  const calendarDays: Array<{
    dayNumber: number
    dateStr: string
    session?: any
    attendance?: any
    status: 'present' | 'absent' | 'late' | 'excused' | 'cancelled' | 'holiday' | 'upcoming' | 'none'
  }> = []

  const todayStr = '2026-11-02'

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const sess = monthSessions.find((s) => s.classDate === dateStr)
    const att = studentAttendanceRecords.find((a) => a.classDate === dateStr || (sess && a.sessionId === sess.id))

    let status: 'present' | 'absent' | 'late' | 'excused' | 'cancelled' | 'holiday' | 'upcoming' | 'none' = 'none'

    if (sess) {
      if (sess.sessionStatus === 'cancelled') {
        status = 'cancelled'
      } else if (sess.sessionStatus === 'holiday') {
        status = 'holiday'
      } else if (sess.classDate > todayStr && sess.sessionStatus === 'scheduled') {
        status = 'upcoming'
      } else if (att) {
        status = att.attendanceStatus
      } else {
        // Conducted in past without record
        status = 'absent'
      }
    }

    calendarDays.push({
      dayNumber: d,
      dateStr,
      session: sess,
      attendance: att,
      status,
    })
  }

  function handleDayClick(dayItem: (typeof calendarDays)[0]) {
    if (!dayItem.session && !dayItem.attendance) {
      setSelectedDayDetail(null)
      return
    }

    const sess = dayItem.session
    const att = dayItem.attendance

    setSelectedDayDetail({
      date: dayItem.dateStr,
      time: sess ? `${sess.startTime} - ${sess.endTime}` : '06:30 PM - 08:00 PM',
      status: dayItem.status.toUpperCase(),
      remarks: att?.remarks || (sess?.notes ? `Session Note: ${sess.notes}` : 'No special remarks recorded'),
      markedBy: att?.markedBy || sess?.instructor || 'Sensei',
      updatedAt: att?.updatedAt ? new Date(att.updatedAt).toLocaleString() : 'System schedule entry',
      classType: sess?.classType || 'Regular Training',
    })
  }

  const statusColors = {
    present: { bg: '#dcfce7', text: '#15803d', border: '#86efac', label: 'Present' },
    late: { bg: '#fef9c3', text: '#a16207', border: '#fde047', label: 'Late' },
    excused: { bg: '#ede9fe', text: '#6d28d9', border: '#c4b5fd', label: 'Excused' },
    absent: { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5', label: 'Absent' },
    cancelled: { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1', label: 'Cancelled' },
    holiday: { bg: '#ffedd5', text: '#c2410c', border: '#fdba74', label: 'Holiday' },
    upcoming: { bg: '#e0f2fe', text: '#0369a1', border: '#7dd3fc', label: 'Upcoming' },
    none: { bg: 'transparent', text: '#94a3b8', border: 'transparent', label: '' },
  }

  return (
    <div className="master-modal-backdrop" onClick={onClose}>
      <div
        className="master-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="master-modal-header" style={{ alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <img
              src={student.avatar?.url || '/assets/students/KOMS-2026-001.jpeg'}
              alt={student.name}
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #b91c1c',
              }}
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=120'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="master-modal-title" style={{ margin: 0 }}>
                  {student.name}
                </h3>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: summary.ratingColor + '20',
                    color: summary.ratingColor,
                  }}
                >
                  {summary.rating} ({summary.attendancePercentage}%)
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                <strong>{student.memberId}</strong> • {student.rank || 'White Belt'} •{' '}
                {dojo?.name || 'Ranga Nagar Dojo'}
              </div>
            </div>
          </div>

          <button className="master-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Month KPI Summary Bar */}
        <div
          style={{
            margin: '16px 20px 0',
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '8px',
          }}
        >
          <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Conducted</span>
            <strong style={{ fontSize: '16px', color: '#0f172a' }}>{summary.totalConducted}</strong>
          </div>
          <div style={{ padding: '10px', background: '#dcfce7', borderRadius: '8px', textAlign: 'center', border: '1px solid #86efac' }}>
            <span style={{ fontSize: '11px', color: '#166534', display: 'block' }}>Present</span>
            <strong style={{ fontSize: '16px', color: '#15803d' }}>{summary.presentCount}</strong>
          </div>
          <div style={{ padding: '10px', background: '#fee2e2', borderRadius: '8px', textAlign: 'center', border: '1px solid #fca5a5' }}>
            <span style={{ fontSize: '11px', color: '#991b1b', display: 'block' }}>Absent</span>
            <strong style={{ fontSize: '16px', color: '#b91c1c' }}>{summary.absentCount}</strong>
          </div>
          <div style={{ padding: '10px', background: '#fef9c3', borderRadius: '8px', textAlign: 'center', border: '1px solid #fde047' }}>
            <span style={{ fontSize: '11px', color: '#854d0e', display: 'block' }}>Late</span>
            <strong style={{ fontSize: '16px', color: '#a16207' }}>{summary.lateCount}</strong>
          </div>
          <div style={{ padding: '10px', background: '#ede9fe', borderRadius: '8px', textAlign: 'center', border: '1px solid #c4b5fd' }}>
            <span style={{ fontSize: '11px', color: '#5b21b6', display: 'block' }}>Excused</span>
            <strong style={{ fontSize: '16px', color: '#6d28d9' }}>{summary.excusedCount}</strong>
          </div>
          <div style={{ padding: '10px', background: summary.ratingColor + '15', borderRadius: '8px', textAlign: 'center', border: `1px solid ${summary.ratingColor}40` }}>
            <span style={{ fontSize: '11px', color: summary.ratingColor, display: 'block' }}>Attendance %</span>
            <strong style={{ fontSize: '16px', color: summary.ratingColor }}>{summary.attendancePercentage}%</strong>
          </div>
        </div>

        {/* Tab switch between Calendar and Chronological Log */}
        <div style={{ display: 'flex', gap: '8px', padding: '14px 20px 0' }}>
          <button
            onClick={() => setActiveTab('calendar')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: activeTab === 'calendar' ? '1.5px solid #b91c1c' : '1px solid #e2e8f0',
              background: activeTab === 'calendar' ? '#fee2e2' : '#ffffff',
              color: activeTab === 'calendar' ? '#991b1b' : '#475569',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            📅 {monthNames[month - 1]} {year} Calendar
          </button>
          <button
            onClick={() => setActiveTab('log')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: activeTab === 'log' ? '1.5px solid #b91c1c' : '1px solid #e2e8f0',
              background: activeTab === 'log' ? '#fee2e2' : '#ffffff',
              color: activeTab === 'log' ? '#991b1b' : '#475569',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            📜 Full Chronological History ({fullHistory.length})
          </button>
        </div>

        {/* View 1: Monthly Attendance Calendar */}
        {activeTab === 'calendar' && (
          <div style={{ padding: '14px 20px' }}>
            {/* Legend */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                fontSize: '11px',
                padding: '8px 12px',
                background: '#f8fafc',
                borderRadius: '6px',
                marginBottom: '12px',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#16a34a' }} /> Present
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#dc2626' }} /> Absent
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ca8a04' }} /> Late
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#7c3aed' }} /> Excused
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#64748b' }} /> Cancelled
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ea580c' }} /> Holiday
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0284c7' }} /> Upcoming
              </span>
            </div>

            {/* Calendar Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '6px',
                textAlign: 'center',
              }}
            >
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', padding: '4px 0' }}>
                  {d}
                </div>
              ))}

              {/* Offset days */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`offset-${i}`} style={{ minHeight: '52px', background: 'transparent' }} />
              ))}

              {/* Month Days */}
              {calendarDays.map((item) => {
                const conf = statusColors[item.status]
                const hasItem = item.status !== 'none'
                const isSelected = selectedDayDetail?.date === item.dateStr

                return (
                  <button
                    key={item.dayNumber}
                    type="button"
                    onClick={() => handleDayClick(item)}
                    style={{
                      minHeight: '52px',
                      padding: '4px',
                      borderRadius: '8px',
                      background: isSelected ? '#fee2e2' : conf.bg !== 'transparent' ? conf.bg : '#ffffff',
                      border: isSelected ? '2px solid #b91c1c' : conf.border !== 'transparent' ? `1px solid ${conf.border}` : '1px solid #f1f5f9',
                      cursor: hasItem ? 'pointer' : 'default',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'transform 0.1s',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: hasItem ? conf.text : '#94a3b8',
                      }}
                    >
                      {item.dayNumber}
                    </span>
                    {hasItem && (
                      <span
                        style={{
                          fontSize: '9px',
                          fontWeight: 800,
                          color: conf.text,
                          textTransform: 'uppercase',
                          textDecoration: item.status === 'cancelled' ? 'line-through' : 'none',
                        }}
                      >
                        {conf.label}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Clicked Date Detail Popover Box */}
            {selectedDayDetail && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '14px',
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  animation: 'fadeIn 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                    📅 {selectedDayDetail.date} ({selectedDayDetail.time})
                  </strong>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '12px',
                      background: '#e2e8f0',
                      color: '#0f172a',
                    }}
                  >
                    Status: {selectedDayDetail.status}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px' }}>
                  <strong>Class:</strong> {selectedDayDetail.classType} • <strong>Marked By:</strong>{' '}
                  {selectedDayDetail.markedBy}
                </div>
                <div style={{ fontSize: '12px', color: '#334155', marginTop: '4px' }}>
                  <strong>Remarks:</strong> {selectedDayDetail.remarks}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                  <strong>Last Updated:</strong> {selectedDayDetail.updatedAt}
                </div>
              </div>
            )}
          </div>
        )}

        {/* View 2: Complete Chronological Attendance History */}
        {activeTab === 'log' && (
          <div style={{ padding: '14px 20px' }}>
            <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
              <table className="master-data-table" style={{ fontSize: '12px', width: '100%' }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Class Session</th>
                    <th>Timings</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    <th>Marked By</th>
                  </tr>
                </thead>
                <tbody>
                  {fullHistory.map((item, idx) => {
                    const conf = statusColors[item.attendanceStatus] || statusColors.present
                    return (
                      <tr key={idx}>
                        <td>
                          <strong>{item.classDate}</strong>
                        </td>
                        <td>{item.sessionTitle}</td>
                        <td>{item.startTime} - {item.endTime}</td>
                        <td>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: conf.bg,
                              color: conf.text,
                            }}
                          >
                            {item.attendanceStatus.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ color: item.remarks ? '#0f172a' : '#94a3b8' }}>
                          {item.remarks || '—'}
                        </td>
                        <td style={{ color: '#64748b' }}>{item.markedBy}</td>
                      </tr>
                    )
                  })}
                  {fullHistory.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                        No attendance history records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="master-modal-footer" style={{ padding: '14px 20px' }}>
          <button className="master-btn-outline" onClick={onClose}>
            Close Profile
          </button>
        </div>
      </div>
    </div>
  )
}
