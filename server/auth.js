import jwt from 'jsonwebtoken';
import { db } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'koms_dojo_master_secret_key_2026';

export function getEffectiveMasterId(master) {
  if (!master) return 1;
  // If master belongs to Ranga Nagar (both Sensei Rubeshwaren and Sensei Janathanan),
  // they co-manage and share the exact same Dojo dataset under ID 1
  if (master.dojo_name && master.dojo_name.trim().toLowerCase().includes('ranga nagar')) {
    return 1;
  }
  return master.data_id || master.id;
}

export function signToken(master) {
  return jwt.sign(
    {
      id: master.id,
      name: master.name,
      email: master.email,
      role: master.role || 'master',
      dojo_name: master.dojo_name,
      dojo_id: master.dojo_id || 'dojo-ranganagar'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function signUserToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      dojo_id: user.dojo_id,
      member_id: user.member_id
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authMiddleware(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.headers['x-master-id']) {
      // Direct Master ID header for easy automated testing & API tooling
      const masterId = Number(req.headers['x-master-id']);
      const master = db.prepare('SELECT id, name, email, dojo_name FROM masters WHERE id = ?').get(masterId);
      if (master) {
        req.master = master;
        req.dataMasterId = getEffectiveMasterId(master);
        req.master.data_id = req.dataMasterId;
        req.user = { id: master.id, name: master.name, email: master.email, role: 'master', dojo_id: 'dojo-ranganagar' };
        return next();
      }
    }

    if (!token) {
      // Default dev fallback if enabled and strict auth not requested
      if (process.env.NODE_ENV !== 'production' && !req.headers['x-strict-auth']) {
        const devMaster = db.prepare('SELECT id, name, email, dojo_name FROM masters WHERE id = 1').get();
        if (devMaster) {
          req.master = devMaster;
          req.dataMasterId = getEffectiveMasterId(devMaster);
          req.master.data_id = req.dataMasterId;
          req.user = { id: devMaster.id, name: devMaster.name, email: devMaster.email, role: 'master', dojo_id: 'dojo-ranganagar' };
          return next();
        }
      }
      return res.status(401).json({ error: 'Authentication required. Please provide a valid Bearer token.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check in unified `users` table first
    let user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);
    if (user) {
      req.user = user;
      if (user.role === 'master' || user.role === 'grandmaster') {
        const master = db.prepare('SELECT * FROM masters WHERE email = ?').get(user.email);
        req.master = master || { id: user.id, name: user.name, email: user.email, dojo_name: user.dojo_id };
        req.dataMasterId = getEffectiveMasterId(req.master);
        req.master.data_id = req.dataMasterId;
      }
      return next();
    }

    // Fallback to legacy `masters` table
    const master = db.prepare('SELECT id, name, email, dojo_name FROM masters WHERE id = ?').get(decoded.id);
    if (master) {
      req.master = master;
      req.dataMasterId = getEffectiveMasterId(master);
      req.master.data_id = req.dataMasterId;
      req.user = { id: master.id, name: master.name, email: master.email, role: 'master', dojo_id: 'dojo-ranganagar' };
      return next();
    }

    return res.status(401).json({ error: 'User account not found.' });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.', details: err.message });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Requires one of roles: ${roles.join(', ')}` });
    }
    next();
  };
}


