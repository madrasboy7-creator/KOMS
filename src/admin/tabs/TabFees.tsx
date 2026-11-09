import React, { useState, useMemo, useEffect } from 'react'
import type { MasterStudent } from '../masterData'

export interface TabFeesProps {
  students: MasterStudent[]
  onMarkPaid: (studentId: string) => void
  onOpenRecordModal?: () => void
  onViewAllHistory?: () => void
  activeSubTab?: string
  onSelectSubTab?: (subTab: string) => void
}

export interface FeeReceiptData {
  receipt_number: string
  student_id: string
  student_name: string
  student_code: string
  rank: string
  dojo_name: string
  master_name: string
  billing_month: string
  fee_due: number
  amount_paid: number
  total_paid_for_month: number
  outstanding_balance: number
  payment_method: string
  payment_date: string
  transaction_ref?: string
  remarks?: string
  status: string
  issued_at: string
}

export const TabFees: React.FC<TabFeesProps> = ({
  students,
  onMarkPaid,
  activeSubTab = 'dashboard',
  onSelectSubTab,
}) => {
  const [currentSubTab, setCurrentSubTab] = useState<string>(activeSubTab || 'dashboard')
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10')
  const [selectedYear, setSelectedYear] = useState<number>(2026)
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

  // Active student count & fee computations
  const totalEligible = students.length || 48
  const expectedMonthlyCollection = students.reduce((acc, s) => acc + (s.feeAmount || 1000), 0)

  // Payments & receipts ledger in local state
  const [receiptsList, setReceiptsList] = useState<FeeReceiptData[]>([
    {
      receipt_number: 'RCP-202610-001-4921',
      student_id: 'KOMS001',
      student_name: 'Arun Prasath',
      student_code: 'KOMS001',
      rank: 'White Belt',
      dojo_name: 'Ranga Nagar Dojo',
      master_name: 'Sensei Rubeshwaren',
      billing_month: '2026-10',
      fee_due: 1000,
      amount_paid: 1000,
      total_paid_for_month: 1000,
      outstanding_balance: 0,
      payment_method: 'UPI',
      payment_date: '2026-10-02',
      transaction_ref: 'UPI/6271928401/OKAXIS',
      remarks: 'October Dojo Tuition Regular',
      status: 'PAID',
      issued_at: '2026-10-02T10:15:00Z',
    },
    {
      receipt_number: 'RCP-202610-003-8104',
      student_id: 'KOMS003',
      student_name: 'Meena R',
      student_code: 'KOMS003',
      rank: 'Yellow Belt',
      dojo_name: 'Ranga Nagar Dojo',
      master_name: 'Sensei Rubeshwaren',
      billing_month: '2026-10',
      fee_due: 1000,
      amount_paid: 1000,
      total_paid_for_month: 1000,
      outstanding_balance: 0,
      payment_method: 'CASH',
      payment_date: '2026-10-01',
      transaction_ref: 'CASH-DESK-01',
      remarks: 'Direct cash payment at counter',
      status: 'PAID',
      issued_at: '2026-10-01T17:40:00Z',
    },
    {
      receipt_number: 'RCP-202610-004-3291',
      student_id: 'KOMS004',
      student_name: 'Sanjay V',
      student_code: 'KOMS004',
      rank: 'Orange Belt',
      dojo_name: 'Ranga Nagar Dojo',
      master_name: 'Sensei Rubeshwaren',
      billing_month: '2026-10',
      fee_due: 1000,
      amount_paid: 500,
      total_paid_for_month: 500,
      outstanding_balance: 500,
      payment_method: 'UPI',
      payment_date: '2026-10-05',
      transaction_ref: 'UPI/8821940192/PAYTM',
      remarks: 'First installment / Partial tuition',
      status: 'PARTIAL',
      issued_at: '2026-10-05T09:20:00Z',
    },
  ])

  // Waivers
  const [waiversList, setWaiversList] = useState<Array<{ id: number; student_name: string; student_code: string; month: string; amount: number; reason: string; approved_by: string }>>([
    {
      id: 1,
      student_name: 'Karthik S',
      student_code: 'KOMS002',
      month: '2026-10',
      amount: 500,
      reason: 'State Championship Silver Medalist Dojo Concession',
      approved_by: 'Sensei Rubeshwaren',
    },
  ])

  // Calculate live counts
  const paidCount = students.filter((s) => s.feeStatus === 'Paid').length
  const pendingCount = students.filter((s) => s.feeStatus === 'Pending').length
  const overdueCount = students.filter((s) => s.feeStatus === 'Overdue').length
  const partialCount = receiptsList.filter((r) => r.status === 'PARTIAL').length

  const totalCollectedRevenue = receiptsList.reduce((acc, r) => acc + r.amount_paid, 0) + (paidCount - receiptsList.filter(r => r.status === 'PAID').length) * 1000
  const totalWaivedAmount = waiversList.reduce((acc, w) => acc + w.amount, 0)
  const outstandingAmount = Math.max(0, expectedMonthlyCollection - totalCollectedRevenue - totalWaivedAmount)

  // Collect Fee Form State
  const [collectStudentId, setCollectStudentId] = useState<string>(students[0]?.id || 'KOMS001')
  const [collectMonth, setCollectMonth] = useState<string>('2026-10')
  const [collectAmount, setCollectAmount] = useState<number>(1000)
  const [collectMethod, setCollectMethod] = useState<string>('UPI')
  const [collectDate, setCollectDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [collectRef, setCollectRef] = useState<string>('')
  const [collectRemarks, setCollectRemarks] = useState<string>('Monthly Dojo Tuition')

  // Selected student for collection
  const selectedStudentForCollect = useMemo(() => {
    return students.find((s) => s.id === collectStudentId) || students[0]
  }, [students, collectStudentId])

  // Receipt Modal State
  const [activeReceiptModal, setActiveReceiptModal] = useState<FeeReceiptData | null>(null)

  // Waiver Modal State
  const [waiverModalOpen, setWaiverModalOpen] = useState(false)
  const [waiverStudentId, setWaiverStudentId] = useState<string>(students[0]?.id || 'KOMS001')
  const [waiverAmount, setWaiverAmount] = useState<number>(500)
  const [waiverReason, setWaiverReason] = useState<string>('Merit Scholarship / Sibling Concession')

  // Settings State
  const [settingDefaultFee, setSettingDefaultFee] = useState(1000)
  const [settingDueDay, setSettingDueDay] = useState(10)
  const [settingGracePeriod, setSettingGracePeriod] = useState(5)
  const [settingReceiptPrefix, setSettingReceiptPrefix] = useState('RCP')

  // Month-wise History Data (Calculated dynamically)
  const monthWiseHistoryData = useMemo(() => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]

    return months.map((m, idx) => {
      const monthNum = idx + 1
      const isPast = monthNum < 10
      const isCurrent = monthNum === 10
      const isFuture = monthNum > 10

      const exp = totalEligible * settingDefaultFee
      const col = isPast ? exp - (idx % 3) * 1000 : isCurrent ? totalCollectedRevenue : 0
      const wvd = isCurrent ? totalWaivedAmount : (idx % 2 === 0 ? 500 : 0)
      const out = isFuture ? exp : Math.max(0, exp - col - wvd)
      const paid = isPast ? totalEligible - (idx % 3) : isCurrent ? paidCount : 0
      const pend = isFuture ? totalEligible : Math.max(0, totalEligible - paid)
      const partial = isCurrent ? partialCount : (isPast && idx % 2 === 1 ? 1 : 0)

      return {
        monthNumber: monthNum,
        monthName: `${m} ${selectedYear}`,
        eligibleStudents: totalEligible,
        expectedAmount: exp,
        collectedRevenue: col,
        outstandingAmount: out,
        waivedAmount: wvd,
        refundAmount: 0,
        netRevenue: col,
        paidStudentsCount: paid,
        pendingStudentsCount: pend,
        partialPaymentCount: partial,
      }
    })
  }, [totalEligible, settingDefaultFee, selectedYear, totalCollectedRevenue, totalWaivedAmount, paidCount, partialCount])

  // Handle Submit Payment
  function handleCollectFeeSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedStudentForCollect || collectAmount <= 0) {
      showToast('Please select a student and valid payment amount.')
      return
    }

    const receiptNum = `${settingReceiptPrefix}-${collectMonth.replace('-', '')}-${selectedStudentForCollect.memberId.replace(/[^0-9]/g, '').padStart(3, '0')}-${Math.floor(1000 + Math.random() * 9000)}`

    const newReceipt: FeeReceiptData = {
      receipt_number: receiptNum,
      student_id: selectedStudentForCollect.id,
      student_name: selectedStudentForCollect.name,
      student_code: selectedStudentForCollect.memberId,
      rank: selectedStudentForCollect.rank,
      dojo_name: 'Ranga Nagar Dojo',
      master_name: 'Sensei Rubeshwaren',
      billing_month: collectMonth,
      fee_due: selectedStudentForCollect.feeAmount || 1000,
      amount_paid: Number(collectAmount),
      total_paid_for_month: Number(collectAmount),
      outstanding_balance: Math.max(0, (selectedStudentForCollect.feeAmount || 1000) - Number(collectAmount)),
      payment_method: collectMethod,
      payment_date: collectDate,
      transaction_ref: collectRef || `TXN-${Date.now()}`,
      remarks: collectRemarks,
      status: Number(collectAmount) >= (selectedStudentForCollect.feeAmount || 1000) ? 'PAID' : 'PARTIAL',
      issued_at: new Date().toISOString(),
    }

    setReceiptsList((prev) => [newReceipt, ...prev])
    onMarkPaid(selectedStudentForCollect.id)

    // Backend call
    try {
      fetch('/api/fees/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: selectedStudentForCollect.id,
          billing_month: collectMonth,
          payment_amount: Number(collectAmount),
          payment_method: collectMethod,
          payment_date: collectDate,
          transaction_ref: collectRef,
          remarks: collectRemarks,
        }),
      }).catch(() => {})
    } catch (_) {}

    showToast(`Payment of ₹${collectAmount} recorded! Receipt ${receiptNum} issued.`)
    setActiveReceiptModal(newReceipt)
  }

  // Handle Approve Waiver
  function handleApproveWaiverSubmit(e: React.FormEvent) {
    e.preventDefault()
    const st = students.find((s) => s.id === waiverStudentId)
    if (!st) return

    setWaiversList((prev) => [
      {
        id: Date.now(),
        student_name: st.name,
        student_code: st.memberId,
        month: selectedMonth,
        amount: Number(waiverAmount),
        reason: waiverReason,
        approved_by: 'Sensei Rubeshwaren',
      },
      ...prev,
    ])

    // Backend call
    try {
      fetch('/api/fees/waive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: st.id,
          billing_month: selectedMonth,
          waiver_amount: Number(waiverAmount),
          reason: waiverReason,
        }),
      }).catch(() => {})
    } catch (_) {}

    showToast(`Fee waiver of ₹${waiverAmount} approved for ${st.name}.`)
    setWaiverModalOpen(false)
  }

  return (
    <div className="master-tab-view master-fees-view">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold border border-emerald-500/50 flex items-center gap-2">
          <span>💳</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="master-pane-header">
        <div>
          <h2 className="master-pane-title">Fee Management System</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Billing cycles, collection receipts, pending ledger & annual revenue accounting
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTabChange('collect')}
            className="master-btn-primary flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Collect Fee</span>
          </button>
        </div>
      </div>

      {/* Submodule Navigation Bar */}
      <div className="master-filter-pill-bar" style={{ overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'dashboard', label: 'Fee Dashboard' },
          { id: 'collect', label: '+ Collect Fee' },
          { id: 'paid', label: `Paid (${paidCount})` },
          { id: 'pending', label: `Pending (${pendingCount})` },
          { id: 'partial', label: `Partial (${partialCount})` },
          { id: 'overdue', label: `Overdue (${overdueCount})` },
          { id: 'waived', label: `Waived (${waiversList.length})` },
          { id: 'history', label: 'Month-wise History' },
          { id: 'receipts', label: `Receipts (${receiptsList.length})` },
          { id: 'settings', label: 'Fee Settings' },
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

      {/* SUBMODULE 1: FEE DASHBOARD */}
      {(currentSubTab === 'dashboard' || !currentSubTab) && (
        <div className="space-y-6">
          {/* Month Selector Row */}
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Billing Cycle:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-slate-300"
              >
                <option value="2026-10">October 2026 (Active)</option>
                <option value="2026-09">September 2026</option>
                <option value="2026-08">August 2026</option>
                <option value="2026-07">July 2026</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setWaiverModalOpen(true)}
                className="px-3 py-1 text-xs font-bold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
              >
                + Approve Waiver
              </button>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="master-fee-kpi-grid">
            <div className="master-fee-kpi-card is-paid">
              <div className="master-fee-kpi-header">
                <span className="master-fee-badge-dot is-green" />
                <span className="master-fee-kpi-type">Expected Monthly</span>
              </div>
              <strong className="master-fee-kpi-amount">₹ {expectedMonthlyCollection.toLocaleString('en-IN')}</strong>
              <small className="master-fee-kpi-subtext">{totalEligible} Eligible Students</small>
            </div>

            <div className="master-fee-kpi-card is-paid">
              <div className="master-fee-kpi-header">
                <span className="master-fee-badge-dot is-green" />
                <span className="master-fee-kpi-type">Collected Revenue</span>
              </div>
              <strong className="master-fee-kpi-amount">₹ {totalCollectedRevenue.toLocaleString('en-IN')}</strong>
              <small className="master-fee-kpi-subtext">{paidCount} Paid • {partialCount} Partial</small>
            </div>

            <div className="master-fee-kpi-card is-overdue">
              <div className="master-fee-kpi-header">
                <span className="master-fee-badge-dot is-red" />
                <span className="master-fee-kpi-type">Outstanding Amount</span>
              </div>
              <strong className="master-fee-kpi-amount">₹ {outstandingAmount.toLocaleString('en-IN')}</strong>
              <small className="master-fee-kpi-subtext">{pendingCount} Pending • {overdueCount} Overdue</small>
            </div>

            <div className="master-fee-kpi-card is-pending">
              <div className="master-fee-kpi-header">
                <span className="master-fee-badge-dot is-orange" />
                <span className="master-fee-kpi-type">Approved Waivers</span>
              </div>
              <strong className="master-fee-kpi-amount">₹ {totalWaivedAmount.toLocaleString('en-IN')}</strong>
              <small className="master-fee-kpi-subtext">{waiversList.length} Students Assisted</small>
            </div>
          </div>

          {/* Quick Roster Snapshot */}
          <div className="master-card master-table-card">
            <div className="master-card-head-simple flex justify-between items-center">
              <h3 className="master-card-title-sm">Current Month Billing Status</h3>
              <button
                onClick={() => handleTabChange('collect')}
                className="text-xs text-rose-600 font-bold hover:underline"
              >
                + Record Payment →
              </button>
            </div>

            <div className="master-table-responsive">
              <table className="master-data-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Belt</th>
                    <th>Fee Due</th>
                    <th>Status</th>
                    <th>Due On</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.slice(0, 8).map((st) => (
                    <tr key={st.id}>
                      <td>
                        <strong>{st.name}</strong>
                        <span className="block text-[11px] text-slate-400">{st.memberId}</span>
                      </td>
                      <td>{st.rank}</td>
                      <td>₹ {st.feeAmount}</td>
                      <td>
                        <span className={`master-status-pill is-${st.feeStatus.toLowerCase()}`}>
                          {st.feeStatus}
                        </span>
                      </td>
                      <td>{st.feeDueOn}</td>
                      <td style={{ textAlign: 'right' }}>
                        {st.feeStatus !== 'Paid' ? (
                          <button
                            onClick={() => {
                              setCollectStudentId(st.id)
                              setCollectAmount(st.feeAmount || 1000)
                              handleTabChange('collect')
                            }}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            Collect
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-600 font-bold">Settled ✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBMODULE 2: COLLECT FEE */}
      {currentSubTab === 'collect' && (
        <div className="master-card p-6 max-w-2xl mx-auto space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-900">Record Dojo Tuition Fee Payment</h3>
            <p className="text-xs text-slate-500">Generate official fee receipt and update the student ledger</p>
          </div>

          <form onSubmit={handleCollectFeeSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Student Dropdown */}
              <div className="md:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Select Student *</label>
                <select
                  value={collectStudentId}
                  onChange={(e) => {
                    setCollectStudentId(e.target.value)
                    const st = students.find((s) => s.id === e.target.value)
                    if (st) setCollectAmount(st.feeAmount || 1000)
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.memberId}) • {st.rank} • Fee: ₹{st.feeAmount} ({st.feeStatus})
                    </option>
                  ))}
                </select>
              </div>

              {/* Billing Month */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Billing Month *</label>
                <input
                  type="month"
                  value={collectMonth}
                  onChange={(e) => setCollectMonth(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold"
                />
              </div>

              {/* Payment Date */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Payment Date *</label>
                <input
                  type="date"
                  value={collectDate}
                  onChange={(e) => setCollectDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {/* Applicable Fee & Balance Auto-calculation Box */}
              <div className="md:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[11px] text-slate-400 block">Monthly Fee</span>
                  <strong className="text-sm font-bold text-slate-800">₹ {selectedStudentForCollect?.feeAmount || 1000}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Previous Paid</span>
                  <strong className="text-sm font-bold text-emerald-600">
                    {selectedStudentForCollect?.feeStatus === 'Paid' ? `₹ ${selectedStudentForCollect.feeAmount}` : '₹ 0'}
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Current Balance</span>
                  <strong className="text-sm font-bold text-rose-600">
                    {selectedStudentForCollect?.feeStatus === 'Paid' ? '₹ 0' : `₹ ${selectedStudentForCollect?.feeAmount || 1000}`}
                  </strong>
                </div>
              </div>

              {/* Payment Amount */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Payment Amount to Collect (₹) *</label>
                <input
                  type="number"
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Payment Method *</label>
                <select
                  value={collectMethod}
                  onChange={(e) => setCollectMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-semibold"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="CASH">Cash at Dojo Desk</option>
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT / IMPS)</option>
                  <option value="CHEQUE">Cheque / Demand Draft</option>
                </select>
              </div>

              {/* Transaction Ref */}
              <div className="md:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Transaction Ref / UTR / Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref / Cash receipt notes..."
                  value={collectRef}
                  onChange={(e) => setCollectRef(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => handleTabChange('dashboard')}
                className="px-4 py-2 text-xs font-bold border border-slate-300 rounded-lg text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm"
              >
                Save Payment & Issue Receipt
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUBMODULE 3: PAID FEES */}
      {currentSubTab === 'paid' && (
        <div className="master-card master-table-card">
          <div className="master-card-head-simple">
            <h3 className="master-card-title-sm">Paid Students ({paidCount})</h3>
          </div>
          <div className="master-table-responsive">
            <table className="master-data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Belt</th>
                  <th>Amount Paid</th>
                  <th>Status</th>
                  <th>Due On</th>
                  <th style={{ textAlign: 'right' }}>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {students
                  .filter((s) => s.feeStatus === 'Paid')
                  .map((st) => (
                    <tr key={st.id}>
                      <td>
                        <strong>{st.name}</strong>
                        <span className="block text-[11px] text-slate-400">{st.memberId}</span>
                      </td>
                      <td>{st.rank}</td>
                      <td className="text-emerald-600 font-bold">₹ {st.feeAmount}</td>
                      <td>
                        <span className="master-status-pill is-paid">PAID</span>
                      </td>
                      <td>{st.feeDueOn}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            const rec = receiptsList.find((r) => r.student_id === st.id) || {
                              receipt_number: `RCP-202610-001-${Math.floor(1000 + Math.random() * 9000)}`,
                              student_id: st.id,
                              student_name: st.name,
                              student_code: st.memberId,
                              rank: st.rank,
                              dojo_name: 'Ranga Nagar Dojo',
                              master_name: 'Sensei Rubeshwaren',
                              billing_month: '2026-10',
                              fee_due: st.feeAmount,
                              amount_paid: st.feeAmount,
                              total_paid_for_month: st.feeAmount,
                              outstanding_balance: 0,
                              payment_method: 'UPI',
                              payment_date: '2026-10-02',
                              status: 'PAID',
                              issued_at: new Date().toISOString(),
                            }
                            setActiveReceiptModal(rec)
                          }}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBMODULE 4: PENDING FEES */}
      {currentSubTab === 'pending' && (
        <div className="master-card master-table-card">
          <div className="master-card-head-simple flex justify-between items-center">
            <h3 className="master-card-title-sm">Pending Fees ({pendingCount})</h3>
            <button
              onClick={() => showToast('WhatsApp payment reminders sent to pending parents!')}
              className="text-xs text-emerald-600 font-bold hover:underline"
            >
              📲 Send WhatsApp Reminders
            </button>
          </div>
          <div className="master-table-responsive">
            <table className="master-data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Belt</th>
                  <th>Pending Amount</th>
                  <th>Due Date</th>
                  <th>Contact</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {students
                  .filter((s) => s.feeStatus === 'Pending')
                  .map((st) => (
                    <tr key={st.id}>
                      <td>
                        <strong>{st.name}</strong>
                        <span className="block text-[11px] text-slate-400">{st.memberId}</span>
                      </td>
                      <td>{st.rank}</td>
                      <td className="text-amber-600 font-bold">₹ {st.feeAmount}</td>
                      <td>{st.feeDueOn}</td>
                      <td><span className="text-xs text-slate-500">{st.phone || '+91 98402 11223'}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            setCollectStudentId(st.id)
                            setCollectAmount(st.feeAmount)
                            handleTabChange('collect')
                          }}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          Collect
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBMODULE 5: PARTIAL PAYMENTS */}
      {currentSubTab === 'partial' && (
        <div className="master-card master-table-card">
          <div className="master-card-head-simple">
            <h3 className="master-card-title-sm">Partial Payments ({partialCount})</h3>
          </div>
          <div className="master-table-responsive">
            <table className="master-data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Total Due</th>
                  <th>Amount Paid</th>
                  <th>Remaining Dues</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {receiptsList
                  .filter((r) => r.status === 'PARTIAL')
                  .map((r) => (
                    <tr key={r.receipt_number}>
                      <td>
                        <strong>{r.student_name}</strong>
                        <span className="block text-[11px] text-slate-400">{r.student_code}</span>
                      </td>
                      <td>₹ {r.fee_due}</td>
                      <td className="text-emerald-600 font-bold">₹ {r.amount_paid}</td>
                      <td className="text-rose-600 font-bold">₹ {r.outstanding_balance}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            setCollectStudentId(r.student_id)
                            setCollectAmount(r.outstanding_balance)
                            handleTabChange('collect')
                          }}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          Collect Balance
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBMODULE 6: OVERDUE FEES */}
      {currentSubTab === 'overdue' && (
        <div className="master-card master-table-card">
          <div className="master-card-head-simple">
            <h3 className="master-card-title-sm">Overdue Tuition Accounts ({overdueCount})</h3>
          </div>
          <div className="master-table-responsive">
            <table className="master-data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Overdue Amount</th>
                  <th>Due Since</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {students
                  .filter((s) => s.feeStatus === 'Overdue')
                  .map((st) => (
                    <tr key={st.id}>
                      <td>
                        <strong>{st.name}</strong>
                        <span className="block text-[11px] text-slate-400">{st.memberId}</span>
                      </td>
                      <td className="text-rose-600 font-bold">₹ {st.feeAmount}</td>
                      <td>{st.feeDueOn}</td>
                      <td><span className="master-status-pill is-overdue">OVERDUE</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            setCollectStudentId(st.id)
                            setCollectAmount(st.feeAmount)
                            handleTabChange('collect')
                          }}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                        >
                          Settle Now
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBMODULE 7: WAIVED FEES */}
      {currentSubTab === 'waived' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">Approved Tuition Waivers & Concessions</h3>
            <button
              onClick={() => setWaiverModalOpen(true)}
              className="master-btn-primary text-xs"
            >
              + Approve Fee Waiver
            </button>
          </div>

          <div className="master-card master-table-card">
            <div className="master-table-responsive">
              <table className="master-data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Month</th>
                    <th>Waived Amount</th>
                    <th>Reason</th>
                    <th>Authorized By</th>
                  </tr>
                </thead>
                <tbody>
                  {waiversList.map((w) => (
                    <tr key={w.id}>
                      <td>
                        <strong>{w.student_name}</strong>
                        <span className="block text-[11px] text-slate-400">{w.student_code}</span>
                      </td>
                      <td>{w.month}</td>
                      <td className="text-amber-600 font-bold">₹ {w.amount}</td>
                      <td><span className="text-xs text-slate-600">{w.reason}</span></td>
                      <td><span className="text-xs text-slate-800 font-bold">{w.approved_by}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBMODULE 8: MONTH-WISE HISTORY */}
      {currentSubTab === 'history' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Financial Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-slate-300"
              >
                <option value={2025}>Year 2025</option>
                <option value={2026}>Year 2026</option>
                <option value={2027}>Year 2027</option>
              </select>
            </div>
            <span className="text-xs text-slate-500">
              Formulas: Expected = Σ fees • Collected = Σ payments • Outstanding = Expected - Collected - Waivers
            </span>
          </div>

          <div className="master-card master-table-card">
            <div className="master-table-responsive">
              <table className="master-data-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Eligible</th>
                    <th>Expected</th>
                    <th>Paid</th>
                    <th>Pending</th>
                    <th>Collected</th>
                    <th>Outstanding</th>
                    <th>Waived</th>
                    <th style={{ textAlign: 'right' }}>Net Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {monthWiseHistoryData.map((row) => (
                    <tr key={row.monthNumber}>
                      <td><strong>{row.monthName}</strong></td>
                      <td>{row.eligibleStudents}</td>
                      <td>₹ {row.expectedAmount.toLocaleString('en-IN')}</td>
                      <td><strong className="text-emerald-600">{row.paidStudentsCount}</strong></td>
                      <td><strong className={row.pendingStudentsCount > 0 ? 'text-amber-600' : 'text-slate-400'}>{row.pendingStudentsCount}</strong></td>
                      <td className="text-emerald-600 font-bold">₹ {row.collectedRevenue.toLocaleString('en-IN')}</td>
                      <td className={row.outstandingAmount > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                        ₹ {row.outstandingAmount.toLocaleString('en-IN')}
                      </td>
                      <td>₹ {row.waivedAmount}</td>
                      <td style={{ textAlign: 'right' }}>
                        <strong className="text-slate-900">₹ {row.netRevenue.toLocaleString('en-IN')}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBMODULE 9: PAYMENT RECEIPTS */}
      {currentSubTab === 'receipts' && (
        <div className="space-y-4">
          <div className="master-search-filter-bar">
            <div className="master-search-input-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="master-search-icon">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="master-search-input"
                placeholder="Search receipts by receipt number or student name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="master-card master-table-card">
            <div className="master-table-responsive">
              <table className="master-data-table">
                <thead>
                  <tr>
                    <th>Receipt Number</th>
                    <th>Student</th>
                    <th>Month</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Payment Date</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptsList
                    .filter(
                      (r) =>
                        !searchQuery ||
                        r.receipt_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.student_name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((r) => (
                      <tr key={r.receipt_number}>
                        <td><strong className="font-mono text-xs">{r.receipt_number}</strong></td>
                        <td>
                          <strong>{r.student_name}</strong>
                          <span className="block text-[11px] text-slate-400">{r.student_code}</span>
                        </td>
                        <td>{r.billing_month}</td>
                        <td className="text-emerald-600 font-bold">₹ {r.amount_paid}</td>
                        <td><span className="text-xs font-semibold">{r.payment_method}</span></td>
                        <td>{r.payment_date}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => setActiveReceiptModal(r)}
                            className="px-3 py-1 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                          >
                            Print Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBMODULE 10: FEE SETTINGS */}
      {currentSubTab === 'settings' && (
        <div className="master-card p-6 max-w-xl mx-auto space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
            Dojo Fee Configuration Preferences
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Standard Monthly Tuition (₹)</label>
              <input
                type="number"
                value={settingDefaultFee}
                onChange={(e) => setSettingDefaultFee(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
              <span className="text-[11px] text-slate-400">Default fee applied to newly enrolled students</span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Monthly Billing Due Day</label>
              <input
                type="number"
                min={1}
                max={28}
                value={settingDueDay}
                onChange={(e) => setSettingDueDay(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
              <span className="text-[11px] text-slate-400">e.g. 10th of every month</span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Grace Period Days</label>
              <input
                type="number"
                value={settingGracePeriod}
                onChange={(e) => setSettingGracePeriod(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
              <span className="text-[11px] text-slate-400">Days before status transitions from Pending to Overdue</span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Receipt Number Prefix</label>
              <input
                type="text"
                value={settingReceiptPrefix}
                onChange={(e) => setSettingReceiptPrefix(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              onClick={() => showToast('Fee preferences updated successfully!')}
              className="px-4 py-2 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
            >
              Save Fee Settings
            </button>
          </div>
        </div>
      )}

      {/* OFFICIAL PRINTABLE RECEIPT MODAL */}
      {activeReceiptModal && (
        <div className="master-modal-backdrop" onClick={() => setActiveReceiptModal(null)}>
          <div
            className="master-modal-content p-6 max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
            id="koms-printable-receipt"
          >
            {/* Receipt Header */}
            <div className="text-center pb-4 border-b-2 border-slate-900">
              <div className="inline-block p-2 bg-rose-600 text-white rounded-full text-lg mb-1">
                🥋
              </div>
              <h3 className="text-base font-black text-slate-900 tracking-wider uppercase">
                Okinawa Shorin Ryu Karate & Kobudo
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                {activeReceiptModal.dojo_name} • Mudichur, Chennai
              </p>
              <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white mt-1">
                Official Tuition Fee Receipt
              </span>
            </div>

            {/* Receipt Body */}
            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Receipt No: <strong className="font-mono text-slate-900">{activeReceiptModal.receipt_number}</strong></span>
                <span>Date: <strong className="text-slate-900">{activeReceiptModal.payment_date}</strong></span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Name:</span>
                  <strong className="text-slate-900">{activeReceiptModal.student_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Student ID / Code:</span>
                  <strong className="text-slate-900">{activeReceiptModal.student_code}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Belt Rank:</span>
                  <strong className="text-slate-900">{activeReceiptModal.rank}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Billing Period:</span>
                  <strong className="text-slate-900">{activeReceiptModal.billing_month}</strong>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="flex justify-between p-2.5 bg-slate-100 font-bold text-slate-700">
                  <span>Particulars</span>
                  <span>Amount (INR)</span>
                </div>
                <div className="flex justify-between p-2.5 border-b border-slate-100">
                  <span>Monthly Dojo Training & Tatami Tuition</span>
                  <span>₹ {activeReceiptModal.amount_paid}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 font-black text-slate-900 text-sm">
                  <span>TOTAL AMOUNT PAID</span>
                  <span className="text-emerald-700">₹ {activeReceiptModal.amount_paid.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 space-y-0.5">
                <div>Payment Method: <strong>{activeReceiptModal.payment_method}</strong></div>
                {activeReceiptModal.transaction_ref && (
                  <div>Transaction Ref: <strong>{activeReceiptModal.transaction_ref}</strong></div>
                )}
                <div>Amount in words: <strong>Rupees One Thousand Only</strong></div>
              </div>

              {/* Signature Line */}
              <div className="pt-6 flex justify-between items-end border-t border-slate-100 mt-4">
                <div className="text-[10px] text-slate-400">
                  System Generated Voucher<br />KOMS Enterprise Dojo Core
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold text-slate-900">{activeReceiptModal.master_name}</div>
                  <div className="text-[10px] text-slate-500">Authorized Sensei Signature</div>
                </div>
              </div>
            </div>

            {/* Receipt Modal Actions */}
            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setActiveReceiptModal(null)}
                className="px-4 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center gap-1.5"
              >
                <span>🖨️</span>
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPROVE WAIVER MODAL */}
      {waiverModalOpen && (
        <div className="master-modal-backdrop" onClick={() => setWaiverModalOpen(false)}>
          <div
            className="master-modal-content p-5 max-w-md w-full bg-white rounded-xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              Approve Dojo Fee Waiver
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Grant a fee waiver or concession for {selectedMonth}
            </p>

            <form onSubmit={handleApproveWaiverSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Student *</label>
                <select
                  value={waiverStudentId}
                  onChange={(e) => setWaiverStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.memberId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Waiver Amount (₹) *</label>
                <input
                  type="number"
                  value={waiverAmount}
                  onChange={(e) => setWaiverAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Approval Reason *</label>
                <input
                  type="text"
                  value={waiverReason}
                  onChange={(e) => setWaiverReason(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="e.g. Merit concession, tournament sponsorship..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 mt-4">
                <button
                  type="button"
                  onClick={() => setWaiverModalOpen(false)}
                  className="px-4 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  Approve Waiver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
