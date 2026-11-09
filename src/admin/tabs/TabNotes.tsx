import React, { useState, useMemo, useEffect } from 'react'
import type { MasterNote } from '../masterData'

export interface TabNotesProps {
  notes: MasterNote[]
  onCreateNote?: () => void
  onDeleteNote?: (id: string) => void
  activeSubTab?: string
  onSelectSubTab?: (subTab: string) => void
}

export interface KomsAnnouncement {
  id: string
  title: string
  message: string
  category: 'General' | 'Grading' | 'Tournament' | 'Schedule' | 'Fees' | 'Holiday'
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  target_audience: 'all' | 'belt_groups' | 'selected'
  target_details?: string[]
  publish_date: string
  expiry_date?: string
  status: 'PUBLISHED' | 'SCHEDULED' | 'DRAFT' | 'ARCHIVED'
  read_count: number
  total_recipients: number
  created_by: string
}

export const TabNotes: React.FC<TabNotesProps> = ({
  notes,
  onCreateNote,
  onDeleteNote,
  activeSubTab = 'all',
  onSelectSubTab,
}) => {
  const [currentSubTab, setCurrentSubTab] = useState<string>(activeSubTab || 'all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  // Sync subTab
  useEffect(() => {
    if (activeSubTab) setCurrentSubTab(activeSubTab)
  }, [activeSubTab])

  function handleTabChange(tab: string) {
    setCurrentSubTab(tab)
    if (onSelectSubTab) onSelectSubTab(tab)
  }

  // Comprehensive Announcements State
  const [announcements, setAnnouncements] = useState<KomsAnnouncement[]>([
    {
      id: 'ann-1',
      title: 'State Karate Championship 2026 Selection Trials',
      message: 'Selection trials for the All India Karate Championship will be conducted on Saturday at 06:00 AM. Green belts and above are required to bring full sparring gear including shin guards and mouthguards.',
      category: 'Tournament',
      priority: 'High',
      target_audience: 'all',
      publish_date: '2026-10-24T09:00:00Z',
      expiry_date: '2026-11-05T23:59:59Z',
      status: 'PUBLISHED',
      read_count: 42,
      total_recipients: 48,
      created_by: 'Sensei Rubeshwaren',
    },
    {
      id: 'ann-2',
      title: 'Upcoming Belt Grading Examination - November 2026',
      message: 'Grading examination for White, Yellow, and Orange belts will take place on November 15. All candidates must complete 90% attendance requirement and settle monthly dues before submission of grading forms.',
      category: 'Grading',
      priority: 'Urgent',
      target_audience: 'belt_groups',
      target_details: ['White Belt', 'Yellow Belt', 'Orange Belt'],
      publish_date: '2026-10-20T10:30:00Z',
      expiry_date: '2026-11-16T23:59:59Z',
      status: 'PUBLISHED',
      read_count: 36,
      total_recipients: 40,
      created_by: 'Sensei Rubeshwaren',
    },
    {
      id: 'ann-3',
      title: 'Dojo Holiday for Deepavali Festival Celebration',
      message: 'Classes will be suspended from October 31 to November 02 for the Deepavali festival. Regular training sessions resume on Monday, November 03 at 06:30 PM.',
      category: 'Holiday',
      priority: 'Medium',
      target_audience: 'all',
      publish_date: '2026-10-15T08:00:00Z',
      expiry_date: '2026-11-03T23:59:59Z',
      status: 'PUBLISHED',
      read_count: 46,
      total_recipients: 48,
      created_by: 'Sensei Rubeshwaren',
    },
    {
      id: 'ann-4',
      title: 'Winter Karate Training Camp & Beach Gasshuku (Draft)',
      message: 'Annual seaside endurance training and Kata seminar at Covelong Beach. Includes morning sand running and wave resistance training.',
      category: 'Schedule',
      priority: 'Medium',
      target_audience: 'all',
      publish_date: '2026-11-10T09:00:00Z',
      status: 'DRAFT',
      read_count: 0,
      total_recipients: 48,
      created_by: 'Sensei Rubeshwaren',
    },
    {
      id: 'ann-5',
      title: 'Reminder: Monthly Tuition Settle Date (10th of Month)',
      message: 'Automated notice: Please ensure monthly tuition fees are settled via UPI or at the dojo desk by the 10th of every month.',
      category: 'Fees',
      priority: 'Low',
      target_audience: 'all',
      publish_date: '2026-11-01T08:00:00Z',
      status: 'SCHEDULED',
      read_count: 0,
      total_recipients: 48,
      created_by: 'Sensei Rubeshwaren',
    },
  ])

  // Create Form State
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [formCategory, setFormCategory] = useState<KomsAnnouncement['category']>('General')
  const [formPriority, setFormPriority] = useState<KomsAnnouncement['priority']>('Medium')
  const [formAudience, setFormAudience] = useState<KomsAnnouncement['target_audience']>('all')
  const [formStatus, setFormStatus] = useState<KomsAnnouncement['status']>('PUBLISHED')
  const [formExpiry, setFormExpiry] = useState('')

  // Read status modal state
  const [readStatusModalAnnouncement, setReadStatusModalAnnouncement] = useState<KomsAnnouncement | null>(null)

  // Filtered List
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      // Subtab filter
      if (currentSubTab === 'scheduled' && a.status !== 'SCHEDULED') return false
      if (currentSubTab === 'drafts' && a.status !== 'DRAFT') return false
      if (currentSubTab === 'archived' && a.status !== 'ARCHIVED') return false
      if (currentSubTab === 'all' && a.status === 'ARCHIVED') return false

      // Category filter
      if (categoryFilter !== 'all' && a.category !== categoryFilter) return false

      // Priority filter
      if (priorityFilter !== 'all' && a.priority !== priorityFilter) return false

      // Search
      if (
        searchQuery &&
        !a.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !a.message.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

      return true
    })
  }, [announcements, currentSubTab, categoryFilter, priorityFilter, searchQuery])

  // Handle Create Announcement
  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formTitle.trim() || !formMessage.trim()) {
      showToast('Title and message body are required.')
      return
    }

    const created: KomsAnnouncement = {
      id: `ann-${Date.now()}`,
      title: formTitle.trim(),
      message: formMessage.trim(),
      category: formCategory,
      priority: formPriority,
      target_audience: formAudience,
      publish_date: new Date().toISOString(),
      expiry_date: formExpiry || undefined,
      status: formStatus,
      read_count: 0,
      total_recipients: 48,
      created_by: 'Sensei Rubeshwaren',
    }

    setAnnouncements((prev) => [created, ...prev])

    // Backend call
    try {
      fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created),
      }).catch(() => {})
    } catch (_) {}

    showToast(`Announcement "${formTitle}" created successfully!`)
    setCreateModalOpen(false)
    setFormTitle('')
    setFormMessage('')
  }

  // Handle Archive / Delete
  function handleArchiveAnnouncement(id: string) {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'ARCHIVED' } : a))
    )
    showToast('Announcement moved to Archive.')
  }

  // Sample read recipients
  const sampleRecipients = [
    { name: 'Arun Prasath', code: 'KOMS001', read: true, time: '24 Oct, 09:15 AM' },
    { name: 'Karthik S', code: 'KOMS002', read: true, time: '24 Oct, 10:20 AM' },
    { name: 'Meena R', code: 'KOMS003', read: true, time: '24 Oct, 11:05 AM' },
    { name: 'Sanjay V', code: 'KOMS004', read: true, time: '24 Oct, 01:40 PM' },
    { name: 'Divya S', code: 'KOMS005', read: false, time: 'Unread' },
    { name: 'Prakash M', code: 'KOMS006', read: false, time: 'Unread' },
  ]

  return (
    <div className="master-tab-view master-notes-view">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold border border-rose-500/50 flex items-center gap-2">
          <span>📢</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="master-pane-header">
        <div>
          <h2 className="master-pane-title">Announcements & Circulars</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Broadcast messages, tournament alerts, schedule updates & recipient read tracking
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="master-btn-primary flex items-center gap-1.5"
        >
          <span>+</span>
          <span>Create Announcement</span>
        </button>
      </div>

      {/* Submodule Navigation Bar */}
      <div className="master-filter-pill-bar" style={{ overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'all', label: 'All Active Announcements' },
          { id: 'create', label: '+ Create' },
          { id: 'scheduled', label: `Scheduled (${announcements.filter((a) => a.status === 'SCHEDULED').length})` },
          { id: 'drafts', label: `Drafts (${announcements.filter((a) => a.status === 'DRAFT').length})` },
          { id: 'archived', label: `Archived (${announcements.filter((a) => a.status === 'ARCHIVED').length})` },
        ].map((item) => (
          <button
            key={item.id}
            className={`master-filter-pill ${currentSubTab === item.id ? 'is-active' : ''}`}
            onClick={() => {
              if (item.id === 'create') setCreateModalOpen(true)
              else handleTabChange(item.id)
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="master-search-filter-bar">
        <div className="master-search-input-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="master-search-icon">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="master-search-input"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="master-select-pill" style={{ minWidth: '130px' }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="General">General</option>
            <option value="Grading">Grading</option>
            <option value="Tournament">Tournament</option>
            <option value="Schedule">Schedule</option>
            <option value="Holiday">Holiday</option>
            <option value="Fees">Fees</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="master-select-pill" style={{ minWidth: '120px' }}>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Announcement Cards List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((ann) => {
          const readPct = ann.total_recipients > 0 ? Math.round((ann.read_count / ann.total_recipients) * 100) : 0
          return (
            <div key={ann.id} className="master-card p-5 border border-slate-200 hover:border-slate-300 transition space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      ann.priority === 'Urgent'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : ann.priority === 'High'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {ann.priority} Priority
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {ann.category}
                  </span>

                  <span className="text-xs text-slate-400">• Audience: <strong>{ann.target_audience === 'all' ? 'All Students' : 'Selected Groups'}</strong></span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ann.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ann.status === 'SCHEDULED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {ann.status}
                  </span>

                  <button
                    onClick={() => handleArchiveAnnouncement(ann.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 text-xs"
                    title="Archive Announcement"
                  >
                    📥
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">{ann.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{ann.message}</p>

              {/* Footer: Read tracker & publish date */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap justify-between items-center text-xs gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">
                    Published: <strong>{new Date(ann.publish_date).toLocaleDateString('en-GB')}</strong>
                  </span>
                  <span className="text-slate-400">• By {ann.created_by}</span>
                </div>

                {/* Read Status Tracker */}
                <button
                  onClick={() => setReadStatusModalAnnouncement(ann)}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition"
                >
                  <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full"
                      style={{ width: `${readPct}%` }}
                    />
                  </div>
                  <strong className="text-slate-800 text-[11px]">
                    {ann.read_count}/{ann.total_recipients} Read ({readPct}%)
                  </strong>
                  <span className="text-slate-400 text-xs">›</span>
                </button>
              </div>
            </div>
          )
        })}

        {filteredAnnouncements.length === 0 && (
          <div className="master-card p-12 text-center text-slate-400 text-xs">
            No announcements found in this view.
          </div>
        )}
      </div>

      {/* CREATE ANNOUNCEMENT MODAL */}
      {createModalOpen && (
        <div className="master-modal-backdrop" onClick={() => setCreateModalOpen(false)}>
          <div
            className="master-modal-content p-6 max-w-xl w-full bg-white rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create New Announcement</h3>
                <p className="text-xs text-slate-500">Publish notices to students, parents & dojo groups</p>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Announcement Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Belt Grading Examination - November 2026"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Message Content *</label>
                <textarea
                  rows={4}
                  placeholder="Type official circular message here..."
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="General">General Notice</option>
                    <option value="Grading">Belt Grading</option>
                    <option value="Tournament">Tournament</option>
                    <option value="Schedule">Schedule Update</option>
                    <option value="Holiday">Dojo Holiday</option>
                    <option value="Fees">Fee Reminder</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-bold"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent Circular</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Audience</label>
                  <select
                    value={formAudience}
                    onChange={(e) => setFormAudience(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="all">All Assigned Students</option>
                    <option value="belt_groups">Selected Belt Groups</option>
                    <option value="selected">Selected Individual Students</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Publishing Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-bold"
                  >
                    <option value="PUBLISHED">Publish Immediately</option>
                    <option value="SCHEDULED">Schedule for Later</option>
                    <option value="DRAFT">Save as Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={formExpiry}
                  onChange={(e) => setFormExpiry(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold border border-slate-300 rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700 shadow-sm"
                >
                  Broadcast Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* READ STATUS MODAL */}
      {readStatusModalAnnouncement && (
        <div className="master-modal-backdrop" onClick={() => setReadStatusModalAnnouncement(null)}>
          <div
            className="master-modal-content p-5 max-w-md w-full bg-white rounded-xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 mb-3">
              <h4 className="text-sm font-bold text-slate-900">
                Recipient Read Tracking
              </h4>
              <button onClick={() => setReadStatusModalAnnouncement(null)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3 font-semibold">
              {readStatusModalAnnouncement.title}
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {sampleRecipients.map((rec) => (
                <div key={rec.code} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 text-xs">
                  <div>
                    <strong className="text-slate-800 block">{rec.name}</strong>
                    <span className="text-[10px] text-slate-400">{rec.code}</span>
                  </div>
                  <div>
                    {rec.read ? (
                      <span className="text-emerald-600 font-bold text-[11px]">✓ Read: {rec.time}</span>
                    ) : (
                      <span className="text-slate-400 font-semibold text-[11px]">○ Unread</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 mt-4 flex justify-end">
              <button
                onClick={() => setReadStatusModalAnnouncement(null)}
                className="px-4 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
