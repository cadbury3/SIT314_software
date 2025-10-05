import mongoose from 'mongoose';

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI not set');
  }
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || 'smart-seminar-room' });
}


