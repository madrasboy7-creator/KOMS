import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../auth.js';

const router = express.Router();
router.use(authMiddleware);

// Helper to format billing month 'YYYY-MM'
function currentBillingMonth() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

// 1. Fee Dashboard Metrics
router.get('/dashboard', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const month = req.query.month || currentBillingMonth(); // 'YYYY-MM'

  // Get active eligible students
  const activeStudents = db.prepare(`
    SELECT id, student_name, student_code, rank, coalesce(monthly_fee, 1000) as fee
    FROM students
    WHERE master_id = ? AND status = 'active'
  `).all(masterId);

  const totalEligible = activeStudents.length;

  // Expected monthly collection = Sum of applicable monthly fees for eligible students
  const expectedMonthlyCollection = activeStudents.reduce((acc, s) => acc + (s.fee || 1000), 0);

  // Get all recorded payments for this billing month
  const payments = db.prepare(`
    SELECT student_id, sum(amount_paid) as total_paid
    FROM fee_payments
    WHERE master_id = ? AND billing_month = ?
    GROUP BY student_id
  `).all(masterId, month);

  const paymentMap = new Map();
  for (const p of payments) {
    paymentMap.set(p.student_id, p.total_paid);
  }

  // Get approved waivers for this billing month
  const waivers = db.prepare(`
    SELECT student_id, sum(waiver_amount) as total_waived
    FROM fee_waivers
    WHERE master_id = ? AND billing_month = ?
    GROUP BY student_id
  `).all(masterId, month);

  const waiverMap = new Map();
  for (const w of waivers) {
    waiverMap.set(w.student_id, w.total_waived);
  }

  let totalCollectedRevenue = 0;
  let totalWaivedAmount = 0;
  let paidStudentCount = 0;
  let pendingStudentCount = 0;
  let partialPaymentCount = 0;
  let overduePaymentCount = 0;

  // Today's day of month to determine overdue
  const today = new Date();
  const todayDay = today.getDate();
  const isPastDueDay = todayDay > 10;

  for (const st of activeStudents) {
    const feeDue = st.fee || 1000;
    const paid = paymentMap.get(st.id) || 0;
    const waived = waiverMap.get(st.id) || 0;

    totalCollectedRevenue += paid;
    totalWaivedAmount += waived;

    if (paid >= feeDue || waived >= feeDue || (paid + waived) >= feeDue) {
      paidStudentCount++;
    } else if (paid > 0) {
      partialPaymentCount++;
    } else {
      if (isPastDueDay) {
        overduePaymentCount++;
      } else {
        pendingStudentCount++;
      }
    }
  }

  // Outstanding Amount = Total Fees Due - Payments - Approved Waivers
  const outstandingAmount = Math.max(0, expectedMonthlyCollection - totalCollectedRevenue - totalWaivedAmount);

  res.json({
    billing_month: month,
    total_eligible_students: totalEligible,
    expected_monthly_collection: expectedMonthlyCollection,
    total_collected_revenue: totalCollectedRevenue,
    outstanding_amount: outstandingAmount,
    total_waived_amount: totalWaivedAmount,
    net_revenue: totalCollectedRevenue,
    paid_student_count: paidStudentCount,
    pending_student_count: pendingStudentCount,
    partial_payment_count: partialPaymentCount,
    overdue_payment_count: overduePaymentCount,
  });
});

