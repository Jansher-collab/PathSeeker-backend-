import mongoose from 'mongoose';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

let isMockStoreActive = false;

export const connectDB = async (): Promise<boolean> => {
  if (cached.conn) {
    console.log('[Database] Using existing globally cached MongoDB connection.');
    return true;
  }

  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/PathSeeker';

  try {
    if (!cached.promise) {
      cached.promise = mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      }).then((mongooseInstance) => {
        return mongooseInstance;
      });
    }
    
    cached.conn = await cached.promise;
    isMockStoreActive = false;
    console.log(`[Database] MongoDB Connected successfully: ${cached.conn.connection.host}`);
    return true;
  } catch (error: any) {
    cached.promise = null;
    isMockStoreActive = true;
    console.error(`[Database] MongoDB connection failed: ${error.message}. Falling back to in-memory store.`);
    return false;
  }
};

export const getDbStatus = () => ({
  isConnected: !!cached.conn,
  isMockStoreActive,
  provider: cached.conn ? 'MongoDB (Mongoose)' : 'In-Memory Fallback Store',
});
