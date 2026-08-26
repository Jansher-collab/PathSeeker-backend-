import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  user?: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  category: 'Bug' | 'Feature Suggestion' | 'Career Query' | 'General Feedback';
  message: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  status: 'New' | 'In Progress' | 'Resolved';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    category: {
      type: String,
      enum: ['Bug', 'Feature Suggestion', 'Career Query', 'General Feedback'],
      default: 'General Feedback',
      required: true,
      index: true,
    },
    message: { type: String, required: true },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    sentiment: {
      type: String,
      enum: ['Positive', 'Neutral', 'Negative'],
      default: 'Neutral',
    },
    status: {
      type: String,
      enum: ['New', 'In Progress', 'Resolved'],
      default: 'New',
      index: true,
    },
    adminNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Feedback = mongoose.model<IFeedback>('Feedback', FeedbackSchema);
