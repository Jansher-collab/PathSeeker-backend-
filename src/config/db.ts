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

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('[Database] Warning: MONGO_URI and MONGODB_URI are missing from environment variables. Falling back to in-memory store.');
    isMockStoreActive = true;
    return false;
  }

  try {
    if (!cached.promise) {
      console.log('[Database] Initiating new MongoDB connection...');
      cached.promise = mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
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
    console.error(`[Database] MongoDB connection failed. Error Details: ${error.stack || error.message}`);
    console.error('[Database] Falling back to in-memory store gracefully.');
    return false;
  }
};

export const getDbStatus = () => ({
  isConnected: !!cached.conn,
  isMockStoreActive,
  provider: cached.conn ? 'MongoDB (Mongoose)' : 'In-Memory Fallback Store',
});
