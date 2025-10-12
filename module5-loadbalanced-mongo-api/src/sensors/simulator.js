import axios from 'axios';

const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
const deviceId = process.env.SIM_DEVICE_ID || 'device-1';
const types = [
	{ type: 'temperature', unit: 'C', min: 10, max: 45 },
	{ type: 'humidity', unit: '%', min: 20, max: 95 },
	{ type: 'smoke', unit: 'ppm', min: 0, max: 400 },
	{ type: 'wind', unit: 'mps', min: 0, max: 25 },
];

function rand(min, max) {
	return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

async function sendOnce() {
	const t = types[Math.floor(Math.random() * types.length)];
	const body = { deviceId, type: t.type, value: rand(t.min, t.max), unit: t.unit };
	try {
		const res = await axios.post(`${baseUrl}/api/readings`, body, { timeout: 4000 });
		console.log('sent readingId', res.data.readingId, body);
	} catch (err) {
		console.error('send error', err.message);
	}
}

const intervalMs = Number(process.env.SIM_INTERVAL_MS || 3000);
console.log(`Simulator targeting ${baseUrl} every ${intervalMs}ms`);
setInterval(sendOnce, intervalMs);
sendOnce();
