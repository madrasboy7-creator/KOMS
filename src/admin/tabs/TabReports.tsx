import React, { useState, useMemo } from 'react'

export interface TabReportsProps {
  activeSubTab?: string
  onSelectSubTab?: (subTab: string) => void
}

export const TabReports: React.FC<TabReportsProps> = ({ activeSubTab = 'overview', onSelectSubTab }) => {
  const [currentSubTab, setCurrentSubTab] = useState<string>(activeSubTab || 'overview')
  const [selectedYear, setSelectedYear] = useState<number>(2026)
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10')

  // Sync prop changes
  React.useEffect(() => {
    if (activeSubTab) setCurrentSubTab(activeSubTab)
  }, [activeSubTab])

  function handleTabChange(tab: string) {
    setCurrentSubTab(tab)
    if (onSelectSubTab) onSelectSubTab(tab)
  }

  // Sample data for reports
  const studentStats = {
    totalStudents: 48,
    activeStudents: 42,
    inactiveStudents: 6,
    avgAttendance: 88.4,
    belts: [
      { name: 'White Belt', count: 12, color: '#e2e8f0', percentage: 25 },
      { name: 'Yellow Belt', count: 10, color: '#facc15', percentage: 21 },
      { name: 'Orange Belt', count: 8, color: '#fb923c', percentage: 17 },
      { name: 'Green Belt', count: 9, color: '#16a34a', percentage: 19 },
      { name: 'Blue Belt', count: 4, color: '#2563eb', percentage: 8 },
      { name: 'Purple Belt', count: 3, color: '#9333ea', percentage: 6 },
      { name: 'Brown Belt', count: 1, color: '#78350f', percentage: 2 },
      { name: 'Black Belt (Dan)', count: 1, color: '#0f172a', percentage: 2 },
    ],
    ageGroups: [
      { group: 'Under 10 yrs', count: 14, pct: 29 },
      { group: '10 - 14 yrs', count: 22, pct: 46 },
      { group: '15 - 18 yrs', count: 8, pct: 17 },
      { group: '18+ Adults', count: 4, pct: 8 },
    ],
  }

  const monthlyRevenueData = [
    { month: 'Jan 2026', expected: 48000, collected: 46000, outstanding: 2000, rate: 95.8 },
    { month: 'Feb 2026', expected: 48000, collected: 45000, outstanding: 3000, rate: 93.7 },
    { month: 'Mar 2026', expected: 48000, collected: 47000, outstanding: 1000, rate: 97.9 },
    { month: 'Apr 2026', expected: 48000, collected: 44000, outstanding: 4000, rate: 91.6 },
    { month: 'May 2026', expected: 48000, collected: 46500, outstanding: 1500, rate: 96.8 },
    { month: 'Jun 2026', expected: 48000, collected: 45500, outstanding: 2500, rate: 94.7 },
    { month: 'Jul 2026', expected: 48000, collected: 48000, outstanding: 0, rate: 100 },
    { month: 'Aug 2026', expected: 48000, collected: 46000, outstanding: 2000, rate: 95.8 },
    { month: 'Sep 2026', expected: 48000, collected: 45000, outstanding: 3000, rate: 93.7 },
    { month: 'Oct 2026', expected: 48000, collected: 42000, outstanding: 6000, rate: 87.5 },
    { month: 'Nov 2026', expected: 48000, collected: 36000, outstanding: 12000, rate: 75.0 },
    { month: 'Dec 2026', expected: 48000, collected: 0, outstanding: 48000, rate: 0 },
  ]

  const paymentMethodBreakdown = [
    { method: 'UPI / Google Pay / PhonePe', count: 28, amount: 28000, pct: 66.7 },
    { method: 'Cash at Dojo Desk', count: 10, amount: 10000, pct: 23.8 },
    { method: 'Bank NEFT / IMPS', count: 4, amount: 4000, pct: 9.5 },
  ]

  const attendanceTrends = [
    { month: 'June', rate: 89.2, totalSessions: 14, totalCheckins: 524 },
    { month: 'July', rate: 92.5, totalSessions: 15, totalCheckins: 582 },
    { month: 'August', rate: 91.0, totalSessions: 14, totalCheckins: 546 },
    { month: 'September', rate: 87.8, totalSessions: 14, totalCheckins: 512 },
    { month: 'October', rate: 88.4, totalSessions: 15, totalCheckins: 556 },
  ]

  const topStudents = [
    { name: 'Arun Prasath', id: 'KOMS001', rank: 'White Belt', rate: 96, attended: 48 },
    { name: 'Meena R', id: 'KOMS003', rank: 'Yellow Belt', rate: 94, attended: 47 },
    { name: 'Karthik S', id: 'KOMS002', rank: 'Yellow Belt', rate: 92, attended: 46 },
    { name: 'Divya S', id: 'KOMS005', rank: 'Green Belt', rate: 90, attended: 45 },
    { name: 'Sanjay V', id: 'KOMS004', rank: 'Orange Belt', rate: 88, attended: 44 },
  ]

  // Export CSV Helper
  function exportCSV(title: string, headers: string[], rows: (string | number)[][]) {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_${selectedYear}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="master-tab-view master-reports-view">
      {/* Header */}
      <div className="master-pane-header">
        <div>
          <h2 className="master-pane-title">Reports & Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dojo operational analytics, fee collections, student demographics & attendance insights
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white border border-slate-300 text-slate-700 shadow-sm"
          >
            <option value={2025}>Year 2025</option>
            <option value={2026}>Year 2026</option>
            <option value={2027}>Year 2027</option>
          </select>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect width="12" height="8" x="6" y="14" />
            </svg>
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Submodule Navigation Bar */}
      <div className="master-filter-pill-bar" style={{ overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'students', label: 'Student Reports' },
          { id: 'fees', label: 'Fee Reports' },
          { id: 'revenue', label: 'Monthly Revenue' },
          { id: 'attendance', label: 'Attendance Trends' },
          { id: 'classes', label: 'Class Sessions' },
          { id: 'belts', label: 'Belt Distribution' },
          { id: 'annual', label: 'Annual Summary' },
        ].map((item) => (
          <button
            key={item.id}
            className={`master-filter-pill ${currentSubTab === item.id ? 'is-active' : ''}`}
            onClick={() => handleTabChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* SUBMODULE 1: OVERVIEW */}
      {(currentSubTab === 'overview' || !currentSubTab) && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="master-fee-kpi-grid">
            <div className="master-fee-kpi-card is-paid">
              <div className="master-fee-kpi-header">
                <span className="master-fee-badge-dot is-green" />
                <span className="master-fee-kpi-type">Active Students</span>
              </div>
              <strong className="master-fee-kpi-amount">{studentStats.activeStudents}</strong>
              <small className="master-fee-kpi-subtext">of {studentStats.totalStudents} registered</small>
            </div>

            <div className="master-fee-kpi-card is-pending">
              <div className="master-fee-kpi-header">
                <span className="master-fee-badge-dot is-orange" />
                <span className="master-fee-kpi-type">YTD Collected</span>
              </div>
              <strong className="master-fee-kpi-amount">₹ 4,81,000</strong>
              <small className="master-fee-kpi-subtext">Avg 94.2% Collection Rate</small>
            </div>

            <div className="master-fee-kpi-card is-overdue">
              <div className="master-fee-kpi-header">
                <span className="master-fee-badge-dot is-red" />
                <span className="master-fee-kpi-type">Outstanding Dues</span>
              </div>
              <strong className="master-fee-kpi-amount">₹ 12,000</strong>
              <small className="master-fee-kpi-subtext">Current Billing Month</small>
            </div>

            <div className="master-fee-kpi-card is-paid">
              <div className="master-fee-kpi-header">
                <span className="master-fee-badge-dot is-green" />
                <span className="master-fee-kpi-type">Attendance Average</span>
              </div>
              <strong className="master-fee-kpi-amount">{studentStats.avgAttendance}%</strong>
              <small className="master-fee-kpi-subtext">Across 15 Sessions This Month</small>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="master-card p-5">
            <h3 className="master-card-title-sm mb-4">Export Operational Reports</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() =>
                  exportCSV(
                    'Student_Roster',
                    ['Member ID', 'Name', 'Rank', 'Status', 'Attendance Pct', 'Monthly Fee'],
                    [
                      ['KOMS001', 'Arun Prasath', 'White Belt', 'Active', '95%', '1000'],
                      ['KOMS002', 'Karthik S', 'Yellow Belt', 'Active', '88%', '1000'],
                      ['KOMS003', 'Meena R', 'Yellow Belt', 'Active', '92%', '1000'],
                      ['KOMS004', 'Sanjay V', 'Orange Belt', 'Active', '80%', '1000'],
                      ['KOMS005', 'Divya S', 'Green Belt', 'Active', '85%', '1000'],
                    ]
                  )
                }
                className="p-4 rounded-xl border border-slate-200 hover:border-rose-400 hover:bg-rose-50/40 text-left transition group"
              >
                <div className="text-xl mb-1">👥</div>
                <strong className="block text-sm font-bold text-slate-800 group-hover:text-rose-700">Student Roster CSV</strong>
                <span className="text-xs text-slate-500">Download complete dojo membership list</span>
              </button>

              <button
                onClick={() =>
                  exportCSV(
                    'Monthly_Revenue_2026',
                    ['Month', 'Expected (INR)', 'Collected (INR)', 'Outstanding (INR)', 'Collection Rate Pct'],
                    monthlyRevenueData.map((d) => [d.month, d.expected, d.collected, d.outstanding, `${d.rate}%`])
                  )
                }
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-left transition group"
              >
                <div className="text-xl mb-1">💳</div>
                <strong className="block text-sm font-bold text-slate-800 group-hover:text-emerald-700">Fee Ledger CSV</strong>
                <span className="text-xs text-slate-500">Month-wise expected vs actual collections</span>
              </button>

              <button
                onClick={() =>
                  exportCSV(
                    'Attendance_Trends_2026',
                    ['Month', 'Attendance Rate Pct', 'Conducted Sessions', 'Total Check-ins'],
                    attendanceTrends.map((d) => [d.month, `${d.rate}%`, d.totalSessions, d.totalCheckins])
                  )
                }
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition group"
              >
                <div className="text-xl mb-1">📋</div>
                <strong className="block text-sm font-bold text-slate-800 group-hover:text-blue-700">Attendance Register CSV</strong>
                <span className="text-xs text-slate-500">Monthly dojo check-in and absence rates</span>
              </button>

              <button
                onClick={() =>
                  exportCSV(
                    'Belt_Distribution_2026',
                    ['Belt Rank', 'Student Count', 'Percentage'],
                    studentStats.belts.map((b) => [b.name, b.count, `${b.percentage}%`])
                  )
                }
                className="p-4 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 text-left transition group"
              >
                <div className="text-xl mb-1">🥋</div>
                <strong className="block text-sm font-bold text-slate-800 group-hover:text-purple-700">Belt Grading Roster CSV</strong>
                <span className="text-xs text-slate-500">Belt grade distribution and candidates</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMODULE 2: STUDENT REPORTS */}
      {currentSubTab === 'students' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Age Distribution */}
            <div className="master-card p-5">
              <h3 className="master-card-title-sm mb-3">Student Age Demographics</h3>
              <div className="space-y-3">
                {studentStats.ageGroups.map((g) => (
                  <div key={g.group}>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>{g.group}</span>
                      <span>{g.count} Students ({g.pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-rose-600 h-2.5 rounded-full"
                        style={{ width: `${g.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active vs Inactive */}
            <div className="master-card p-5">
              <h3 className="master-card-title-sm mb-3">Membership Health Ratio</h3>
              <div className="flex items-center justify-around py-4">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xl flex items-center justify-center mx-auto mb-2 border-2 border-emerald-400">
                    {studentStats.activeStudents}
                  </div>
                  <strong className="text-xs text-slate-800 block">Active Students</strong>
                  <span className="text-[11px] text-slate-500">87.5% Active Rate</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 font-bold text-xl flex items-center justify-center mx-auto mb-2 border-2 border-amber-400">
                    {studentStats.inactiveStudents}
                  </div>
                  <strong className="text-xs text-slate-800 block">Paused / On Leave</strong>
                  <span className="text-[11px] text-slate-500">12.5% Inactive</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBMODULE 3: FEE REPORTS */}
      {currentSubTab === 'fees' && (
        <div className="space-y-6">
          {/* Payment Method Distribution */}
          <div className="master-card p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="master-card-title-sm">Payment Collection Method Breakdown</h3>
              <span className="text-xs font-bold text-slate-500">October 2026</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paymentMethodBreakdown.map((pm) => (
                <div key={pm.method} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                  <span className="text-xs font-semibold text-slate-600 block">{pm.method}</span>
                  <strong className="text-lg font-bold text-slate-900 block mt-1">₹ {pm.amount.toLocaleString('en-IN')}</strong>
                  <span className="text-[11px] text-emerald-600 font-semibold">{pm.count} Payments ({pm.pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBMODULE 4: MONTHLY REVENUE */}
      {currentSubTab === 'revenue' && (
        <div className="space-y-6">
          <div className="master-card master-table-card">
            <div className="master-card-head-simple flex justify-between items-center">
              <h3 className="master-card-title-sm">Year {selectedYear} Monthly Revenue Ledger</h3>
              <button
                onClick={() =>
                  exportCSV(
                    `Monthly_Revenue_${selectedYear}`,
                    ['Month', 'Expected (INR)', 'Collected (INR)', 'Outstanding (INR)', 'Collection Rate'],
                    monthlyRevenueData.map((d) => [d.month, d.expected, d.collected, d.outstanding, `${d.rate}%`])
                  )
                }
                className="text-xs text-rose-600 font-bold hover:underline"
              >
                📥 Export CSV
              </button>
            </div>

            <div className="master-table-responsive">
              <table className="master-data-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Expected</th>
                    <th>Collected</th>
                    <th>Outstanding</th>
                    <th>Rate</th>
                    <th style={{ textAlign: 'right' }}>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyRevenueData.map((row) => (
                    <tr key={row.month}>
                      <td><strong>{row.month}</strong></td>
                      <td>₹ {row.expected.toLocaleString('en-IN')}</td>
                      <td className="text-emerald-600 font-semibold">₹ {row.collected.toLocaleString('en-IN')}</td>
                      <td className={row.outstanding > 0 ? 'text-rose-600 font-semibold' : 'text-slate-400'}>
                        ₹ {row.outstanding.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className={`master-status-pill ${row.rate >= 95 ? 'is-paid' : row.rate >= 80 ? 'is-pending' : 'is-overdue'}`}>
                          {row.rate}%
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="w-24 bg-slate-100 rounded-full h-2 inline-block overflow-hidden align-middle">
                          <div
                            className={`h-2 rounded-full ${row.rate >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${row.rate}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBMODULE 5: ATTENDANCE TRENDS */}
      {currentSubTab === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Top Consistent Students */}
            <div className="master-card master-table-card">
              <div className="master-card-head-simple">
                <h3 className="master-card-title-sm">Top 5 Most Disciplined Students</h3>
              </div>
              <div className="master-table-responsive">
                <table className="master-data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Rank</th>
                      <th>Attended</th>
                      <th>Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topStudents.map((st) => (
                      <tr key={st.id}>
                        <td>
                          <strong>{st.name}</strong>
                          <span className="block text-[11px] text-slate-400">{st.id}</span>
                        </td>
                        <td><span className="text-xs text-slate-600">{st.rank}</span></td>
                        <td>{st.attended} Sessions</td>
                        <td>
                          <span className="text-emerald-600 font-bold">{st.rate}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly Trend Table */}
            <div className="master-card master-table-card">
              <div className="master-card-head-simple">
                <h3 className="master-card-title-sm">Monthly Attendance Rates</h3>
              </div>
              <div className="master-table-responsive">
                <table className="master-data-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Conducted</th>
                      <th>Total Check-ins</th>
                      <th>Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceTrends.map((tr) => (
                      <tr key={tr.month}>
                        <td><strong>{tr.month} 2026</strong></td>
                        <td>{tr.totalSessions} Classes</td>
                        <td>{tr.totalCheckins}</td>
                        <td>
                          <span className="text-rose-600 font-bold">{tr.rate}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBMODULE 6: CLASS SESSIONS */}
      {currentSubTab === 'classes' && (
        <div className="master-card master-table-card">
          <div className="master-card-head-simple">
            <h3 className="master-card-title-sm">Class Sessions Conducted Breakdown</h3>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
              <span className="text-xs text-slate-500 font-semibold block">Total Classes Scheduled</span>
              <strong className="text-2xl font-bold text-slate-900 block mt-1">144</strong>
              <small className="text-emerald-600 font-semibold">97.2% Completion Rate</small>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
              <span className="text-xs text-slate-500 font-semibold block">Average Attendance / Class</span>
              <strong className="text-2xl font-bold text-slate-900 block mt-1">38.4</strong>
              <small className="text-slate-500">Students on Tatami</small>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
              <span className="text-xs text-slate-500 font-semibold block">Sessions Cancelled / Suspended</span>
              <strong className="text-2xl font-bold text-rose-600 block mt-1">4</strong>
              <small className="text-slate-500">Due to monsoon / holidays</small>
            </div>
          </div>
        </div>
      )}

      {/* SUBMODULE 7: BELT DISTRIBUTION */}
      {currentSubTab === 'belts' && (
        <div className="master-card master-table-card">
          <div className="master-card-head-simple flex justify-between items-center">
            <h3 className="master-card-title-sm">Current Dojo Belt Roster & Progression</h3>
            <button
              onClick={() =>
                exportCSV(
                  'Belt_Distribution',
                  ['Belt Rank', 'Count', 'Percentage'],
                  studentStats.belts.map((b) => [b.name, b.count, `${b.percentage}%`])
                )
              }
              className="text-xs text-rose-600 font-bold hover:underline"
            >
              📥 Export CSV
            </button>
          </div>

          <div className="master-table-responsive">
            <table className="master-data-table">
              <thead>
                <tr>
                  <th>Belt Rank</th>
                  <th>Student Count</th>
                  <th>Ratio</th>
                  <th style={{ textAlign: 'right' }}>Distribution Bar</th>
                </tr>
              </thead>
              <tbody>
                {studentStats.belts.map((belt) => (
                  <tr key={belt.name}>
                    <td>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-300"
                          style={{ backgroundColor: belt.color }}
                        />
                        <strong>{belt.name}</strong>
                      </div>
                    </td>
                    <td>{belt.count} Students</td>
                    <td>{belt.percentage}%</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="w-32 bg-slate-100 rounded-full h-2 inline-block overflow-hidden align-middle">
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${belt.percentage * 3}%`, backgroundColor: belt.color === '#e2e8f0' ? '#94a3b8' : belt.color }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBMODULE 8: ANNUAL SUMMARY */}
      {currentSubTab === 'annual' && (
        <div className="space-y-6">
          <div className="master-card p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Ranga Nagar Dojo – Annual Summary {selectedYear}</h3>
                <p className="text-xs text-slate-500">Chief Instructor: Sensei Rubeshwaren (4th Dan)</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                Status: Operational & Compliant
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-slate-100 my-4">
              <div>
                <span className="text-xs text-slate-400 block">Total Revenue</span>
                <strong className="text-xl font-bold text-slate-900">₹ 5,34,500</strong>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">New Enrolments</span>
                <strong className="text-xl font-bold text-emerald-600">+ 18 Students</strong>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Belt Graduations</span>
                <strong className="text-xl font-bold text-indigo-600">32 Promoted</strong>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Tournaments Won</span>
                <strong className="text-xl font-bold text-amber-600">7 Medals</strong>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Official annual record certified by Okinawa Shorin Ryu Matsumura Seito Karate and Kobudo Association of India. All tuition fee ledgers, student attendance archives, and Dan ranks have been reviewed and approved.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

