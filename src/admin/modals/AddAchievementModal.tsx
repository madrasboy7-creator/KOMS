import React, { useState } from 'react'
import type { MasterStudent, MasterAchievement } from '../masterData'

interface AddAchievementModalProps {
  students: MasterStudent[]
  isOpen: boolean
  onClose: () => void
  onAdd: (achievement: Omit<MasterAchievement, 'id'>) => void
}

export const AddAchievementModal: React.FC<AddAchievementModalProps> = ({
  students,
  isOpen,
  onClose,
  onAdd,
}) => {
  const [category, setCategory] = useState<'Belt Grades' | 'Certificates' | 'Awards'>('Belt Grades')
  const [studentId, setStudentId] = useState(students[0]?.id || '')
  const [title, setTitle] = useState('Yellow Belt Promotion')
  const [date, setDate] = useState('Oct 4, 2026')
  const [beltColor, setBeltColor] = useState('#FACC15')

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const student = students.find((s) => s.id === studentId) || students[0]
    onAdd({
      title,
      studentName: student ? student.name : 'Student',
      studentId,
      date,
      category,
      iconType: category === 'Belt Grades' ? 'belt' : category === 'Certificates' ? 'certificate' : 'award',
      color: category === 'Belt Grades' ? beltColor : '#3B82F6',
      beltColor: category === 'Belt Grades' ? beltColor : undefined,
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
          <h3 className="master-modal-title">+ Issue New Achievement</h3>
          <button className="master-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="master-modal-form">
          <div className="master-form-field">
            <label>Achievement Category</label>
            <select
              value={category}
              onChange={(e) => {
                const val = e.target.value as 'Belt Grades' | 'Certificates' | 'Awards'
                setCategory(val)
                if (val === 'Belt Grades') setTitle('Yellow Belt Promotion')
                else if (val === 'Certificates') setTitle('Karate Kata Participation Certificate')
                else setTitle('Best Kata Discipline Award')
              }}
            >
              <option value="Belt Grades">Belt Grades</option>
              <option value="Certificates">Certificates</option>
              <option value="Awards">Awards</option>
            </select>
          </div>

          <div className="master-form-field">
            <label>Select Student</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.memberId} - {s.rank})
                </option>
              ))}
            </select>
          </div>

          <div className="master-form-field">
            <label>Achievement Title / Grade</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {category === 'Belt Grades' && (
            <div className="master-form-field">
              <label>Belt Color</label>
              <select
                value={beltColor}
                onChange={(e) => setBeltColor(e.target.value)}
              >
                <option value="#FFFFFF">White Belt</option>
                <option value="#FACC15">Yellow Belt</option>
                <option value="#FB923C">Orange Belt</option>
                <option value="#16A34A">Green Belt</option>
                <option value="#2563EB">Blue Belt</option>
                <option value="#9333EA">Purple Belt</option>
                <option value="#854D0E">Brown Belt</option>
                <option value="#121212">Black Belt</option>
              </select>
            </div>
          )}

          <div className="master-form-field">
            <label>Date of Achievement</label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
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
              Issue Achievement
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
