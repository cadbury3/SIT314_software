import express from 'express';
import { store } from './utils/fileStore.js';
import { getWeatherByQuery } from './utils/weather.js';

const app = express();
app.use(express.json());

// CRUD for sensor readings
app.get('/api/readings', (req, res) => {
  res.json(store.getAll());
});

// Place specific routes BEFORE the dynamic :id route
app.get('/api/readings/location', (req, res) => {
  const { q } = req.query;
  const results = store.getByLocation(q || '');
  res.json(results);
});

app.get('/api/readings/:id', (req, res) => {
  const reading = store.getById(req.params.id);
  if (!reading) return res.status(404).json({ error: 'Not found' });
  res.json(reading);
});

app.post('/api/readings', (req, res) => {
  const { temperature, humidity, wind, smoke, location, timestamp } = req.body || {};
  if (temperature === undefined && humidity === undefined && wind === undefined && smoke === undefined) {
    return res.status(400).json({ error: 'At least one metric required' });
  }
  const reading = {
    temperature: typeof temperature === 'number' ? temperature : undefined,
    humidity: typeof humidity === 'number' ? humidity : undefined,
    wind: typeof wind === 'number' ? wind : undefined,
    smoke: typeof smoke === 'number' ? smoke : undefined,
    location: location || '',
    timestamp: timestamp || new Date().toISOString()
  };
  res.status(201).json(store.create(reading));
});

app.put('/api/readings/:id', (req, res) => {
  const updates = { ...req.body };
  const updated = store.update(req.params.id, updates);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

app.delete('/api/readings/:id', (req, res) => {
  const ok = store.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

// Special endpoints
app.get('/api/temperature/latest', (req, res) => {
  const latest = store.getLatestTemperature();
  if (!latest) return res.status(404).json({ error: 'No temperature readings' });
  res.json(latest);
});

// moved above

// weather-js integration
app.get('/api/weather', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'q required (e.g., city, state)' });
    const weather = await getWeatherByQuery(q);
    res.json(weather);
  } catch (err) {
    res.status(500).json({ error: 'Weather lookup failed' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


