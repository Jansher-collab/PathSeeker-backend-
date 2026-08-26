import mongoose, { Schema, Document } from 'mongoose';

export interface ISalaryRange {
  entry: number;
  median: number;
  senior: number;
  currency: string;
}

export interface IFutureProjection {
  year: number;
  demandIndex: number; // 0 - 100
  avgSalary: number;
  aiImpactDescription: string;
}

export interface IRequiredSkill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  importance: number; // 1 - 5
}

export interface IRoadmapStep {
  stepNumber: number;
  title: string;
  description: string;
  duration: string;
  resources: {
    title: string;
    url: string;
    type: 'Course' | 'Documentation' | 'Project' | 'Certification';
  }[];
}

export interface IInterviewQuestion {
  question: string;
  idealAnswerNotes: string;
}

export interface ICareer extends Document {
  title: string;
  slug: string;
  domain: string;
  shortDescription: string;
  fullDescription: string;
  heroImage: string;
  salaryRange: ISalaryRange;
  jobDemand: 'Moderate' | 'High' | 'Very High' | 'Explosive';
  growthRate: string;
  automationRisk: number; // Percentage, e.g. 15
  futureDemandProjection: IFutureProjection[];
  requiredSkills: IRequiredSkill[];
  dailyResponsibilities: string[];
  educationPaths: string[];
  roadmapSteps: IRoadmapStep[];
  voicePepTalk: string;
  interviewQuestions: IInterviewQuestion[];
  isTrending: boolean;
  isTopPick: boolean;
  viewsCount: number;
  bookmarksCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CareerSchema = new Schema<ICareer>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    domain: { type: String, required: true, index: true },
    shortDescription: { type: String, required: true },
    fullDescription: { type: String, required: true },
    heroImage: { type: String, required: true },
    salaryRange: {
      entry: { type: Number, required: true },
      median: { type: Number, required: true },
      senior: { type: Number, required: true },
      currency: { type: String, default: 'USD' },
    },
    jobDemand: {
      type: String,
      enum: ['Moderate', 'High', 'Very High', 'Explosive'],
      default: 'High',
    },
    growthRate: { type: String, default: '+22% (Next 5 Years)' },
    automationRisk: { type: Number, default: 15 },
    futureDemandProjection: [
      {
        year: Number,
        demandIndex: Number,
        avgSalary: Number,
        aiImpactDescription: String,
      },
    ],
    requiredSkills: [
      {
        name: String,
        level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
        importance: { type: Number, default: 4 },
      },
    ],
    dailyResponsibilities: [String],
    educationPaths: [String],
    roadmapSteps: [
      {
        stepNumber: Number,
        title: String,
        description: String,
        duration: String,
        resources: [
          {
            title: String,
            url: String,
            type: { type: String, enum: ['Course', 'Documentation', 'Project', 'Certification'], default: 'Course' },
          },
        ],
      },
    ],
    voicePepTalk: { type: String, default: '' },
    interviewQuestions: [
      {
        question: String,
        idealAnswerNotes: String,
      },
    ],
    isTrending: { type: Boolean, default: false },
    isTopPick: { type: Boolean, default: false },
    viewsCount: { type: Number, default: 0 },
    bookmarksCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Career = mongoose.model<ICareer>('Career', CareerSchema);
