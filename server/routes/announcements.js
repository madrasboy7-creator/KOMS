import express from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../auth.js';

const router = express.Router();
router.use(authMiddleware);

// 1. List Announcements
router.get('/', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const { status, category } = req.query;

  let query = `
    SELECT 
      a.*,
      (SELECT COUNT(*) FROM announcement_reads WHERE announcement_id = a.id) as read_count,
      (SELECT COUNT(*) FROM students WHERE master_id = a.master_id AND status = 'active') as total_recipients
    FROM announcements a
    WHERE a.master_id = ?
  `;
  const params = [masterId];

  if (status && status !== 'all') {
    query += ` AND a.status = ?`;
    params.push(status.toUpperCase());
  }

  if (category && category !== 'all') {
    query += ` AND a.category = ?`;
    params.push(category);
  }

  query += ` ORDER BY a.publish_date DESC, a.id DESC`;

  const announcements = db.prepare(query).all(...params);
  res.json({ announcements });
});

// 2. Create Announcement
router.post('/', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const {
    title,
    message,
    category = 'General',
    priority = 'Medium',
    target_audience = 'all',
    target_details,
    publish_date,
    expiry_date,
    status = 'PUBLISHED',
  } = req.body;

  if (!title || !title.trim() || !message || !message.trim()) {
    return res.status(400).json({ error: 'Announcement title and message are required.' });
  }

  const pDate = publish_date || new Date().toISOString();
  const validStatus = ['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED'].includes(status)
    ? status
    : 'PUBLISHED';

  try {
    const insertStmt = db.prepare(`
      INSERT INTO announcements (
        master_id, title, message, category, priority, target_audience,
        target_details, publish_date, expiry_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      masterId,
      title.trim(),
      message.trim(),
      category,
      priority,
      target_audience,
      target_details ? JSON.stringify(target_details) : null,
      pDate,
      expiry_date || null,
      validStatus
    );

    const created = db.prepare('SELECT * FROM announcements WHERE id = ?').get(Number(result.lastInsertRowid));
    res.json({ success: true, message: 'Announcement created successfully.', announcement: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create announcement: ' + err.message });
  }
});

// 3. Update Announcement
router.put('/:id', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const { id } = req.params;
  const { title, message, category, priority, target_audience, target_details, expiry_date, status } = req.body;

  const existing = db.prepare('SELECT * FROM announcements WHERE id = ? AND master_id = ?').get(id, masterId);
  if (!existing) {
    return res.status(404).json({ error: 'Announcement not found.' });
  }

  try {
    const updateStmt = db.prepare(`
      UPDATE announcements SET
        title = coalesce(?, title),
        message = coalesce(?, message),
        category = coalesce(?, category),
        priority = coalesce(?, priority),
        target_audience = coalesce(?, target_audience),
        target_details = coalesce(?, target_details),
        expiry_date = coalesce(?, expiry_date),
        status = coalesce(?, status),
        updated_at = datetime('now')
      WHERE id = ? AND master_id = ?
    `);

    updateStmt.run(
      title ? title.trim() : null,
      message ? message.trim() : null,
      category || null,
      priority || null,
      target_audience || null,
      target_details ? JSON.stringify(target_details) : null,
      expiry_date || null,
      status || null,
      id,
      masterId
    );

    const updated = db.prepare('SELECT * FROM announcements WHERE id = ?').get(id);
    res.json({ success: true, message: 'Announcement updated.', announcement: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update announcement: ' + err.message });
  }
});

// 4. Update Status (Publish, Archive, Draft)
router.patch('/:id/status', (req, res) => {
  const masterId = req.dataMasterId || req.master.id;
  const { id } = req.params;
  const { status } = req.body;

  if (!['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  try {
    db.prepare('UPDATE announcements SET status = ?, updated_at = datetime("now") WHERE id = ? AND master_id = ?').run(
      status,
      id,
      masterId
    );
    res.json({ success: true, message: `Announcement status changed to ${status}.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change status: ' + err.message });
  }
});

// 5. Mark Read by Student
router.post('/:id/read', (req, res) => {
  const { id } = req.params;
  const { student_id } = req.body;

  if (!student_id) {
    return res.status(400).json({ error: 'student_id is required.' });
  }

  try {
    db.prepare(`
      INSERT OR IGNORE INTO announcement_reads (announcement_id, student_id, read_at)
      VALUES (?, ?, datetime('now'))
    `).run(id, student_id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record read status: ' + err.message });
  }
});

export default router;

