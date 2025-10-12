import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const dbPath = resolve(process.cwd(), 'src', 'db.json');

function readDb() {
  try {
    const raw = readFileSync(dbPath, 'utf8');
    const parsed = raw ? JSON.parse(raw) : {};
    if (!parsed.readings) parsed.readings = [];
    if (typeof parsed.lastId !== 'number') {
      const numericIds = (parsed.readings || [])
        .map(r => (typeof r.id === 'number' ? r.id : Number.NaN))
        .filter(n => Number.isFinite(n));
      parsed.lastId = numericIds.length ? Math.max(...numericIds) : 0;
    }
    return parsed;
  } catch (err) {
    return { readings: [], lastId: 0 };
  }
}

function writeDb(db) {
  writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
}

export const store = {
  getAll() {
    const db = readDb();
    return db.readings;
  },
  getById(id) {
    const numericId = typeof id === 'number' ? id : parseInt(id, 10);
    return this.getAll().find(r => r.id === numericId) || null;
  },
  create(reading) {
    const db = readDb();
    const nextId = (db.lastId || 0) + 1;
    const withId = { ...reading, id: nextId };
    db.readings.push(withId);
    db.lastId = nextId;
    writeDb(db);
    return withId;
  },
  update(id, updates) {
    const db = readDb();
    const numericId = typeof id === 'number' ? id : parseInt(id, 10);
    const idx = db.readings.findIndex(r => r.id === numericId);
    if (idx === -1) return null;
    db.readings[idx] = { ...db.readings[idx], ...updates, id: numericId };
    writeDb(db);
    return db.readings[idx];
  },
  remove(id) {
    const db = readDb();
    const numericId = typeof id === 'number' ? id : parseInt(id, 10);
    const before = db.readings.length;
    db.readings = db.readings.filter(r => r.id !== numericId);
    writeDb(db);
    return db.readings.length < before;
  },
  getLatestTemperature() {
    const temps = this.getAll()
      .filter(r => typeof r.temperature === 'number')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return temps[0] || null;
  },
  getByLocation(query) {
    const q = (query || '').toLowerCase();
    return this.getAll().filter(r => (r.location || '').toLowerCase().includes(q));
  }
};


