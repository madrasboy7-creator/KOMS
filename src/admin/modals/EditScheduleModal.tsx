import React, { useState } from 'react'
import type { MasterScheduleItem } from '../masterData'

interface EditScheduleModalProps {
  schedule: MasterScheduleItem[]
  isOpen: boolean
  onClose: () => void
  onAddSession: (item: Omit<MasterScheduleItem, 'id'>) => void
  onDeleteSession: (id: string) => void
}

export const EditScheduleModal: React.FC<EditScheduleModalProps> = ({
  schedule,
  isOpen,
  onClose,
  onAddSession,
  onDeleteSession,
}) => {
  const [day, setDay] = useState('Tuesday')
  const [time, setTime] = useState('5:00 - 6:30 PM')
  const [session, setSession] = useState('1/2')
  const [instructor, setInstructor] = useState('Sensei Kumar')

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onAddSession({
      day,
      time,
      session,
      instructor,
    })
  }

  return (
    <div className="master-modal-backdrop" onClick={onClose}>
      <div
        className="master-modal-content master-schedule-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="master-modal-header">
          <h3 className="master-modal-title">Manage Training Schedule</h3>
          <button className="master-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="master-modal-body">
          {/* Current Sessions List */}
          <h4 className="master-modal-section-title">Current Weekly Sessions ({schedule.length})</h4>
          <div className="master-schedule-manage-list">
            {schedule.map((item) => (
              <div key={item.id} className="master-schedule-manage-item">
                <div>
                  <strong>{item.day}</strong> · <span>{item.time}</span>
                  <small style={{ display: 'block', color: '#64748b' }}>
                    Session: {item.session} · Instructor: {item.instructor}
                  </small>
                </div>
                <button
                  type="button"
                  className="master-btn-delete"
                  onClick={() => onDeleteSession(item.id)}
                  title="Remove session"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Add New Session Form */}
          <form onSubmit={handleSubmit} style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <h4 className="master-modal-section-title">+ Add New Session</h4>

            <div className="master-form-field">
              <label>Day</label>
              <select value={day} onChange={(e) => setDay(e.target.value)}>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>

            <div className="master-form-field">
              <label>Class Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 5:00 - 6:30 PM"
                required
              />
            </div>

            <div className="master-form-field">
              <label>Session / Batch</label>
              <input
                type="text"
                value={session}
                onChange={(e) => setSession(e.target.value)}
                placeholder="e.g. 1/2 or Evening Kihon"
                required
              />
            </div>

            <div className="master-form-field">
              <label>Instructor</label>
              <input
                type="text"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="master-btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              Add to Schedule
            </button>
          </form>
        </div>

        <div className="master-modal-footer">
          <button className="master-btn-outline" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