// 2. Student Fee Roster for Selected Month
router.get('/students', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const month = req.query.month || currentBillingMonth();
  const statusFilter = req.query.status; // 'ALL', 'PAID', 'PENDING', 'PARTIAL', 'OVERDUE', 'WAIVED'

  const activeStudents = db.prepare(`
    SELECT id, student_name, student_code, rank, coalesce(monthly_fee, 1000) as fee, status as account_status, phone, email
    FROM students
    WHERE master_id = ?
    ORDER BY student_code ASC
  `).all(masterId);

  const payments = db.prepare(`
    SELECT student_id, sum(amount_paid) as total_paid, max(payment_date) as last_payment_date, max(receipt_number) as receipt_number
    FROM fee_payments
    WHERE master_id = ? AND billing_month = ?
    GROUP BY student_id
  `).all(masterId, month);

  const paymentMap = new Map();
  for (const p of payments) {
    paymentMap.set(p.student_id, p);
  }

  const waivers = db.prepare(`
    SELECT student_id, sum(waiver_amount) as total_waived
    FROM fee_waivers
    WHERE master_id = ? AND billing_month = ?
    GROUP BY student_id
  `).all(masterId, month);

  const waiverMap = new Map();
  for (const w of waivers) {
    waiverMap.set(w.student_id, w.total_waived);
  }

  const todayDay = new Date().getDate();
  const isPastDue = todayDay > 10;

  const roster = activeStudents.map((st) => {
    const feeDue = st.fee || 1000;
    const paymentInfo = paymentMap.get(st.id);
    const paid = paymentInfo ? paymentInfo.total_paid : 0;
    const waived = waiverMap.get(st.id) || 0;
    const balance = Math.max(0, feeDue - paid - waived);

    let feeStatus = 'PENDING';
    if (waived >= feeDue) {
      feeStatus = 'WAIVED';
    } else if (paid >= feeDue || (paid + waived) >= feeDue) {
      feeStatus = 'PAID';
    } else if (paid > 0) {
      feeStatus = 'PARTIAL';
    } else if (isPastDue) {
      feeStatus = 'OVERDUE';
    }

    return {
      student_id: st.id,
      student_name: st.student_name,
      student_code: st.student_code,
      rank: st.rank,
      phone: st.phone,
      email: st.email,
      account_status: st.account_status,
      monthly_fee: feeDue,
      amount_paid: paid,
      amount_waived: waived,
      outstanding_balance: balance,
      fee_status: feeStatus,
      last_payment_date: paymentInfo ? paymentInfo.last_payment_date : null,
      receipt_number: paymentInfo ? paymentInfo.receipt_number : null,
    };
  });

  const filtered = statusFilter && statusFilter !== 'ALL'
    ? roster.filter((r) => r.fee_status.toUpperCase() === statusFilter.toUpperCase())
    : roster;

  res.json({ billing_month: month, students: filtered });
});

