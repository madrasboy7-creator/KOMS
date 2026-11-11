import express from 'express';
import { db } from '../db.js';
import { authMiddleware, requireRole } from '../auth.js';

const router = express.Router();
router.use(authMiddleware);
router.use(requireRole('grandmaster'));

// -----------------------------------------------------------------------------
// GET /api/grandmaster/stats — Real Organization Statistics (No mock counts)
// -----------------------------------------------------------------------------
router.get('/stats', (req, res) => {
  try {
    const totalDojos = db.prepare("SELECT COUNT(*) as count FROM dojos WHERE status = 'active'").get()?.count || 0;
    const pendingDojos = db.prepare("SELECT COUNT(*) as count FROM dojos WHERE status = 'pending_approval'").get()?.count || 0;

    const totalMasters = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'master' AND status = 'active'").get()?.count || 0;
    const pendingMasters = db.prepare("SELECT COUNT(*) as count FROM master_applications WHERE status = 'pending_approval'").get()?.count || 0;

    const totalStudents = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student' AND status = 'active'").get()?.count || 0;
    const pendingStudents = db.prepare("SELECT COUNT(*) as count FROM join_requests WHERE status = 'pending_review'").get()?.count || 0;

    const totalFeesCollected = db.prepare("SELECT COALESCE(SUM(amount_paid), 0) as total FROM fee_payments WHERE status = 'PAID'").get()?.total || 0;
    const totalFeesPending = db.prepare("SELECT COALESCE(SUM(amount_due - amount_paid), 0) as pending FROM fee_payments WHERE status != 'PAID'").get()?.pending || 0;

    res.json({
      stats: {
        totalDojos,
        pendingDojos,
        totalMasters,
        pendingMasters,
        totalStudents,
        pendingStudents,
        totalFeesCollected,
        totalFeesPending
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch GM stats: ' + err.message });
  }
});

// -----------------------------------------------------------------------------
// GET /api/grandmaster/master-applications — List Master & Dojo Applications
// -----------------------------------------------------------------------------
router.get('/master-applications', (req, res) => {
  try {
    const status = req.query.status || 'pending_approval';
    let query = 'SELECT * FROM master_applications';
    const params = [];
    if (status !== 'all') {
      query += ' WHERE status = ?';
      params.push(status);
    }
    query += ' ORDER BY submitted_at DESC';

    const applications = db.prepare(query).all(...params);
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch master applications: ' + err.message });
  }
});

// -----------------------------------------------------------------------------
// POST /api/grandmaster/master-applications/:id/approve
// -----------------------------------------------------------------------------
router.post('/master-applications/:id/approve', (req, res) => {
  const { notes } = req.body;
  const appId = req.params.id;

  try {
    const app = db.prepare('SELECT * FROM master_applications WHERE id = ?').get(appId);
    if (!app) {
      return res.status(404).json({ error: 'Master application not found.' });
    }

    db.exec('BEGIN IMMEDIATE;');

    // 1. Mark application approved
    db.prepare(`
      UPDATE master_applications
      SET status = 'approved', reviewed_by = ?, reviewer_notes = ?
      WHERE id = ?
    `).run(req.user.id, notes || 'Approved by Grand Master', appId);

    // 2. Activate Master in users table
    if (app.user_id) {
      db.prepare(`
        UPDATE users
        SET status = 'active', updated_at = datetime('now')
        WHERE id = ?
      `).run(app.user_id);
    }

    // 3. Activate Dojo in dojos table so it appears in Common UI immediately
    db.prepare(`
      UPDATE dojos
      SET status = 'active', updated_at = datetime('now')
      WHERE master_id = ? OR name = ?
    `).run(app.user_id, app.dojo_name);

    // 4. Ensure master is also recorded in masters table for backward compatibility
    const existingMaster = db.prepare('SELECT id FROM masters WHERE email = ?').get(app.email);
    let masterRowId;
    if (existingMaster) {
      masterRowId = existingMaster.id;
    } else {
      const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(app.user_id);
      const insertMaster = db.prepare(`
        INSERT INTO masters (name, email, password_hash, dojo_name, role)
        VALUES (?, ?, ?, ?, 'master')
      `);
      const mRes = insertMaster.run(app.full_name, app.email, user ? user.password_hash : 'master123', app.dojo_name);
      masterRowId = mRes.lastInsertRowid;
    }

    // Ensure master_profiles entry
    db.prepare(`
      INSERT OR REPLACE INTO master_profiles (
        master_id, phone, bio, address, dojo_info
      ) VALUES (?, ?, ?, ?, ?)
    `).run(
      masterRowId,
      app.phone,
      `${app.dan_rank} • ${app.about_master || 'Chief Instructor'}`,
      app.dojo_address || 'Chennai',
      `${app.dojo_name} — ${app.style}`
    );

    // 5. Add audit log
    const logId = 'LOG-' + Date.now();
    db.prepare(`
      INSERT INTO audit_logs (id, user_id, user_name, user_role, dojo_id, action, entity_type, entity_id, details)
      VALUES (?, ?, ?, 'grandmaster', ?, 'APPROVE_MASTER_APPLICATION', 'master_application', ?, ?)
    `).run(
      logId,
      String(req.user.id),
      req.user.name,
      app.dojo_name,
      appId,
      `Approved Master registration for ${app.full_name} and listed ${app.dojo_name} in Common UI.`
    );

    db.exec('COMMIT;');

    res.json({
      success: true,
      message: `Master ${app.full_name} and Dojo ${app.dojo_name} have been approved and published to the Common UI!`,
      applicationId: appId
    });
  } catch (err) {
    try { db.exec('ROLLBACK;'); } catch (_) {}
    console.error('Approve master error:', err);
    res.status(500).json({ error: 'Failed to approve master application: ' + err.message });
  }
});

// -----------------------------------------------------------------------------
// POST /api/grandmaster/master-applications/:id/reject
// -----------------------------------------------------------------------------
router.post('/master-applications/:id/reject', (req, res) => {
  const { notes } = req.body;
  const appId = req.params.id;

  try {
    const app = db.prepare('SELECT * FROM master_applications WHERE id = ?').get(appId);
    if (!app) {
      return res.status(404).json({ error: 'Master application not found.' });
    }

    db.exec('BEGIN IMMEDIATE;');

    db.prepare(`
      UPDATE master_applications
      SET status = 'rejected', reviewed_by = ?, reviewer_notes = ?
      WHERE id = ?
    `).run(req.user.id, notes || 'Rejected by Grand Master', appId);

    if (app.user_id) {
      db.prepare(`
        UPDATE users
        SET status = 'rejected', updated_at = datetime('now')
        WHERE id = ?
      `).run(app.user_id);
    }

    db.prepare(`
      UPDATE dojos
      SET status = 'inactive', updated_at = datetime('now')
      WHERE master_id = ? OR name = ?
    `).run(app.user_id, app.dojo_name);

    db.exec('COMMIT;');

    res.json({
      success: true,
      message: `Master application for ${app.full_name} was rejected.`,
      applicationId: appId
    });
  } catch (err) {
    try { db.exec('ROLLBACK;'); } catch (_) {}
    res.status(500).json({ error: 'Failed to reject master application: ' + err.message });
  }
});

// -----------------------------------------------------------------------------
// GET /api/grandmaster/dojos — Manage all Dojos
// -----------------------------------------------------------------------------
router.get('/dojos', (req, res) => {
  try {
    const dojos = db.prepare('SELECT * FROM dojos ORDER BY created_at DESC').all();
    res.json({ dojos });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dojos: ' + err.message });
  }
});

// -----------------------------------------------------------------------------
// PUT /api/grandmaster/dojos/:id/status — Toggle Dojo status
// -----------------------------------------------------------------------------
router.put('/dojos/:id/status', (req, res) => {
  const { status, reason } = req.body;
  if (!['active', 'suspended', 'inactive'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be active, suspended, or inactive.' });
  }

  try {
    db.prepare(`
      UPDATE dojos
      SET status = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(status, req.params.id);

    res.json({ success: true, message: `Dojo status updated to ${status}.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update dojo status: ' + err.message });
  }
});

// -----------------------------------------------------------------------------
// GET /api/grandmaster/students — View all students organization-wide
// -----------------------------------------------------------------------------
router.get('/students', (req, res) => {
  try {
    const students = db.prepare(`
      SELECT u.id, u.name, u.email, u.phone, u.status, u.member_id, u.dojo_id, u.created_at,
             sp.belt, sp.monthly_fee, sp.student_code
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.role = 'student'
      ORDER BY u.created_at DESC
    `).all();

    res.json({ students });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students: ' + err.message });
  }
});

// -----------------------------------------------------------------------------
// GET /api/grandmaster/audit-logs
// -----------------------------------------------------------------------------
router.get('/audit-logs', (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100').all();
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs: ' + err.message });
  }
});

export default router;

