import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const EDGE_URL = `http://localhost:${process.env.EDGE_PORT || 4000}`;
const INTERVAL = Number(process.env.SENSORS_INTERVAL_MS || 30000);

function rand(min, max) { return Math.round((Math.random() * (max - min) + min) * 10) / 10; }

async function send(type, value, unit) {
  try {
    await axios.post(`${EDGE_URL}/ingest`, { type, value, unit, sourceId: `sim-${type}` });
  } catch (e) {
    // swallow for simulator
  }
}

setInterval(() => {
  send('temperature', rand(18, 30), 'C');
  send('humidity', rand(30, 80), '%');
  send('occupancy', Math.floor(rand(0, 40)), 'persons');
}, INTERVAL);