// 3. Collect Fee Payment
router.post('/collect', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const {
    student_id,
    billing_month,
    payment_amount,
    payment_method = 'CASH',
    payment_date,
    transaction_ref = '',
    remarks = '',
  } = req.body;

  if (!student_id || !payment_amount || Number(payment_amount) <= 0) {
    return res.status(400).json({ error: 'Valid student ID and positive payment amount are required.' });
  }

  const month = billing_month || currentBillingMonth();
  const pDate = payment_date || new Date().toISOString().split('T')[0];

  // Verify student belongs to this master
  const student = db.prepare('SELECT * FROM students WHERE id = ? AND master_id = ?').get(student_id, masterId);
  if (!student) {
    return res.status(404).json({ error: 'Student not found in your dojo.' });
  }

  const feeDue = student.monthly_fee || 1000;

  // Previous payments for this month
  const prevPaidRow = db.prepare(`
    SELECT coalesce(sum(amount_paid), 0) as paid
    FROM fee_payments
    WHERE student_id = ? AND billing_month = ?
  `).get(student_id, month);

  const prevPaid = prevPaidRow ? prevPaidRow.paid : 0;
  const newTotalPaid = prevPaid + Number(payment_amount);

  let status = 'PAID';
  if (newTotalPaid < feeDue) {
    status = 'PARTIAL';
  }

  // Generate Unique Receipt Number
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const receiptNumber = `RCP-${month.replace('-', '')}-${String(student.id).padStart(3, '0')}-${randomSuffix}`;

  try {
    const insertStmt = db.prepare(`
      INSERT INTO fee_payments (
        master_id, student_id, receipt_number, billing_month, amount_due,
        amount_paid, payment_method, transaction_ref, payment_date, remarks,
        status, recorded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      masterId,
      student.id,
      receiptNumber,
      month,
      feeDue,
      Number(payment_amount),
      payment_method.toUpperCase(),
      transaction_ref,
      pDate,
      remarks,
      status,
      masterId
    );

    const master = db.prepare('SELECT name, dojo_name FROM masters WHERE id = ?').get(masterId);

    const receipt = {
      receipt_number: receiptNumber,
      student_id: student.id,
      student_name: student.student_name,
      student_code: student.student_code,
      rank: student.rank,
      dojo_name: master?.dojo_name || 'Ranga Nagar Dojo',
      master_name: master?.name || 'Sensei Rubeshwaren',
      billing_month: month,
      fee_due: feeDue,
      amount_paid: Number(payment_amount),
      total_paid_for_month: newTotalPaid,
      outstanding_balance: Math.max(0, feeDue - newTotalPaid),
      payment_method: payment_method.toUpperCase(),
      payment_date: pDate,
      transaction_ref,
      remarks,
      status,
      issued_at: new Date().toISOString(),
    };

    res.json({
      success: true,
      message: `Payment of ₹${payment_amount} recorded successfully. Receipt generated.`,
      receipt,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record fee payment: ' + err.message });
  }
});

// 4. Month-wise Fee Collection History
router.get('/history', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Active students count & total fees
  const activeStudents = db.prepare(`
    SELECT id, coalesce(monthly_fee, 1000) as fee
    FROM students
    WHERE master_id = ? AND status = 'active'
  `).all(masterId);

  const eligibleCount = activeStudents.length;
  const baseExpected = activeStudents.reduce((acc, s) => acc + s.fee, 0);

  const history = [];

  for (let m = 1; m <= 12; m++) {
    const monthStr = `${year}-${String(m).padStart(2, '0')}`;

    const paymentsRow = db.prepare(`
      SELECT 
        coalesce(sum(amount_paid), 0) as collected,
        count(DISTINCT student_id) as paid_students
      FROM fee_payments
      WHERE master_id = ? AND billing_month = ?
    `).get(masterId, monthStr);

    const waiversRow = db.prepare(`
      SELECT coalesce(sum(waiver_amount), 0) as waived
      FROM fee_waivers
      WHERE master_id = ? AND billing_month = ?
    `).get(masterId, monthStr);

    const collected = paymentsRow ? paymentsRow.collected : 0;
    const paidStudents = paymentsRow ? paymentsRow.paid_students : 0;
    const waived = waiversRow ? waiversRow.waived : 0;
    const outstanding = Math.max(0, baseExpected - collected - waived);
    const pendingStudents = Math.max(0, eligibleCount - paidStudents);

    history.push({
      month_number: m,
      month_name: monthNames[m - 1],
      billing_month: monthStr,
      eligible_students: eligibleCount,
      expected_amount: baseExpected,
      collected_revenue: collected,
      outstanding_amount: outstanding,
      waived_amount: waived,
      refund_amount: 0,
      net_revenue: collected,
      paid_students_count: paidStudents,
      pending_students_count: pendingStudents,
    });
  }

  res.json({ year, history });
});

// 5. Get Receipt Details
router.get('/receipts/:receiptNumber', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const { receiptNumber } = req.params;

  const payment = db.prepare(`
    SELECT fp.*, s.student_name, s.student_code, s.rank, s.address, m.name as master_name, m.dojo_name
    FROM fee_payments fp
    JOIN students s ON fp.student_id = s.id
    JOIN masters m ON fp.master_id = m.id
    WHERE fp.receipt_number = ? AND fp.master_id = ?
  `).get(receiptNumber, masterId);

  if (!payment) {
    return res.status(404).json({ error: 'Receipt not found' });
  }

  res.json({ receipt: payment });
});

// 6. Record Fee Waiver
router.post('/waive', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const { student_id, billing_month, waiver_amount, reason } = req.body;

  if (!student_id || !waiver_amount || Number(waiver_amount) <= 0 || !reason) {
    return res.status(400).json({ error: 'Student ID, waiver amount, and reason are required.' });
  }

  const month = billing_month || currentBillingMonth();

  try {
    const insert = db.prepare(`
      INSERT INTO fee_waivers (master_id, student_id, billing_month, waiver_amount, reason, approved_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insert.run(masterId, student_id, month, Number(waiver_amount), reason, masterId);

    res.json({ success: true, message: `Fee waiver of ₹${waiver_amount} approved.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record waiver: ' + err.message });
  }
});

export default router;

