import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizOption {
  label: string;
  scoreValue: number;
  associatedDomains: string[];
}

export interface IQuizQuestion extends Document {
  questionText: string;
  category: 'Realistic' | 'Investigative' | 'Artistic' | 'Social' | 'Enterprising' | 'Conventional' | 'Tech-Aptitude' | 'Leadership';
  questionType: 'likert' | 'slider' | 'timed_choice';
  weight: number;
  timeLimitSeconds: number;
  sliderMinLabel?: string;
  sliderMaxLabel?: string;
  options: IQuizOption[];
  order: number;
}

const QuizQuestionSchema = new Schema<IQuizQuestion>(
  {
    questionText: { type: String, required: true },
    category: {
      type: String,
      enum: ['Realistic', 'Investigative', 'Artistic', 'Social', 'Enterprising', 'Conventional', 'Tech-Aptitude', 'Leadership'],
      required: true,
    },
    questionType: {
      type: String,
      enum: ['likert', 'slider', 'timed_choice'],
      default: 'likert',
    },
    weight: { type: Number, default: 1 },
    timeLimitSeconds: { type: Number, default: 20 },
    sliderMinLabel: { type: String, default: 'Strongly Disagree / Least Preferred' },
    sliderMaxLabel: { type: String, default: 'Strongly Agree / Most Preferred' },
    options: [
      {
        label: String,
        scoreValue: Number,
        associatedDomains: [String],
      },
    ],
    order: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export const QuizQuestion = mongoose.model<IQuizQuestion>('QuizQuestion', QuizQuestionSchema);
