import React, { useState } from 'react'
import type { MasterProfileData } from '../masterData'

interface EditProfileModalProps {
  profile: MasterProfileData
  isOpen: boolean
  onClose: () => void
  onSave: (updated: Partial<MasterProfileData>) => void
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(profile.name)
  const [phone, setPhone] = useState(profile.phone)
  const [email, setEmail] = useState(profile.email)
  const [experience, setExperience] = useState(profile.experience)
  const [style, setStyle] = useState(profile.style)
  const [trainedBy, setTrainedBy] = useState(profile.trainedBy)

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      name,
      phone,
      email,
      experience,
      style,
      trainedBy,
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
          <h3 className="master-modal-title">Edit Sensei Profile</h3>
          <button className="master-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="master-modal-form">
          <div className="master-form-field">
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="master-form-field">
            <label>Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="master-form-field">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="master-form-field">
            <label>Teaching Experience</label>
            <input
              type="text"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              required
            />
          </div>

          <div className="master-form-field">
            <label>Karate Style / Lineage</label>
            <input
              type="text"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              required
            />
          </div>

          <div className="master-form-field">
            <label>Trained By (Master / Mentor)</label>
            <input
              type="text"
              value={trainedBy}
              onChange={(e) => setTrainedBy(e.target.value)}
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
