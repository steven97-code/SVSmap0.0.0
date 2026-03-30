import { Router } from 'express';
import db from './db';

const router = Router();

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
  const { name, area, ip_address, lat, lng } = req.body;
  
  if (!name || !area || !ip_address || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
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
  const { status, offline_reason } = req.body;

  if (!['online', 'offline', 'unknown'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
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

  try {
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
