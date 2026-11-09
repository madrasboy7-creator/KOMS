import React, { useState } from 'react'
import type { MasterAchievement } from '../masterData'

interface TabAchievementsProps {
  achievements: MasterAchievement[]
  recentAchievements: { rank: string; student: string; date: string; color: string }[]
  onAddAchievement: () => void
  onViewAchievement: (ach: MasterAchievement) => void
  onViewAllRecent: () => void
}

export const TabAchievements: React.FC<TabAchievementsProps> = ({
  achievements,
  recentAchievements,
  onAddAchievement,
  onViewAchievement,
  onViewAllRecent,
}) => {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Belt Grades' | 'Certificates' | 'Awards'>('All')

  const filteredAchievements = achievements.filter((a) => {
    if (activeCategory === 'All') return true
    return a.category === activeCategory
  })

  return (
    <div className="master-tab-view master-achievements-view">
      {/* Header */}
      <div className="master-pane-header">
        <h2 className="master-pane-title">Achievements</h2>
        <button
          className="master-btn-primary"
          onClick={onAddAchievement}
        >
          + Add Achievement
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="master-filter-pill-bar">
        {(['All', 'Belt Grades', 'Certificates', 'Awards'] as const).map((cat) => (
          <button
            key={cat}
            className={`master-filter-pill ${activeCategory === cat ? 'is-active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Achievement Cards List */}
      <div className="master-achievement-cards-grid">
        {filteredAchievements.map((ach) => (
          <div key={ach.id} className="master-card master-achievement-card">
            <div className="master-achievement-icon-wrap" style={{ color: ach.color }}>
              {ach.iconType === 'belt' && (
                <div
                  className="master-belt-ribbon-preview"
                  style={{
                    background: ach.beltColor || ach.color,
                    border: ach.beltColor === '#FFFFFF' ? '1px solid #ccc' : 'none',
                  }}
                >
                  <span className="master-belt-knot" />
                </div>
              )}
              {ach.iconType === 'certificate' && (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <circle cx="12" cy="14" r="3" />
                </svg>
              )}
              {ach.iconType === 'award' && (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="6" />
                  <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                </svg>
              )}
            </div>

            <div className="master-achievement-body">
              <strong className="master-achievement-title">{ach.title}</strong>
              <span className="master-achievement-student">{ach.studentName}</span>
              <small className="master-achievement-date">{ach.date}</small>
            </div>

            <button
              className="master-btn-achievement-view"
              onClick={() => onViewAchievement(ach)}
            >
              View
            </button>
          </div>
        ))}
      </div>

      {/* Recent Achievements Widget */}
      <div className="master-card master-recent-achievements-card">
        <div className="master-fee-history-header">
          <h3 className="master-card-title-sm">Recent Achievements</h3>
          <button
            className="master-link-view-all"
            onClick={onViewAllRecent}
          >
            View All
          </button>
        </div>

        <div className="master-recent-ach-list">
          {recentAchievements.map((rec, i) => (
            <div key={i} className="master-recent-ach-item">
              <div className="master-recent-ach-left">
                <span
                  className="master-recent-ach-dot"
                  style={{ background: rec.color }}
                />
                <strong className="master-recent-ach-rank">{rec.rank}</strong>
                <span className="master-recent-ach-sep">-</span>
                <span className="master-recent-ach-student">{rec.student}</span>
              </div>
              <small className="master-recent-ach-date">{rec.date}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
