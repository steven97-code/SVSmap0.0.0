import { Router } from 'express';
import db from './db';

const router = Router();

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }

  try {
    const user = db.prepare('SELECT id, username, role FROM users WHERE username = ? AND password = ?').get(username, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }

  try {
    // Determine role: if it's the first user or named 'admin', make them admin
    const count = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    const role = (count.count === 0 || username === 'admin') ? 'admin' : 'user';

    const stmt = db.prepare(`
      INSERT INTO users (username, password, role)
      VALUES (?, ?, ?)
    `);
    const info = stmt.run(username, password, role);
    
    const newUser = db.prepare('SELECT id, username, role FROM users WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newUser);
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Create user (admin only)
router.post('/users', (req, res) => {
  const { username, password, role, adminId } = req.body;
  
  if (!username || !password || !role || !adminId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const admin = db.prepare('SELECT role FROM users WHERE id = ?').get(adminId) as { role: string };
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const stmt = db.prepare(`
      INSERT INTO users (username, password, role)
      VALUES (?, ?, ?)
    `);
    const info = stmt.run(username, password, role);
    
    const newUser = db.prepare('SELECT id, username, role FROM users WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newUser);
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get all users (admin only)
router.get('/users', (req, res) => {
  const adminId = req.query.adminId;
  if (!adminId) return res.status(403).json({ error: 'Forbidden' });

  try {
    const admin = db.prepare('SELECT role FROM users WHERE id = ?').get(adminId) as { role: string };
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const users = db.prepare('SELECT id, username, role, created_at FROM users ORDER BY created_at DESC').all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all cameras
router.get('/cameras', (req, res) => {
  try {
    const cameras = db.prepare('SELECT * FROM cameras ORDER BY created_at DESC').all();
    res.json(cameras);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cameras' });
  }
});

// Add a new camera
router.post('/cameras', (req, res) => {
  const { name, area, ip_address, lat, lng, adminId } = req.body;
  
  if (!name || !area || !ip_address || lat === undefined || lng === undefined || !adminId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const admin = db.prepare('SELECT role FROM users WHERE id = ?').get(adminId) as { role: string };
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const stmt = db.prepare(`
      INSERT INTO cameras (name, area, ip_address, status, lat, lng)
      VALUES (?, ?, ?, 'unknown', ?, ?)
    `);
    const info = stmt.run(name, area, ip_address, lat, lng);
    
    const newCamera = db.prepare('SELECT * FROM cameras WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newCamera);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add camera' });
  }
});

// Update camera status
router.put('/cameras/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, offline_reason, adminId } = req.body;

  if (!['online', 'offline', 'unknown'].includes(status) || !adminId) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const admin = db.prepare('SELECT role FROM users WHERE id = ?').get(adminId) as { role: string };
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const stmt = db.prepare(`
      UPDATE cameras 
      SET status = ?, offline_reason = ?
      WHERE id = ?
    `);
    stmt.run(status, status === 'offline' ? offline_reason : null, id);
    
    const updatedCamera = db.prepare('SELECT * FROM cameras WHERE id = ?').get(id);
    if (!updatedCamera) {
      return res.status(404).json({ error: 'Camera not found' });
    }
    
    res.json(updatedCamera);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update camera status' });
  }
});

// Delete a camera
router.delete('/cameras/:id', (req, res) => {
  const { id } = req.params;
  const adminId = req.query.adminId;

  if (!adminId) return res.status(403).json({ error: 'Forbidden' });

  try {
    const admin = db.prepare('SELECT role FROM users WHERE id = ?').get(adminId) as { role: string };
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const stmt = db.prepare('DELETE FROM cameras WHERE id = ?');
    const info = stmt.run(id);
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Camera not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete camera' });
  }
});

export default router;
