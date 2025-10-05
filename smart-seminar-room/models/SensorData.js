import mongoose from 'mongoose';

const SensorDataSchema = new mongoose.Schema({
  sensorType: { type: String, required: true },
  value: { type: Number, required: true },
  unit: { type: String },
  sourceId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const SensorData = mongoose.models.SensorData || mongoose.model('SensorData', SensorDataSchema);


