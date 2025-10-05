import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import axios from 'axios';
import { connectToDatabase } from './utils/db.js';
import { SensorData } from './models/SensorData.js';
import { HVACLog } from './models/HVACLog.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const EDGE_PORT = process.env.EDGE_PORT || 4000;
const HVAC_BASE_URL = process.env.HVAC_BASE_URL || 'http://localhost:5000';

// Simple comfort ranges
const TARGET_TEMP_C = 22; // center
const TEMP_RANGE = { min: 20, max: 24 };
const HUMIDITY_RANGE = { min: 40, max: 60 };

// Health endpoint
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Sensors post data here
app.post('/ingest', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.type || typeof payload.value === 'undefined') {
      return res.status(400).json({ error: 'Invalid sensor payload' });
    }

    const saved = await SensorData.create({
      sensorType: payload.type,
      value: payload.value,
      unit: payload.unit,
      sourceId: payload.sourceId,
      createdAt: new Date(),
    });

    // Basic decision logic uses latest snapshot
    const snapshot = await latestSnapshot();
    const hvacCommand = decideHVAC(snapshot);

    if (hvacCommand) {
      const response = await axios.post(`${HVAC_BASE_URL}/hvac/config`, hvacCommand, { timeout: 5000 });
      await HVACLog.create({ action: 'apply', config: hvacCommand, hvacResponse: response.data, createdAt: new Date() });
    }

    res.json({ stored: saved._id, applied: Boolean(hvacCommand) });
  } catch (err) {
    res.status(500).json({ error: 'Ingest failed' });
  }
});

// Helper: get latest values per type
async function latestSnapshot() {
  const types = ['temperature', 'humidity', 'occupancy'];
  const results = {};
  for (const t of types) {
    const doc = await SensorData.findOne({ sensorType: t }).sort({ createdAt: -1 }).lean();
    if (doc) results[t] = doc.value;
  }
  return results;
}

// Decide minimal hvac change
function decideHVAC(snapshot) {
  if (!snapshot) return null;
  const { temperature, humidity, occupancy } = snapshot;

  const command = { mode: 'auto', targetTempC: TARGET_TEMP_C, fan: 'auto', ventilation: 'normal' };
  let changed = false;

  if (typeof temperature === 'number') {
    if (temperature < TEMP_RANGE.min) { command.mode = 'heating'; changed = true; }
    else if (temperature > TEMP_RANGE.max) { command.mode = 'cooling'; changed = true; }
  }

  if (typeof humidity === 'number') {
    if (humidity > HUMIDITY_RANGE.max) { command.ventilation = 'high'; changed = true; }
    else if (humidity < HUMIDITY_RANGE.min) { command.ventilation = 'low'; changed = true; }
  }

  if (typeof occupancy === 'number') {
    if (occupancy === 0) { command.fan = 'low'; changed = true; }
    else if (occupancy > 20) { command.fan = 'high'; changed = true; }
  }

  return changed ? command : null;
}

await connectToDatabase();
app.listen(EDGE_PORT, () => {
  // server started
});


