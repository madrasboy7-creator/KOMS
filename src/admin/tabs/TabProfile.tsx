import React from 'react'
import type { MasterProfileData } from '../masterData'

interface TabProfileProps {
  profile: MasterProfileData
  onEditProfile: () => void
}

export const TabProfile: React.FC<TabProfileProps> = ({ profile, onEditProfile }) => {
  return (
    <div className="master-tab-view master-profile-view">
      {/* Header bar */}
      <div className="master-pane-header">
        <h2 className="master-pane-title">My Profile</h2>
        <button
          className="master-btn-primary"
          onClick={onEditProfile}
        >
          Edit Profile
        </button>
      </div>

      {/* Main Profile Summary Card */}
      <div className="master-card master-profile-hero-card">
        <div className="master-profile-hero-avatar-wrap">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="master-profile-hero-avatar"
          />
        </div>
        <div className="master-profile-hero-content">
          <h3 className="master-profile-hero-name">{profile.name}</h3>
          <div className="master-profile-hero-meta">
            <span className="master-profile-location">
              📍 {profile.dojo}
            </span>
            <span className="master-role-badge">{profile.role}</span>
          </div>
          <p className="master-profile-photo-note">
            ⓘ Profile photo cannot be changed
          </p>
        </div>
      </div>

      {/* Section 1: Personal Details */}
      <div className="master-card master-profile-section-card">
        <h4 className="master-profile-section-heading">Personal Details</h4>
        <div className="master-detail-row">
          <span className="master-detail-label">Name</span>
          <span className="master-detail-value">{profile.name}</span>
        </div>
        <div className="master-detail-row">
          <span className="master-detail-label">Age</span>
          <span className="master-detail-value">{profile.age}</span>
        </div>
        <div className="master-detail-row">
          <span className="master-detail-label">Phone</span>
          <span className="master-detail-value">{profile.phone}</span>
        </div>
        <div className="master-detail-row">
          <span className="master-detail-label">Email</span>
          <span className="master-detail-value">{profile.email}</span>
        </div>
      </div>

      {/* Section 2: Experience & Training */}
      <div className="master-card master-profile-section-card">
        <h4 className="master-profile-section-heading">Experience & Training</h4>
        <div className="master-detail-row">
          <span className="master-detail-label">Experience</span>
          <span className="master-detail-value">{profile.experience}</span>
        </div>
        <div className="master-detail-row">
          <span className="master-detail-label">Trained By</span>
          <span className="master-detail-value">{profile.trainedBy}</span>
        </div>
        <div className="master-detail-row">
          <span className="master-detail-label">Style</span>
          <span className="master-detail-value">{profile.style}</span>
        </div>
      </div>

      {/* Section 3: Achievements */}
      <div className="master-card master-profile-section-card">
        <h4 className="master-profile-section-heading">Achievements</h4>
        <ul className="master-profile-achievements-list">
          {profile.achievements.map((ach, idx) => (
            <li key={idx} className="master-profile-achievement-item">
              <span className="master-star-bullet">⭐</span>
              <span>{ach}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
