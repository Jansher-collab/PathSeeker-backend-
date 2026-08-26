import mongoose, { Schema, Document } from 'mongoose';

export interface ISuccessStory extends Document {
  authorName: string;
  authorRole: string;
  company: string;
  avatarUrl: string;
  domain: string;
  currentSalary?: string;
  timeToTransition: string; // e.g. "8 Months"
  educationalPath: string; // Step 1 in timeline
  challenges: string; // Step 2 in timeline
  breakthroughMilestones: string; // Step 3 in timeline
  outcome: string; // Step 4 in timeline
  adviceForOthers: string;
  status: 'pending' | 'approved' | 'rejected' | 'featured';
  user?: mongoose.Types.ObjectId;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SuccessStorySchema = new Schema<ISuccessStory>(
  {
    authorName: { type: String, required: true },
    authorRole: { type: String, required: true },
    company: { type: String, required: true },
    avatarUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    domain: { type: String, required: true, index: true },
    currentSalary: { type: String, default: '$120,000 / yr' },
    timeToTransition: { type: String, default: '6 Months' },
    educationalPath: { type: String, required: true },
    challenges: { type: String, required: true },
    breakthroughMilestones: { type: String, required: true },
    outcome: { type: String, required: true },
    adviceForOthers: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'featured'],
      default: 'pending',
      index: true,
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    likesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const SuccessStory = mongoose.model<ISuccessStory>('SuccessStory', SuccessStorySchema);
