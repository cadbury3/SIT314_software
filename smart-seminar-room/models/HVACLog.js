import mongoose from 'mongoose';

const HVACLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  config: { type: Object },
  hvacResponse: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

export const HVACLog = mongoose.models.HVACLog || mongoose.model('HVACLog', HVACLogSchema);


