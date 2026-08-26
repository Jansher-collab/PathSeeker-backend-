import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'Student' | 'Graduate' | 'Working Professional' | 'Admin';

export interface IEducation {
  degree: string;
  institution: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  grade?: string;
}

export interface IExperience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface IBookmark {
  _id?: string;
  itemId: string;
  itemType: 'career' | 'multimedia' | 'story' | 'resource';
  title: string;
  slug?: string;
  domain?: string;
  notes?: string;
  createdAt: Date;
}

export interface IVisaStamp {
  id: string;
  title: string;
  category: string;
  icon: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  unlockedAt: Date;
  description: string;
  code: string;
}

export interface IQuizResult {
  quizId: string;
  score: number;
  hollandScores: {
    realistic: number;
    investigative: number;
    artistic: number;
    social: number;
    enterprising: number;
    conventional: number;
  };
  recommendedCareers: string[];
  completedAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar: string;
  bio: string;
  targetRole: string;
  education: IEducation[];
  skills: string[];
  interests: string[];
  experience: IExperience[];
  resumeUrl?: string;
  resumeText?: string;
  bookmarks: IBookmark[];
  visaStamps: IVisaStamp[];
  quizHistory: IQuizResult[];
  isEmailVerified: boolean;
  emailVerifyToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['Student', 'Graduate', 'Working Professional', 'Admin'],
      default: 'Student',
      required: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: { type: String, default: 'Exploring my career horizons with PathSeeker Passport.' },
    targetRole: { type: String, default: 'Full Stack Engineer' },
    education: [
      {
        degree: String,
        institution: String,
        fieldOfStudy: String,
        startYear: String,
        endYear: String,
        grade: String,
      },
    ],
    skills: { type: [String], default: ['JavaScript', 'React', 'Problem Solving'] },
    interests: { type: [String], default: ['Web Development', 'Artificial Intelligence', 'Product Architecture'] },
    experience: [
      {
        title: String,
        company: String,
        location: String,
        startDate: String,
        endDate: String,
        current: Boolean,
        description: String,
      },
    ],
    resumeUrl: { type: String, default: '' },
    resumeText: { type: String, default: '' },
    bookmarks: [
      {
        itemId: String,
        itemType: { type: String, enum: ['career', 'multimedia', 'story', 'resource'] },
        title: String,
        slug: String,
        domain: String,
        notes: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    visaStamps: [
      {
        id: String,
        title: String,
        category: String,
        icon: String,
        tier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' },
        unlockedAt: { type: Date, default: Date.now },
        description: String,
        code: String,
      },
    ],
    quizHistory: [
      {
        quizId: String,
        score: Number,
        hollandScores: {
          realistic: Number,
          investigative: Number,
          artistic: Number,
          social: Number,
          enterprising: Number,
          conventional: Number,
        },
        recommendedCareers: [String],
        completedAt: { type: Date, default: Date.now },
      },
    ],
    isEmailVerified: { type: Boolean, default: true },
    emailVerifyToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
