import React, { useState, useMemo } from 'react'
import type { ClassType } from '../../models/koms'
import { DOJO_OPTIONS, type DojoOption } from '../../data/scheduleAttendanceData'

interface CreateMonthlyScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (params: {
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
  }) => void
  currentDojoId: string
  currentYear: number
  currentMonth: number
  allowedDojos?: string[]
  userName?: string
}

export const CreateMonthlyScheduleModal: React.FC<CreateMonthlyScheduleModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  currentDojoId,
  currentYear,
  currentMonth,
  allowedDojos,
  userName,
}) => {
  const [selectedDojoId, setSelectedDojoId] = useState(currentDojoId || 'dojo-ranganagar')
  const [year, setYear] = useState(currentYear || 2026)
  const [month, setMonth] = useState(currentMonth || 10)
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 3, 5, 0]) // Mon, Wed, Fri, Sun
  const [startTime, setStartTime] = useState('06:30 PM')
  const [endTime, setEndTime] = useState('08:00 PM')
  const [classType, setClassType] = useState<ClassType>('Regular Training')
  const [instructor, setInstructor] = useState(userName || 'Sensei Ashokan A.')
  const [notes, setNotes] = useState('Traditional Okinawan Shorin-Ryu Karate & Kobudo Drills')

  if (!isOpen) return null

  const availableDojos = DOJO_OPTIONS.filter((d) => !allowedDojos || allowedDojos.includes(d.id))

  const dayNames = [
    { dow: 1, label: 'Mon', full: 'Monday' },
    { dow: 2, label: 'Tue', full: 'Tuesday' },
    { dow: 3, label: 'Wed', full: 'Wednesday' },
    { dow: 4, label: 'Thu', full: 'Thursday' },
    { dow: 5, label: 'Fri', full: 'Friday' },
    { dow: 6, label: 'Sat', full: 'Saturday' },
    { dow: 0, label: 'Sun', full: 'Sunday' },
  ]

  function toggleDay(dow: number) {
    if (daysOfWeek.includes(dow)) {
      if (daysOfWeek.length > 1) {
        setDaysOfWeek(daysOfWeek.filter((d) => d !== dow))
      }
    } else {
      setDaysOfWeek([...daysOfWeek, dow])
    }
  }

  // Calculate preview of generated dates
  const previewDates = useMemo(() => {
    const dates: string[] = []
    const daysInMonth = new Date(year, month, 0).getDate()
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month - 1, day)
      if (daysOfWeek.includes(dateObj.getDay())) {
        const formatted = dateObj.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
        dates.push(formatted)
      }
    }
    return dates
  }, [year, month, daysOfWeek])

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onGenerate({
      dojoId: selectedDojoId,
      year: Number(year),
      month: Number(month),
      daysOfWeek,
      startTime,
      endTime,
      classType,
      notes,
      instructor,
      createdBy: userName || 'Sensei Master',
    })
    onClose()
  }

  return (
    <div className="master-modal-backdrop" onClick={onClose}>
      <div
        className="master-modal-content master-schedule-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="master-modal-header">
          <div>
            <h3 className="master-modal-title">📅 Create Monthly Class Schedule</h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Auto-generate monthly Karate training sessions for all selected weekdays
            </span>
          </div>
          <button className="master-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="master-modal-form" style={{ padding: '20px' }}>
          {/* Dojo, Year, Month Selector Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '12px' }}>
            <div className="master-form-field">
              <label>🥋 Select Dojo</label>
              <select
                value={selectedDojoId}
                onChange={(e) => setSelectedDojoId(e.target.value)}
                required
              >
                {availableDojos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.shortName}
                  </option>
                ))}
              </select>
            </div>

            <div className="master-form-field">
              <label>📆 Select Year</label>
              <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>

            <div className="master-form-field">
              <label>🗓 Select Month</label>
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {monthNames.map((name, i) => (
                  <option key={i + 1} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Weekday Selection Multi-Select */}
          <div className="master-form-field" style={{ marginTop: '6px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Class Days (Select Multiple Weekdays)</span>
              <small style={{ color: '#0284c7' }}>{daysOfWeek.length} days selected</small>
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
              {dayNames.map((day) => {
                const isSelected = daysOfWeek.includes(day.dow)
                return (
                  <button
                    key={day.dow}
                    type="button"
                    onClick={() => toggleDay(day.dow)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: isSelected ? '1.5px solid #b91c1c' : '1px solid #e2e8f0',
                      background: isSelected ? '#fee2e2' : '#ffffff',
                      color: isSelected ? '#991b1b' : '#334155',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      fontSize: '13px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isSelected && '✓ '}
                    {day.full}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time & Class Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '12px', marginTop: '8px' }}>
            <div className="master-form-field">
              <label>⏰ Start Time</label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="06:30 PM"
                required
              />
            </div>

            <div className="master-form-field">
              <label>⏰ End Time</label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="08:00 PM"
                required
              />
            </div>

            <div className="master-form-field">
              <label>🏷 Class Type</label>
              <select
                value={classType}
                onChange={(e) => setClassType(e.target.value as ClassType)}
              >
                <option value="Regular Training">Regular Training</option>
                <option value="Special Training">Special Training</option>
                <option value="Grading Practice">Grading Practice</option>
                <option value="Tournament Practice">Tournament Practice</option>
              </select>
            </div>
          </div>

          {/* Instructor & Notes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px', marginTop: '8px' }}>
            <div className="master-form-field">
              <label>👤 Sensei / Instructor</label>
              <input
                type="text"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                placeholder="Sensei Name"
                required
              />
            </div>

            <div className="master-form-field">
              <label>📝 Schedule Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Kata bunkai, sparring footwork"
              />
            </div>
          </div>

          {/* Live Generation Preview Box */}
          <div
            style={{
              marginTop: '16px',
              padding: '12px 16px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ fontSize: '13px', color: '#0f172a' }}>
                ✨ Monthly Schedule Generator Preview
              </strong>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  background: '#dcfce7',
                  color: '#166534',
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                {previewDates.length} Classes will be created
              </span>
            </div>
            <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#64748b' }}>
              Month: <strong>{monthNames[month - 1]} {year}</strong> • Timings:{' '}
              <strong>{startTime} - {endTime}</strong> ({classType})
            </p>
            <div
              style={{
                display: 'flex',
                gap: '6px',
                flexWrap: 'wrap',
                maxHeight: '100px',
                overflowY: 'auto',
                padding: '4px',
              }}
            >
              {previewDates.map((d, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    color: '#334155',
                  }}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>

          <div className="master-modal-footer" style={{ marginTop: '20px', padding: 0 }}>
            <button type="button" className="master-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="master-btn-primary"
              style={{ minWidth: '220px' }}
            >
              🚀 Generate & Publish Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
