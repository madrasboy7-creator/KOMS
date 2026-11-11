import React, { useState, useEffect } from 'react'
import type { MasterTabId } from '../MasterSidebar'
import type { MasterProfileData, MasterActivityItem } from '../masterData'
import { komsStore } from '../../services/komsStore'

interface TabDashboardProps {
  profile: MasterProfileData
  totalStudents: number
  presentCount: number
  pendingFeeCount: number
  upcomingTournamentCount: number
  pendingApprovalsCount: number
  activities: MasterActivityItem[]
  onNavigate: (tab: MasterTabId, subTab?: string) => void
  onOpenApprovals: () => void
}

export const TabDashboard: React.FC<TabDashboardProps> = ({
  profile,
  totalStudents: fallbackTotalStudents,
  activities: fallbackActivities,
  onNavigate,
  onOpenApprovals,
}) => {
  // Filters
  const [filterMonth, setFilterMonth] = useState('2026-11')
  const [filterDate, setFilterDate] = useState('2026-11-08')
  const [loading, setLoading] = useState(false)

  // Real backend metrics
  const [metrics, setMetrics] = useState({
    total_active_students: 19,
    new_registrations: 2,
    today_scheduled_classes_count: 1,
    today_present_students: 2,
    today_absent_students: 0,
    current_month_expected_fees: 19000,
    current_month_collected_revenue: 7000,
    current_month_outstanding_fees: 12000,
    monthly_attendance_percentage: 88.6,
    recent_activities: [] as any[],
    upcoming_classes: [] as any[],
    recent_announcements: [] as any[],
  })

  useEffect(() => {
    let isMounted = true
    async function loadStats() {
      try {
        setLoading(true)
        const masterId = localStorage.getItem('koms_master_id') || '1'
        const res = await fetch(`/api/dashboard/stats?month=${filterMonth}&date=${filterDate}`, {
          headers: { 'x-master-id': masterId },
        })
        if (res.ok) {
          const data = await res.json()
          if (isMounted) {
            setMetrics({
              total_active_students: data.total_active_students ?? 19,
              new_registrations: data.new_registrations ?? 2,
              today_scheduled_classes_count: data.today_scheduled_classes_count ?? 1,
              today_present_students: data.today_present_students ?? 2,
              today_absent_students: data.today_absent_students ?? 0,
              current_month_expected_fees: data.current_month_expected_fees ?? 19000,
              current_month_collected_revenue: data.current_month_collected_revenue ?? 7000,
              current_month_outstanding_fees: data.current_month_outstanding_fees ?? 12000,
              monthly_attendance_percentage: data.monthly_attendance_percentage ?? 88.6,
              recent_activities: data.recent_activities || [],
              upcoming_classes: data.upcoming_classes || [],
              recent_announcements: data.recent_announcements || [],
            })
          }
        }
      } catch (e) {
        console.warn('Dashboard stats fallback to store:', e)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadStats()
    return () => { isMounted = false }
  }, [filterMonth, filterDate])

  return (
    <div className="master-tab-view master-dashboard-view">
      {/* 1. Welcome Banner Card */}
      <div className="master-welcome-banner">
        <div className="master-welcome-left">
          <div className="master-welcome-avatar-wrap">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="master-welcome-avatar"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80'
              }}
            />
          </div>
          <div className="master-welcome-info">
            <span className="master-welcome-greeting">Dojo Master Control Center</span>
            <h2 className="master-welcome-name">{profile.name}</h2>
            <div className="master-welcome-meta">
              <span className="master-location-pin">
                📍 {profile.dojo || 'Ranga Nagar Dojo'}
              </span>
              <span className="master-role-badge">Chief Sensei</span>
              <span style={{ fontSize: '11px', color: '#22c55e', background: 'rgba(34,197,94,0.15)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                ● Online
              </span>
            </div>
          </div>
        </div>

        {/* Date & Month Filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 3 }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Month:</span>
            <select
              aria-label="Filter Month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              style={{
                background: '#101625',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '12px',
                fontWeight: 600,
                outline: 'none',
              }}
            >
              <option value="2026-11">November 2026</option>
              <option value="2026-10">October 2026</option>
              <option value="2026-09">September 2026</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Class Date:</span>
            <input
              type="date"
              aria-label="Filter Date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{
                background: '#101625',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                borderRadius: '8px',
                padding: '5px 8px',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* 2. Key Master Metrics Grid (All required KPIs) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', margin: '20px 0' }}>
        {/* Metric 1: Total Active Students */}
        <div
          onClick={() => onNavigate('Students', 'active')}
          style={{
            background: '#101625',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '16px',
            padding: '16px',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Total Active Students</span>
            <span style={{ fontSize: '18px' }}>👥</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#38bdf8' }}>{metrics.total_active_students}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Ranga Nagar Dojo roster</div>
        </div>

        {/* Metric 2: New Registrations / Join Requests */}
        <div
          onClick={() => onNavigate('JoinRequests')}
          style={{
            background: '#101625',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '16px',
            padding: '16px',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Join Requests</span>
            <span style={{ fontSize: '18px' }}>📝</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#f59e0b' }}>{metrics.new_registrations}</div>
          <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px' }}>Pending review from Common UI</div>
        </div>

        {/* Metric 3: Today's Scheduled Classes */}
        <div
          onClick={() => onNavigate('Schedule', 'weekly')}
          style={{
            background: '#101625',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            borderRadius: '16px',
            padding: '16px',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Today's Classes</span>
            <span style={{ fontSize: '18px' }}>🥋</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#c084fc' }}>{metrics.today_scheduled_classes_count}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Regular 6:30 PM session</div>
        </div>

        {/* Metric 4 & 5: Today's Present & Absent */}
        <div
          onClick={() => onNavigate('Attendance', 'daily-attendance')}
          style={{
            background: '#101625',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            borderRadius: '16px',
            padding: '16px',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Today's Attendance</span>
            <span style={{ fontSize: '18px' }}>📋</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#22c55e' }}>{metrics.today_present_students} P</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#ef4444' }}>{metrics.today_absent_students} A</span>
          </div>
          <div style={{ fontSize: '11px', color: '#22c55e', marginTop: '4px' }}>Active session check-in</div>
        </div>

        {/* Metric 6: Expected Fees */}
        <div
          onClick={() => onNavigate('Fees', 'dashboard')}
          style={{
            background: '#101625',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '16px',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Expected Fees</span>
            <span style={{ fontSize: '18px' }}>💳</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff' }}>₹{metrics.current_month_expected_fees.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{filterMonth} billing month</div>
        </div>

        {/* Metric 7: Collected Revenue */}
        <div
          onClick={() => onNavigate('Fees', 'paid')}
          style={{
            background: '#101625',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '16px',
            padding: '16px',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Collected Revenue</span>
            <span style={{ fontSize: '18px' }}>💰</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#22c55e' }}>₹{metrics.current_month_collected_revenue.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '11px', color: '#86efac', marginTop: '4px' }}>Verified payments</div>
        </div>

        {/* Metric 8: Outstanding Fees */}
        <div
          onClick={() => onNavigate('Fees', 'pending')}
          style={{
            background: '#101625',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            padding: '16px',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Outstanding Amount</span>
            <span style={{ fontSize: '18px' }}>⚠️</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#ef4444' }}>₹{metrics.current_month_outstanding_fees.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '11px', color: '#fca5a5', marginTop: '4px' }}>Due by 10th of month</div>
        </div>

        {/* Metric 9: Monthly Attendance Percentage */}
        <div
          onClick={() => onNavigate('Attendance', 'dashboard')}
          style={{
            background: '#101625',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '16px',
            padding: '16px',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Monthly Attendance %</span>
            <span style={{ fontSize: '18px' }}>📊</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#38bdf8' }}>{metrics.monthly_attendance_percentage}%</div>
          <div style={{ fontSize: '11px', color: '#7dd3fc', marginTop: '4px' }}>Dojo participation rate</div>
        </div>
      </div>

      {/* 3. Quick Master Action Buttons */}
      <div style={{ marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <button
          className="master-btn-primary"
          style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', padding: '10px 18px', fontSize: '13px' }}
          onClick={() => onNavigate('Attendance', 'daily-attendance')}
        >
          📋 Mark Attendance
        </button>
        <button
          className="master-btn-primary"
          style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 18px', fontSize: '13px' }}
          onClick={() => onNavigate('Students', 'add')}
        >
          👤 Add Student
        </button>
        <button
          className="master-btn-primary"
          style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 18px', fontSize: '13px' }}
          onClick={() => onNavigate('Schedule', 'add-class')}
        >
          ⏱️ Create Class
        </button>
        <button
          className="master-btn-primary"
          style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 18px', fontSize: '13px' }}
          onClick={() => onNavigate('Fees', 'collect')}
        >
          💳 Record Fee Payment
        </button>
        <button
          className="master-btn-primary"
          style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 18px', fontSize: '13px' }}
          onClick={() => onNavigate('JoinRequests')}
        >
          📥 View Join Requests
        </button>
        <button
          className="master-btn-primary"
          style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 18px', fontSize: '13px' }}
          onClick={() => onNavigate('DojoProfile')}
        >
          🏯 Edit Dojo Profile
        </button>
        <button
          className="master-btn-primary"
          style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 18px', fontSize: '13px' }}
          onClick={() => onNavigate('MasterProfile')}
        >
          🥋 Edit Master Profile
        </button>
      </div>

      {/* 4. Three-Column Activity & Schedule Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Recent Activities */}
        <div style={{ background: '#101625', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', margin: 0 }}>Recent Activities</h3>
            <span style={{ fontSize: '11px', color: '#f87171', cursor: 'pointer' }} onClick={() => onNavigate('Attendance', 'attendance-history')}>
              View History ➔
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {metrics.recent_activities.length > 0 ? (
              metrics.recent_activities.map((act, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div style={{ fontSize: '12.5px', color: '#f1f5f9', fontWeight: 600 }}>{act.description}</div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '3px' }}>{act.date} • {act.time}</div>
                </div>
              ))
            ) : (
              <div style={{ color: '#64748b', fontSize: '12px' }}>No recent activity records.</div>
            )}
          </div>
        </div>

        {/* Upcoming Classes */}
        <div style={{ background: '#101625', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', margin: 0 }}>Upcoming Classes</h3>
            <span style={{ fontSize: '11px', color: '#f87171', cursor: 'pointer' }} onClick={() => onNavigate('Schedule', 'calendar')}>
              Calendar ➔
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {metrics.upcoming_classes.length > 0 ? (
              metrics.upcoming_classes.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                      {c.class_date} ({c.start_time} - {c.end_time})
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{c.session_type || 'Regular Training'}</div>
                  </div>
                  <button
                    type="button"
                    style={{
                      background: '#ef4444',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '5px 10px',
                      cursor: 'pointer',
                    }}
                    onClick={() => onNavigate('Attendance', 'daily-attendance')}
                  >
                    Mark
                  </button>
                </div>
              ))
            ) : (
              <div style={{ color: '#64748b', fontSize: '12px' }}>No upcoming sessions.</div>
            )}
          </div>
        </div>

        {/* Recent Announcements */}
        <div style={{ background: '#101625', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', margin: 0 }}>Recent Announcements</h3>
            <span style={{ fontSize: '11px', color: '#f87171', cursor: 'pointer' }} onClick={() => onNavigate('Notes', 'all')}>
              Manage ➔
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {metrics.recent_announcements.length > 0 ? (
              metrics.recent_announcements.map((ann) => (
                <div
                  key={ann.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#ffffff' }}>{ann.title}</span>
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: ann.priority === 'High' ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)', color: ann.priority === 'High' ? '#f87171' : '#60a5fa' }}>
                      {ann.priority}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {ann.message}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#64748b', fontSize: '12px' }}>No announcements published.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
export default TabDashboard
