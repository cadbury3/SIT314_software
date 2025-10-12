import express from 'express';
import Reading from '../models/Reading.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
	try {
		const reading = await Reading.create(req.body);
		res.status(201).json(reading);
	} catch (err) {
		next(err);
	}
});

router.get('/', async (req, res, next) => {
	try {
		const { deviceId, type, limit = 50 } = req.query;
		const filter = {};
		if (deviceId) filter.deviceId = deviceId;
		if (type) filter.type = type;
		const items = await Reading.find(filter).sort({ createdAt: -1 }).limit(Number(limit));
		res.json(items);
	} catch (err) {
		next(err);
	}
});

router.get('/:readingId', async (req, res, next) => {
	try {
		const id = Number(req.params.readingId);
		const item = await Reading.findOne({ readingId: id });
		if (!item) return res.status(404).json({ error: 'not found' });
		res.json(item);
	} catch (err) {
		next(err);
	}
});

router.put('/:readingId', async (req, res, next) => {
	try {
		const id = Number(req.params.readingId);
		const item = await Reading.findOneAndUpdate({ readingId: id }, req.body, { new: true, runValidators: true });
		if (!item) return res.status(404).json({ error: 'not found' });
		res.json(item);
	} catch (err) {
		next(err);
	}
});

router.delete('/:readingId', async (req, res, next) => {
	try {
		const id = Number(req.params.readingId);
		const result = await Reading.findOneAndDelete({ readingId: id });
		if (!result) return res.status(404).json({ error: 'not found' });
		res.json({ deleted: true });
	} catch (err) {
		next(err);
	}
});

export default router;
