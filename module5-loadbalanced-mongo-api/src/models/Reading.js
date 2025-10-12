import mongoose from 'mongoose';
import Counter from './Counter.js';

const ReadingSchema = new mongoose.Schema(
	{
		readingId: { type: Number, index: true, unique: true },
		deviceId: { type: String, required: true, index: true },
		type: { type: String, enum: ['temperature', 'humidity', 'smoke', 'wind'], required: true },
		value: { type: Number, required: true },
		unit: { type: String, required: true },
		meta: { type: Object },
	},
	{ timestamps: true }
);

ReadingSchema.pre('save', async function assignReadingId(next) {
	if (this.readingId) return next();
	try {
		const counter = await Counter.findOneAndUpdate(
			{ key: 'reading' },
			{ $inc: { seq: 1 } },
			{ new: true, upsert: true }
		);
		this.readingId = counter.seq || 1;
		return next();
	} catch (err) {
		return next(err);
	}
});

export default mongoose.models.Reading || mongoose.model('Reading', ReadingSchema);
