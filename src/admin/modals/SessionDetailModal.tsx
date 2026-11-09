import React, { useState } from 'react'
import type { ScheduleSession, ClassType, SessionStatus } from '../../models/koms'

interface SessionDetailModalProps {
  session: ScheduleSession | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (id: string, patch: Partial<ScheduleSession>) => void
  onDelete: (id: string, force?: boolean) => void
  onTakeAttendance: (session: ScheduleSession) => void
  hasAttendance: boolean
  attendanceCount: number
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  session,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onTakeAttendance,
  hasAttendance,
  attendanceCount,
}) => {
  const [classDate, setClassDate] = useState(session?.classDate || '')
  const [startTime, setStartTime] = useState(session?.startTime || '')
  const [endTime, setEndTime] = useState(session?.endTime || '')
  const [classType, setClassType] = useState<ClassType>(session?.classType || 'Regular Training')
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>(session?.sessionStatus || 'scheduled')
  const [instructor, setInstructor] = useState(session?.instructor || '')
  const [notes, setNotes] = useState(session?.notes || '')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [warnReschedule, setWarnReschedule] = useState(false)

  // Sync state if session changes
  React.useEffect(() => {
    if (session) {
      setClassDate(session.classDate)
      setStartTime(session.startTime)
      setEndTime(session.endTime)
      setClassType(session.classType)
      setSessionStatus(session.sessionStatus)
      setInstructor(session.instructor || '')
      setNotes(session.notes || '')
      setConfirmDelete(false)
      setWarnReschedule(false)
    }
  }, [session])

  if (!isOpen || !session) return null

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!session) return

    // If date changed and has attendance, warn once
    if (classDate !== session.classDate && hasAttendance && !warnReschedule) {
      setWarnReschedule(true)
      return
    }

    onUpdate(session.id, {
      classDate,
      startTime,
      endTime,
      classType,
      sessionStatus,
      instructor,
      notes,
    })
    onClose()
  }

  function handleDeleteClick() {
    if (!session) return
    if (hasAttendance && !confirmDelete) {
      setConfirmDelete(true)
      return
    }
    onDelete(session.id, confirmDelete)
    onClose()
  }

  return (
    <div className="master-modal-backdrop" onClick={onClose}>
      <div
        className="master-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="master-modal-header">
          <div>
            <h3 className="master-modal-title">🥋 Class Session Customization</h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Manage session timing, reschedule date, status, or roll call
            </span>
          </div>
          <button className="master-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="master-modal-form" style={{ padding: '20px' }}>
          {/* Attendance notice pill if recorded */}
          {hasAttendance && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '14px',
              }}
            >
              <span style={{ fontSize: '18px' }}>📋</span>
              <div style={{ flex: 1, fontSize: '12px', color: '#1e40af' }}>
                <strong>Attendance History Recorded:</strong> {attendanceCount} student records exist
                for this session. Schedule changes are safely preserved in audit logs.
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onTakeAttendance(session)
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: '#1d4ed8',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                View Roll Call
              </button>
            </div>
          )}

          {/* Date & Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
            <div className="master-form-field">
              <label>📅 Class Date (Reschedule)</label>
              <input
                type="date"
                value={classDate}
                onChange={(e) => {
                  setClassDate(e.target.value)
                  setWarnReschedule(false)
                }}
                required
              />
            </div>

            <div className="master-form-field">
              <label>🚦 Session Status</label>
              <select
                value={sessionStatus}
                onChange={(e) => setSessionStatus(e.target.value as SessionStatus)}
              >
                <option value="scheduled">🟢 Scheduled / Active</option>
                <option value="completed">🔵 Completed</option>
                <option value="cancelled">🔴 Cancelled</option>
                <option value="holiday">🟡 Dojo Holiday / Closed</option>
              </select>
            </div>
          </div>

          {warnReschedule && (
            <div
              style={{
                padding: '10px',
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '6px',
                color: '#b45309',
                fontSize: '12px',
                margin: '8px 0',
              }}
            >
              ⚠️ Rescheduling this date will preserve existing attendance history for the new date.
              Click <strong>"Save Changes"</strong> again to confirm.
            </div>
          )}

          {/* Timings */}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '12px', marginTop: '8px' }}>
            <div className="master-form-field">
              <label>👤 Instructor</label>
              <input
                type="text"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                placeholder="Sensei"
              />
            </div>

            <div className="master-form-field">
              <label>📝 Session Drills / Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Kata bunkai, sparring"
              />
            </div>
          </div>

          {confirmDelete && (
            <div
              style={{
                marginTop: '12px',
                padding: '12px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#991b1b',
                fontSize: '12px',
              }}
            >
              <strong>⚠️ Caution:</strong> This session has {attendanceCount} attendance records!
              Deleting it removes the calendar session. Are you sure you wish to proceed?
            </div>
          )}

          {/* Footer Actions */}
          <div
            className="master-modal-footer"
            style={{
              marginTop: '20px',
              padding: 0,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              onClick={handleDeleteClick}
              style={{
                background: confirmDelete ? '#b91c1c' : 'transparent',
                color: confirmDelete ? '#ffffff' : '#dc2626',
                border: '1px solid #dc2626',
                padding: '8px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {confirmDelete ? 'Confirm Permanent Delete' : '🗑 Remove Session'}
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onTakeAttendance(session)
                }}
                className="master-btn-outline"
                style={{ background: '#f1f5f9', color: '#0f172a' }}
              >
                👥 Take Attendance
              </button>
              <button type="submit" className="master-btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
