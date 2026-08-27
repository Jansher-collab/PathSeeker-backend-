import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import morgan from 'morgan';
import { connectDB, getDbStatus } from './config/db';
import { errorHandler } from './middleware/errorHandler';

// Environment Variable Validation
const requiredEnv = ['JWT_SECRET'];
requiredEnv.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`[Fatal Error] Missing required environment variable: ${envVar}`);
    // Do not exit process in serverless, just log
  }
});

// Process-level Error Logging
process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection] at:', promise, 'reason:', reason);
});
// Route Imports
import authRoutes from './routes/authRoutes';
import careerRoutes from './routes/careerRoutes';
import quizRoutes from './routes/quizRoutes';
import multimediaRoutes from './routes/multimediaRoutes';
import resourceRoutes from './routes/resourceRoutes';
import storyRoutes from './routes/storyRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import aiRoutes from './routes/aiRoutes';
import bookmarkRoutes from './routes/bookmarkRoutes';
import adminRoutes from './routes/adminRoutes';

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Connect to Database with cached connection & graceful in-memory fallback
connectDB();

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Health & System Status Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  const dbStatus = getDbStatus();
  res.status(200).json({
    status: 'online',
    service: 'PathSeeker Career Passport API Engine',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    version: '1.0.0',
    availableRoles: ['Student', 'Graduate', 'Working Professional', 'Admin'],
  });
});

import { User } from './models/User';
import Path from './models/Path';

// Database Verification Endpoint
app.get('/api/test-db', async (req: Request, res: Response) => {
  try {
    // 1. Create a dummy user
    const dummyUser = new User({
      name: 'Test User',
      email: `testuser_${Date.now()}@example.com`,
      password: 'password123',
      role: 'Student',
    });
    await dummyUser.save();

    // 2. Create a dummy path referencing the user
    const dummyPath = new Path({
      title: 'My First Path',
      description: 'A test path to verify database insertion',
      steps: ['Step 1', 'Step 2'],
      createdBy: dummyUser._id,
    });
    await dummyPath.save();

    res.status(200).json({
      success: true,
      message: 'Dummy User and Path created successfully! Database is fully wired up.',
      user: dummyUser,
      path: dummyPath,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create dummy records.',
      error: error.message,
    });
  }
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/multimedia', multimediaRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.send('PathSeeker Career Passport API Server is running. Access endpoints via /api/*');
});

// Global Error Handler
app.use(errorHandler);

// Start Server (Only in local development, not when imported as serverless function)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🧭 PathSeeker API Server running on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`======================================================\n`);
  });
}

export default app;
module.exports = app;
