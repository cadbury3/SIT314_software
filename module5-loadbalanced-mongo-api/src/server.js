import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import os from 'os';
import { connectToDatabase, pingDatabase } from './utils/db.js';
import readingsRouter from './routes/readings.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const serviceName = process.env.SERVICE_NAME || 'module5-api';

app.get('/health', async (req, res) => {
	try {
		await pingDatabase();
		res.status(200).json({ status: 'ok', service: serviceName, instance: os.hostname() });
	} catch (err) {
		res.status(500).json({ status: 'error', message: 'db ping failed' });
	}
});

app.use('/api/readings', readingsRouter);

app.use((err, req, res, next) => {
	const status = err.status || 500;
	res.status(status).json({ error: err.message || 'internal error' });
});

const port = Number(process.env.PORT || 3000);

(async () => {
	await connectToDatabase(process.env.MONGO_URI);
	app.listen(port, () => {
		console.log(`[${serviceName}] listening on :${port}`);
	});
})();
