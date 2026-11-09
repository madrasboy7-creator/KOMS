import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { signToken, authMiddleware } from '../auth.js';

const router = express.Router();

// Master Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const master = db.prepare('SELECT * FROM masters WHERE email = ?').get(email.trim().toLowerCase());
  if (!master) {
    return res.status(401).json({ error: 'Invalid master credentials' });
  }

  const isMatch = bcrypt.compareSync(password, master.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid master credentials' });
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

// Get current master profile
router.get('/me', authMiddleware, (req, res) => {
  res.json({ master: req.master });
});

// List all registered masters (allows seamless switching in the UI demo header)
router.get('/masters', (req, res) => {
  const masters = db.prepare('SELECT id, name, email, dojo_name FROM masters ORDER BY id ASC').all();
  res.json({ masters });
});

// Switch master account (for live testing multi-tenant isolation)
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

