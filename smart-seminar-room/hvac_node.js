import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const HVAC_PORT = process.env.HVAC_PORT || 5000;

let state = {
  mode: 'auto',
  targetTempC: 22,
  fan: 'auto',
  ventilation: 'normal',
  updatedAt: new Date().toISOString(),
};

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/hvac/status', (_req, res) => {
  res.json(state);
});

app.post('/hvac/config', (req, res) => {
  const { mode, targetTempC, fan, ventilation } = req.body || {};
  if (!mode && !targetTempC && !fan && !ventilation) {
    return res.status(400).json({ error: 'No configuration provided' });
  }
  if (mode) state.mode = mode;
  if (typeof targetTempC === 'number') state.targetTempC = targetTempC;
  if (fan) state.fan = fan;
  if (ventilation) state.ventilation = ventilation;
  state.updatedAt = new Date().toISOString();
  res.json({ applied: true, state });
});

app.listen(HVAC_PORT, () => {
  // hvac started
});


