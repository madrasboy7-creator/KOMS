import React, { useState } from 'react'
import type { MasterNote } from '../masterData'

interface CreateNoteModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (note: Omit<MasterNote, 'id'>) => void
}

export const CreateNoteModal: React.FC<CreateNoteModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState<'All Students' | 'Seniors' | 'Junior Dragons' | 'Parents'>('All Students')
  const [category, setCategory] = useState<'My Notes' | 'Student Notes' | 'Announcements'>('My Notes')
  const [content, setContent] = useState('')
  const [pinned, setPinned] = useState(false)

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !content) return

    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    onAdd({
      title,
      target,
      category,
      date: today,
      content,
      pinned,
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
          <h3 className="master-modal-title">+ Create Note / Announcement</h3>
          <button className="master-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="master-modal-form">
          <div className="master-form-field">
            <label>Title</label>
            <input
              type="text"
              placeholder="e.g. Special Weekend Seminar"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="master-form-field">
            <label>Target Audience</label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value as any)}
            >
              <option value="All Students">All Students</option>
              <option value="Seniors">Senior Belts Only</option>
              <option value="Junior Dragons">Junior Dragons</option>
              <option value="Parents">Parents & Guardians</option>
            </select>
          </div>

          <div className="master-form-field">
            <label>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
            >
              <option value="My Notes">My Sensei Notes</option>
              <option value="Student Notes">Student Training Notes</option>
              <option value="Announcements">Public Dojo Bulletin</option>
            </select>
          </div>

          <div className="master-form-field">
            <label>Note Content</label>
            <textarea
              rows={4}
              placeholder="Write notice or instruction here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="master-form-checkbox-row">
            <input
              type="checkbox"
              id="pinNoteCheck"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
            />
            <label htmlFor="pinNoteCheck">Pin this notice to top of Dojo board 📌</label>
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
              Post Note
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
