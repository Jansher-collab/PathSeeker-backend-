import mongoose from 'mongoose';

let isConnected = false;
let isMockStoreActive = false;

export const connectDB = async (): Promise<boolean> => {
  if (isConnected) {
    console.log('[Database] Using existing MongoDB cached connection.');
    return true;
  }

  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/PathSeeker';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = conn.connections[0].readyState === 1;
    isMockStoreActive = false;
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error: any) {
    console.error(`[Database] MongoDB connection failed: ${error.message}`);
    process.exit(1); // Exit process with failure since we strictly need DB
  }
};

export const getDbStatus = () => ({
  isConnected,
  isMockStoreActive,
  provider: isConnected ? 'MongoDB (Mongoose)' : 'In-Memory Fallback Store',
});
