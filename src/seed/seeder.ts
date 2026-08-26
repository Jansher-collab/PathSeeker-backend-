import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Career } from '../models/Career';
import { QuizQuestion } from '../models/QuizQuestion';
import { Multimedia } from '../models/Multimedia';
import { Resource } from '../models/Resource';
import { SuccessStory } from '../models/SuccessStory';
import { Feedback } from '../models/Feedback';
import { Notification } from '../models/Notification';
import {
  mockUsers,
  mockCareers,
  mockQuizQuestions,
  mockMultimedia,
  mockResources,
  mockSuccessStories,
  mockFeedback,
  mockNotifications,
} from './seedData';

dotenv.config();

const seedDatabase = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pathseeker';

  try {
    console.log(`[Seeder] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 4000 });
    console.log('[Seeder] Connected successfully.');

    // Clean existing collections
    await User.deleteMany({});
    await Career.deleteMany({});
    await QuizQuestion.deleteMany({});
    await Multimedia.deleteMany({});
    await Resource.deleteMany({});
    await SuccessStory.deleteMany({});
    await Feedback.deleteMany({});
    await Notification.deleteMany({});

    console.log('[Seeder] Cleared old collections.');

    // Insert seeded records
    await User.insertMany(mockUsers);
    await Career.insertMany(mockCareers);
    await QuizQuestion.insertMany(mockQuizQuestions);
    await Multimedia.insertMany(mockMultimedia);
    await Resource.insertMany(mockResources);
    await SuccessStory.insertMany(mockSuccessStories);
    await Feedback.insertMany(mockFeedback);
    await Notification.insertMany(mockNotifications);

    console.log('[Seeder] Database seeded with Career Passport production dataset successfully! 🚀');
    process.exit(0);
  } catch (error: any) {
    console.error(`[Seeder Warning] Database seeding skipped or failed (${error.message}). The application will utilize the built-in in-memory fallback dataset.`);
    process.exit(0);
  }
};

seedDatabase();
