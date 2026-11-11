import React, { useState, useEffect } from 'react'
import { komsStore } from '../../services/komsStore'
import type { MasterProfileData } from '../masterData'

interface TabMasterProfileProps {
  onSignOut?: () => void
  onNavigateTab?: (tab: any, subTab?: string) => void
}

export const TabMasterProfile: React.FC<TabMasterProfileProps> = ({ onNavigateTab }) => {
  const [profile, setProfile] = useState<MasterProfileData>(() => komsStore.getMasterProfile())
  const [activeSection, setActiveSection] = useState<'personal' | 'martial' | 'bio' | 'achievements' | 'contact' | 'preview'>('personal')
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [newAchievement, setNewAchievement] = useState('')

  // Form State
  const [name, setName] = useState(profile.name || '')
  const [danRank, setDanRank] = useState(profile.danRank || profile.rank || '4th Dan Black Belt')
  const [role, setRole] = useState(profile.role || 'Master / Chief Sensei')
  const [dojo, setDojo] = useState(profile.dojo || 'MASS DRAGON DOJO — Ranga Nagar Dojo')
  const [avatar, setAvatar] = useState(profile.avatar || '')
  const [gender, setGender] = useState(profile.gender || 'Male')
  const [dob, setDob] = useState(profile.dob || '1988-08-15')
  const [phone, setPhone] = useState(profile.phone || '')
  const [email, setEmail] = useState(profile.email || '')
  const [address, setAddress] = useState(profile.address || '')
  const [experience, setExperience] = useState(profile.experience || '16 Years')
  const [teachingExperience, setTeachingExperience] = useState(profile.teachingExperience || '11 Years Chief Instructor')
  const [qualifications, setQualifications] = useState(profile.qualifications || 'Certified National Referee (WKF) & Senior Kobudo Instructor')
  const [trainedBy, setTrainedBy] = useState(profile.trainedBy || 'Hanshi Grand Master (9th Dan)')
  const [style, setStyle] = useState(profile.style || 'Okinawa Shorin Ryu Matsumura Seito & Kobudo')
  const [biography, setBiography] = useState(profile.biography || '')
  const [achievements, setAchievements] = useState<string[]>(profile.achievements || [])
  const [socialWebsite, setSocialWebsite] = useState(profile.socialWebsite || '')
  const [socialInstagram, setSocialInstagram] = useState(profile.socialInstagram || '')
  const [socialFacebook, setSocialFacebook] = useState(profile.socialFacebook || '')

  useEffect(() => {
    return komsStore.subscribe(() => {
      const p = komsStore.getMasterProfile()
      setProfile(p)
    })
  }, [])

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  function handleAddAchievement() {
    if (!newAchievement.trim()) return
    setAchievements((prev) => [...prev, newAchievement.trim()])
    setNewAchievement('')
  }

  function handleRemoveAchievement(index: number) {
    setAchievements((prev) => prev.filter((_, idx) => idx !== index))
  }

  function handlePublishChanges(e: React.FormEvent) {
    e.preventDefault()

    const updated = komsStore.updateMasterProfile({
      name: name.trim(),
      danRank: danRank.trim(),
      rank: danRank.trim(),
      role: role.trim(),
      dojo: dojo.trim(),
      avatar: avatar.trim(),
      gender,
      dob,
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      experience: experience.trim(),
      teachingExperience: teachingExperience.trim(),
      qualifications: qualifications.trim(),
      trainedBy: trainedBy.trim(),
      style: style.trim(),
      biography: biography.trim(),
      achievements,
      socialWebsite: socialWebsite.trim(),
      socialInstagram: socialInstagram.trim(),
      socialFacebook: socialFacebook.trim(),
    })

    setProfile(updated)
    showToast('✨ Master Profile published! Changes are now live in Common UI → Dojos.')
  }

  return (
    <div className="tab-pane animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {toastMsg && (
        <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, background: '#10b981', color: '#fff', padding: '0.85rem 1.5rem', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>✓</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #b5121b', flexShrink: 0 }}>
            <img src={avatar || profile.avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{name}</h2>
              <span style={{ background: '#fef2f2', color: '#b5121b', border: '1px solid #fecaca', padding: '2px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700 }}>
                {danRank}
              </span>
            </div>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
              🥋 {style} • 📍 {dojo}
            </p>
          </div>
        </div>

        <button
          onClick={handlePublishChanges}
          style={{ background: 'linear-gradient(135deg, #b5121b 0%, #991b1b 100%)', color: '#fff', border: 'none', padding: '0.75rem 1.75rem', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(181, 18, 27, 0.35)' }}
        >
          <span>🚀</span>
          <span>Publish Changes to Common UI</span>
        </button>
      </div>

      {/* Automatic Sync Notice Card */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <span style={{ fontSize: '20px' }}>⚡</span>
        <div style={{ fontSize: '13px', color: '#1e40af', lineHeight: '1.5' }}>
          <strong>Single Source of Truth:</strong> Any edits saved here (e.g., updating your Dan rank, biography, profile photo, or achievements) are automatically synchronized with the <strong>Common UI → Dojos</strong> directory and the public Dojo Detail modal. No duplicate editing is required!
        </div>
      </div>

      {/* Navigation Submenu */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', overflowX: 'auto' }}>
        {[
          { id: 'personal', label: '1. Personal Information' },
          { id: 'martial', label: '2. Professional & Martial Arts' },
          { id: 'bio', label: '3. Biography & About Master' },
          { id: 'achievements', label: `4. Rank & Achievements (${achievements.length})` },
          { id: 'contact', label: '5. Contact & Social' },
          { id: 'preview', label: '👁 Public Profile Preview' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: activeSection === tab.id ? '#b5121b' : 'transparent',
              color: activeSection === tab.id ? '#fff' : '#64748b',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section 1: Personal Information */}
      {activeSection === 'personal' && (
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Personal Information</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Master Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                placeholder="e.g. Sensei Rubeshwaren"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>System Role / Title</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                placeholder="e.g. Master / Chief Sensei"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#fff' }}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Profile Picture URL</label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              placeholder="https://... or /assets/..."
            />
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Quick Sensei Avatars:</span>
              {[
                { label: 'Sensei Male 1', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=300' },
                { label: 'Sensei Male 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300' },
                { label: 'Sensei Female', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300' },
                { label: 'Traditional Gi', url: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=300' },
              ].map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAvatar(p.url)}
                  style={{ fontSize: '11.5px', padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Professional & Martial Arts */}
      {activeSection === 'martial' && (
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Professional & Martial Arts Details</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Martial Arts Belt Rank / Dan Grade *</label>
              <select
                value={danRank}
                onChange={(e) => setDanRank(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#fff' }}
              >
                <option value="1st Dan Black Belt">1st Dan Black Belt (Shodan)</option>
                <option value="2nd Dan Black Belt">2nd Dan Black Belt (Nidan)</option>
                <option value="3rd Dan Black Belt">3rd Dan Black Belt (Sandan)</option>
                <option value="4th Dan Black Belt">4th Dan Black Belt (Yondan)</option>
                <option value="5th Dan Kyoshi">5th Dan Kyoshi (Godan)</option>
                <option value="6th Dan Kyoshi">6th Dan Kyoshi (Rokudan)</option>
                <option value="7th Dan Kyoshi">7th Dan Kyoshi (Nanadan)</option>
                <option value="8th Dan Hanshi">8th Dan Hanshi (Hachidan)</option>
                <option value="9th Dan Hanshi">9th Dan Hanshi (Kudan)</option>
                <option value="10th Dan Grand Master">10th Dan Grand Master (Judan)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Years of Experience</label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                placeholder="e.g. 16 Years"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Teaching Experience</label>
              <input
                type="text"
                value={teachingExperience}
                onChange={(e) => setTeachingExperience(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                placeholder="e.g. 11 Years as Head Instructor"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Trained By (Lineage)</label>
              <input
                type="text"
                value={trainedBy}
                onChange={(e) => setTrainedBy(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                placeholder="e.g. Hanshi Grand Master"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Karate Style & Martial Lineage *</label>
            <input
              type="text"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              placeholder="e.g. Okinawa Shorin Ryu Matsumura Seito & Kobudo"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Certifications & Qualifications</label>
            <textarea
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontFamily: 'inherit' }}
              placeholder="e.g. Certified National Referee (WKF Rules), Certified Self-Defense Instructor, Senior Kobudo Examiner"
            />
          </div>
        </div>
      )}

      {/* Section 3: Biography */}
      {activeSection === 'bio' && (
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Biography & Personal Introduction</h3>
          <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
            This biography is featured publicly in the Common UI on the <strong>Dojo Details</strong> page under "Master Information".
          </p>
          <textarea
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
            rows={7}
            style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontFamily: 'inherit', lineHeight: '1.6' }}
            placeholder="Write an introduction about your martial arts journey, philosophy, training focus, and teaching dedication..."
          />
        </div>
      )}

      {/* Section 4: Achievements */}
      {activeSection === 'achievements' && (
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Awards, Recognitions & Dan Certifications</h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Displayed publicly on your dojo card</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={newAchievement}
              onChange={(e) => setNewAchievement(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddAchievement()
                }
              }}
              style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              placeholder="e.g. Gold Medalist - All India Karate Championship 2024"
            />
            <button
              type="button"
              onClick={handleAddAchievement}
              style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              + Add
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {achievements.map((ach, idx) => (
              <div
                key={idx}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#eab308', fontSize: '16px' }}>⭐</span>
                  <span style={{ fontSize: '13.5px', color: '#1e293b', fontWeight: 500 }}>{ach}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAchievement(idx)}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '16px', cursor: 'pointer', padding: '4px 8px' }}
                  title="Remove item"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 5: Contact & Social */}
      {activeSection === 'contact' && (
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Contact & Social Information</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Phone Number *</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                placeholder="+91 96001 03987"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Official Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                placeholder="sensei@koms.in"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Instagram Handle</label>
              <input
                type="text"
                value={socialInstagram}
                onChange={(e) => setSocialInstagram(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                placeholder="@sensei_dojo"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Website URL</label>
              <input
                type="text"
                value={socialWebsite}
                onChange={(e) => setSocialWebsite(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Official / Dojo Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              placeholder="e.g. 1/38 2nd Street, Ranga Nagar, Mudichur, Chennai - 600048"
            />
          </div>
        </div>
      )}

      {/* Section 6: Public Profile Preview */}
      {activeSection === 'preview' && (
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Public Profile Live Preview</h3>
            <span style={{ fontSize: '12px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
              Live in Common UI → Dojos
            </span>
          </div>

          {/* Preview Card */}
          <div style={{ background: '#0f172a', color: '#fff', borderRadius: '14px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <img
                src={avatar || profile.avatar}
                alt={name}
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #ef4444' }}
              />
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#fff' }}>{name}</h4>
                  <span style={{ background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                    {danRank}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                  {experience} Experience • Trained by {trainedBy}
                </div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>
                  🥋 {style}
                </div>
              </div>
            </div>

            <div style={{ background: '#1e293b', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
              <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Sensei Biography</div>
              {biography || 'No biography written yet.'}
            </div>

            <div>
              <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>Championship & Honors</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {achievements.map((a, i) => (
                  <span key={i} style={{ background: '#334155', color: '#f8fafc', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>⭐</span>
                    <span>{a}</span>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid #334155', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
              <span>📞 {phone}</span>
              <span>✉️ {email}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Save Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1rem 1.5rem' }}>
        <button
          type="button"
          onClick={() => setActiveSection('preview')}
          style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', fontWeight: 600, fontSize: '13.5px', cursor: 'pointer' }}
        >
          Preview in Common UI
        </button>

        <button
          type="button"
          onClick={handlePublishChanges}
          style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#b5121b', color: '#fff', fontWeight: 700, fontSize: '13.5px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(181, 18, 27, 0.25)' }}
        >
          Save & Publish to Common UI
        </button>
      </div>
    </div>
  )
}

