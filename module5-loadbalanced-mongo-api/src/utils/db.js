import mongoose from 'mongoose';

let isConnected = false;

export async function connectToDatabase(mongoUri) {
	if (isConnected) return;
	if (!mongoUri) throw new Error('MONGO_URI missing');
	mongoose.set('strictQuery', true);
	await mongoose.connect(mongoUri, { dbName: mongoose.connection?.client?.options?.dbName || undefined });
	isConnected = true;
}

export async function pingDatabase() {
	if (!mongoose.connection?.readyState) throw new Error('db not connected');
	await mongoose.connection.db.admin().ping();
}
