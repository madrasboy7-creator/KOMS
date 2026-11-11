import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { signToken, signUserToken, authMiddleware } from '../auth.js';

const router = express.Router();

// Helper: Ensure default Grand Master exists if table is empty
function ensureGrandMaster() {
  try {
    const gm = db.prepare("SELECT * FROM users WHERE role = 'grandmaster'").get();
    if (!gm) {
      const hash = bcrypt.hashSync('grandmaster123', 10);
      db.prepare(`
        INSERT INTO users (email, password_hash, name, role, status, member_id, phone)
        VALUES (?, ?, ?, 'grandmaster', 'active', 'KOMS-GM-001', '+91 98400 00001')
      `).run('grandmaster@koms.in', hash, 'Hanshi Grand Master (9th Dan)');
      console.log('🥋 Provisioned default Grand Master account: grandmaster@koms.in');
    }
  } catch (err) {
    console.error('ensureGrandMaster error:', err.message);
  }
}

// Call on load
ensureGrandMaster();

// -----------------------------------------------------------------------------
// POST /api/auth/register-student
// -----------------------------------------------------------------------------
router.post('/register-student', (req, res) => {
  const {
    name,
    email,
    phone,
    dob,
    gender,
    blood_group,
    guardian_name,
    guardian_phone,
    guardian_whatsapp,
    address,
    password,
    dojo_id,
    dojo_name,
    training_category,
    prior_experience
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Check if user already exists
  const existing = db.prepare('SELECT id, status FROM users WHERE email = ?').get(cleanEmail);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  try {
    const passwordHash = bcrypt.hashSync(password, 10);
    const memberId = 'STU-' + Math.floor(100000 + Math.random() * 900000);

    // 1. Create user in users table with PENDING status
    const insertUser = db.prepare(`
      INSERT INTO users (email, password_hash, name, role, status, member_id, phone, dojo_id)
      VALUES (?, ?, ?, 'student', 'pending', ?, ?, ?)
    `);
    const result = insertUser.run(cleanEmail, passwordHash, name.trim(), memberId, phone || null, dojo_id || null);
    const userId = result.lastInsertRowid;

    // 2. Lookup target dojo name
    let targetDojoName = dojo_name;
    if (dojo_id && !targetDojoName) {
      const dojo = db.prepare('SELECT name FROM dojos WHERE id = ?').get(dojo_id);
      if (dojo) targetDojoName = dojo.name;
    }
    if (!targetDojoName) {
      targetDojoName = 'Direct Karate Organization Membership';
    }

    // 3. Create join request
    const requestId = 'REQ-' + Date.now() + '-' + Math.floor(100 + Math.random() * 900);
    db.prepare(`
      INSERT INTO join_requests (
        id, student_user_id, student_name, dojo_id, dojo_name,
        dob, gender, blood_group, guardian_name, guardian_phone,
        guardian_whatsapp, email, phone, address, training_category,
        prior_experience, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_review')
    `).run(
      requestId,
      userId,
      name.trim(),
      dojo_id || null,
      targetDojoName,
      dob || null,
      gender || null,
      blood_group || null,
      guardian_name || null,
      guardian_phone || null,
      guardian_whatsapp || null,
      cleanEmail,
      phone || null,
      address || null,
      training_category || 'Traditional Shorin-Ryu Karate',
      prior_experience || 'None'
    );

    // Also insert into student_registration_requests for backward compatibility with master portal
    try {
      db.prepare(`
        INSERT INTO student_registration_requests (
          master_id, student_name, dob, phone, email, guardian_name,
          guardian_phone, address, belt, dojo_name, monthly_fee,
          registration_type, status, requested_at
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, 'White Belt (Beginner)', ?, 800, 'STUDENT_SUBMITTED', 'PENDING', datetime('now'))
      `).run(
        name.trim(),
        dob || null,
        phone || null,
        cleanEmail,
        guardian_name || null,
        guardian_phone || null,
        address || null,
        targetDojoName
      );
    } catch (_) {}

    res.status(201).json({
      success: true,
      message: 'Student registration submitted successfully! Your application is pending review by the Dojo Master.',
      userId,
      memberId,
      status: 'pending'
    });
  } catch (err) {
    console.error('Student registration error:', err);
    res.status(500).json({ error: 'Failed to complete registration: ' + err.message });
  }
});

// -----------------------------------------------------------------------------
// POST /api/auth/register-master
// -----------------------------------------------------------------------------
router.post('/register-master', (req, res) => {
  const {
    name,
    email,
    phone,
    dob,
    gender,
    password,
    avatar,
    // Professional
    style,
    dan_rank,
    experience,
    qualifications,
    teaching_experience,
    achievements,
    about_master,
    // Dojo
    dojo_name,
    dojo_address,
    dojo_city,
    dojo_state,
    dojo_pincode,
    dojo_phone,
    dojo_email,
    training_styles,
    initial_schedule,
    entry_fee,
    monthly_fee
  } = req.body;

  if (!name || !email || !password || !dojo_name) {
    return res.status(400).json({ error: 'Name, email, password, and Dojo name are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  const existing = db.prepare('SELECT id, status FROM users WHERE email = ?').get(cleanEmail);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  try {
    const passwordHash = bcrypt.hashSync(password, 10);
    const memberId = 'MST-' + Math.floor(100000 + Math.random() * 900000);
    const dojoId = 'dojo-' + dojo_name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') + '-' + Math.floor(100 + Math.random() * 900);

    // 1. Create user in users table with PENDING_APPROVAL status
    const insertUser = db.prepare(`
      INSERT INTO users (email, password_hash, name, role, status, member_id, phone, avatar, dojo_id)
      VALUES (?, ?, ?, 'master', 'pending_approval', ?, ?, ?, ?)
    `);
    const result = insertUser.run(cleanEmail, passwordHash, name.trim(), memberId, phone || null, avatar || null, dojoId);
    const userId = result.lastInsertRowid;

    // 2. Create master application record for Grand Master review
    const appId = 'APP-' + Date.now() + '-' + Math.floor(100 + Math.random() * 900);
    db.prepare(`
      INSERT INTO master_applications (
        id, user_id, full_name, email, phone, dob, gender,
        style, dan_rank, experience, qualifications, teaching_experience,
        achievements, about_master, dojo_name, dojo_address, dojo_city,
        dojo_state, dojo_pincode, dojo_phone, dojo_email, training_styles,
        initial_schedule, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_approval')
    `).run(
      appId,
      userId,
      name.trim(),
      cleanEmail,
      phone || '',
      dob || null,
      gender || null,
      style || 'Okinawa Shorin Ryu Karate & Kobudo',
      dan_rank || '3rd Dan Black Belt',
      experience || '10+ Years',
      qualifications || 'Certified Instructor',
      teaching_experience || '5+ Years Dojo Head',
      achievements || '',
      about_master || '',
      dojo_name.trim(),
      dojo_address || '',
      dojo_city || 'Chennai',
      dojo_state || 'Tamil Nadu',
      dojo_pincode || '',
      dojo_phone || phone || '',
      dojo_email || cleanEmail,
      training_styles || 'Kihon, Kata, Kumite, Kobudo Weapons',
      initial_schedule || 'Saturday & Sunday 06:00 AM – 08:00 AM'
    );

    // 3. Register proposed dojo with status = pending_approval (hidden from Common UI until approved)
    db.prepare(`
      INSERT INTO dojos (
        id, name, badge, master_id, head_instructor, instructor_rank,
        instructor_experience, instructor_avatar, instructor_bio,
        instructor_qualifications, instructor_achievements, area,
        city, state, country, pincode, address, phone, email,
        training_days, class_timings, entry_fee, monthly_fee, status
      ) VALUES (?, ?, 'New Branch', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'India', ?, ?, ?, ?, ?, ?, ?, ?, 'pending_approval')
    `).run(
      dojoId,
      dojo_name.trim(),
      userId,
      name.trim(),
      dan_rank || '3rd Dan Black Belt',
      experience || '10+ Years',
      avatar || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=300',
      about_master || 'Chief Instructor and Dojo Master.',
      qualifications || 'Certified Martial Arts Instructor',
      achievements || 'District & State Karate Representative',
      dojo_city || 'Chennai',
      dojo_city || 'Chennai',
      dojo_state || 'Tamil Nadu',
      dojo_pincode || '',
      dojo_address || 'Chennai, Tamil Nadu',
      dojo_phone || phone || '',
      dojo_email || cleanEmail,
      'Saturday, Sunday',
      '06:00 AM – 08:00 AM',
      Number(entry_fee) || 1000,
      Number(monthly_fee) || 800
    );

    res.status(201).json({
      success: true,
      message: 'Master and Dojo application submitted! It is currently pending review by the Grand Master.',
      userId,
      appId,
      status: 'pending_approval'
    });
  } catch (err) {
    console.error('Master registration error:', err);
    res.status(500).json({ error: 'Failed to submit master application: ' + err.message });
  }
});

// -----------------------------------------------------------------------------
// POST /api/auth/setup-grandmaster
// -----------------------------------------------------------------------------
router.post('/setup-grandmaster', (req, res) => {
  const { email, password, name, setup_code } = req.body;

  // Verify setup authorization code
  if (setup_code !== 'KOMS-SETUP-2026') {
    return res.status(403).json({ error: 'Invalid Grand Master setup security code.' });
  }

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const passwordHash = bcrypt.hashSync(password, 10);

  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    let userId;
    if (existing) {
      db.prepare(`
        UPDATE users 
        SET role = 'grandmaster', status = 'active', password_hash = ?, name = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(passwordHash, name.trim(), existing.id);
      userId = existing.id;
    } else {
      const result = db.prepare(`
        INSERT INTO users (email, password_hash, name, role, status, member_id)
        VALUES (?, ?, ?, 'grandmaster', 'active', 'KOMS-GM-001')
      `).run(cleanEmail, passwordHash, name.trim());
      userId = result.lastInsertRowid;
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    const token = signUserToken(user);

    res.json({
      success: true,
      message: 'Grand Master account successfully provisioned and activated.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to setup Grand Master: ' + err.message });
  }
});

// -----------------------------------------------------------------------------
// POST /api/auth/login
// -----------------------------------------------------------------------------
router.post('/login', (req, res) => {
  const { email, password, portalPreference } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email / Member ID and password are required.' });
  }

  const cleanIdentifier = email.trim().toLowerCase();

  // 1. Look in unified `users` table first
  let user = db.prepare(`
    SELECT * FROM users 
    WHERE LOWER(email) = ? OR LOWER(member_id) = ?
  `).get(cleanIdentifier, cleanIdentifier);

  // 2. Fallback to legacy `masters` table if not found in `users`
  if (!user) {
    const legacyMaster = db.prepare('SELECT * FROM masters WHERE LOWER(email) = ?').get(cleanIdentifier);
    if (legacyMaster) {
      user = {
        id: legacyMaster.id,
        name: legacyMaster.name,
        email: legacyMaster.email,
        password_hash: legacyMaster.password_hash,
        role: legacyMaster.role === 'grand_master' ? 'grandmaster' : 'master',
        status: 'active',
        dojo_id: 'dojo-ranganagar',
        member_id: `MST-${legacyMaster.id}`
      };
    }
  }

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. No account found with this identifier.' });
  }

  // 3. Verify password
  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
  }

  // 4. Status Check
  if (user.status === 'pending' || user.status === 'pending_approval') {
    return res.status(403).json({
      error: 'Your registration is currently pending review and approval. Please wait for the Dojo Master or Grand Master to approve your account before accessing the portal.',
      status: user.status
    });
  }
  if (user.status === 'rejected') {
    return res.status(403).json({
      error: 'Your registration application was rejected. Please contact the Dojo administration.',
      status: 'rejected'
    });
  }
  if (user.status === 'suspended') {
    return res.status(403).json({
      error: 'Your account has been suspended. Please contact the organization administration.',
      status: 'suspended'
    });
  }

  // 5. Verify Portal Preference (Never trust frontend, backend enforces actual role match)
  if (portalPreference) {
    if (portalPreference === 'grandmaster' && user.role !== 'grandmaster') {
      return res.status(403).json({
        error: 'Access denied: The Grand Master portal is restricted to the Executive Grand Master only.'
      });
    }
    if (portalPreference === 'master' && user.role !== 'master' && user.role !== 'grandmaster') {
      return res.status(403).json({
        error: 'Access denied: The Master Portal is restricted to verified Dojo Masters.'
      });
    }
    if (portalPreference === 'student' && user.role !== 'student') {
      return res.status(403).json({
        error: `Access denied: You have logged in as a ${user.role}. Please access the corresponding ${user.role} portal.`
      });
    }
  }

  // 6. Sign JWT
  const token = signUserToken(user);

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      member_id: user.member_id,
      dojo_id: user.dojo_id
    }
  });
});

// -----------------------------------------------------------------------------
// GET /api/auth/me
// -----------------------------------------------------------------------------
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user, master: req.master });
});

// -----------------------------------------------------------------------------
// POST /api/auth/logout
// -----------------------------------------------------------------------------
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

// -----------------------------------------------------------------------------
// Compatibility endpoint for legacy master switcher
// -----------------------------------------------------------------------------
router.get('/masters', (req, res) => {
  const masters = db.prepare('SELECT id, name, email, dojo_name FROM masters ORDER BY id ASC').all();
  res.json({ masters });
});

router.post('/switch', (req, res) => {
  const { masterId } = req.body;
  const master = db.prepare('SELECT id, name, email, dojo_name FROM masters WHERE id = ?').get(Number(masterId));
  if (!master) {
    return res.status(404).json({ error: 'Master not found' });
  }

  const token = signToken(master);
  res.json({
    token,
    master: {
      id: master.id,
      name: master.name,
      email: master.email,
      dojo_name: master.dojo_name
    }
  });
});

export default router;
