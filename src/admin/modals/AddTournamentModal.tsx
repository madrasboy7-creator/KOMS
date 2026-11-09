import React, { useState } from 'react'
import type { MasterTournament, MasterStudent } from '../masterData'

interface AddTournamentModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (tournament: Omit<MasterTournament, 'id'>) => void
}

export const AddTournamentModal: React.FC<AddTournamentModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [title, setTitle] = useState('All India Okinawa Shorin Ryu Championship 2026')
  const [date, setDate] = useState('Dec 20 - 21, 2026')
  const [location, setLocation] = useState('Jawaharlal Nehru Stadium, Chennai')
  const [category, setCategory] = useState('Kata / Kumite / Kobudo')
  const [participantsCount, setParticipantsCount] = useState(15)
  const [status, setStatus] = useState<'Registration Open' | 'Pending Approval'>('Registration Open')

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onAdd({
      title,
      date,
      location,
      category,
      participantsCount,
      status,
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400',
    })
    onClose()
  }

  return (
    <div className="master-modal-backdrop" onClick={onClose}>
      <div
        className="master-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="master-modal-header">
          <h3 className="master-modal-title">+ Add Tournament / Championship</h3>
          <button className="master-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="master-modal-form">
          <div className="master-form-field">
            <label>Championship Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="master-form-field">
            <label>Tournament Dates</label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="master-form-field">
            <label>Location & Venue</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="master-form-field">
            <label>Categories</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>

          <div className="master-form-field">
            <label>Expected Participants</label>
            <input
              type="number"
              value={participantsCount}
              onChange={(e) => setParticipantsCount(parseInt(e.target.value) || 0)}
              required
            />
          </div>

          <div className="master-form-field">
            <label>Registration Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="Registration Open">Registration Open</option>
              <option value="Pending Approval">Pending Approval</option>
            </select>
          </div>

          <div className="master-modal-footer">
            <button
              type="button"
              className="master-btn-outline"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="master-btn-primary">
              Publish Tournament
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface RegisterTournamentModalProps {
  tournament: MasterTournament | null
  students: MasterStudent[]
  isOpen: boolean
  onClose: () => void
  onRegister: (studentId: string, tournamentId: string, division: string) => void
}

export const RegisterTournamentModal: React.FC<RegisterTournamentModalProps> = ({
  tournament,
  students,
  isOpen,
  onClose,
  onRegister,
}) => {
  const [selectedStudent, setSelectedStudent] = useState(students[0]?.id || '')
  const [division, setDivision] = useState('Kata & Kumite')

  if (!isOpen || !tournament) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onRegister(selectedStudent, tournament!.id, division)
    onClose()
  }

  return (
    <div className="master-modal-backdrop" onClick={onClose}>
      <div
        className="master-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="master-modal-header">
          <h3 className="master-modal-title">Register Student for Tournament</h3>
          <button className="master-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="master-modal-form">
          <div className="master-card" style={{ padding: '12px', background: '#f8fafc', marginBottom: '14px' }}>
            <strong>{tournament.title}</strong>
            <small style={{ display: 'block', color: '#64748b' }}>📅 {tournament.date} · 📍 {tournament.location}</small>
          </div>

          <div className="master-form-field">
            <label>Choose Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.memberId} - {s.rank})
                </option>
              ))}
            </select>
          </div>

          <div className="master-form-field">
            <label>Select Division / Event</label>
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
            >
              <option value="Kata Only">Individual Kata</option>
              <option value="Kumite Sparring">Kumite (Light Contact Sparring)</option>
              <option value="Kata & Kumite">Both Kata & Kumite</option>
              <option value="Kobudo Weapons">Kobudo Weapons Division</option>
            </select>
          </div>

          <div className="master-modal-footer">
            <button
              type="button"
              className="master-btn-outline"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="master-btn-primary">
              Confirm Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
