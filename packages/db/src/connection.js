import mongoose from 'mongoose';

let conn;
export async function connectMongo(mongoUri = process.env.MONGO_URI) {
  if (conn && mongoose.connection.readyState === 1) return conn;
  if (!mongoUri) throw new Error('MONGO_URI is missing');
  conn = await mongoose.connect(mongoUri, { dbName: 'tripsmith' });
  return conn;
}
