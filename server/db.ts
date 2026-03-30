import Database from 'better-sqlite3';

const db = new Database('ersv-map.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS cameras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    area TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unknown',
    offline_reason TEXT,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert some dummy data if empty
const count = db.prepare('SELECT COUNT(*) as count FROM cameras').get() as { count: number };
if (count.count === 0) {
  const insert = db.prepare(`
    INSERT INTO cameras (name, area, ip_address, status, offline_reason, lat, lng)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  insert.run('Cam-N-01', 'Bab El Oued', '192.168.1.101', 'online', null, 36.7889, 3.0489);
  insert.run('Cam-C-05', 'Alger Centre', '192.168.1.102', 'offline', 'Network timeout', 36.7754, 3.0602);
  insert.run('Cam-E-12', 'Bab Ezzouar', '192.168.1.103', 'online', null, 36.7144, 3.1842);
  insert.run('Cam-S-08', 'Hydra', '192.168.1.104', 'unknown', null, 36.7456, 3.0333);
}

export default db;
