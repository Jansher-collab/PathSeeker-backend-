import mongoose, { Schema, Document } from 'mongoose';

export interface ITranscriptLine {
  timestamp: string; // e.g. "01:24"
  speaker: string;
  text: string;
}

export interface IRating {
  user: mongoose.Types.ObjectId;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: Date;
}

export interface IMultimedia extends Document {
  title: string;
  slug: string;
  type: 'video' | 'audio';
  mediaUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
  duration: string; // e.g. "14:32"
  category: string; // e.g. "Day in the Life", "Tech Deep Dive", "Masterclass", "Career Pivot"
  speakerName: string;
  speakerRole: string;
  speakerAvatar: string;
  description: string;
  transcript: ITranscriptLine[];
  tags: string[];
  ratings: IRating[];
  averageRating: number;
  totalReviews: number;
  thumbsUpCount: number;
  thumbsDownCount: number;
  isFeatured: boolean;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const MultimediaSchema = new Schema<IMultimedia>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    type: { type: String, enum: ['video', 'audio'], default: 'video', required: true },
    mediaUrl: { type: String, required: true },
    embedUrl: { type: String, default: '' },
    thumbnailUrl: { type: String, required: true },
    duration: { type: String, default: '10:00' },
    category: { type: String, required: true, index: true },
    speakerName: { type: String, required: true },
    speakerRole: { type: String, default: 'Industry Expert' },
    speakerAvatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    description: { type: String, required: true },
    transcript: [
      {
        timestamp: String,
        speaker: String,
        text: String,
      },
    ],
    tags: [String],
    ratings: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        userName: String,
        rating: Number,
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    averageRating: { type: Number, default: 4.8 },
    totalReviews: { type: Number, default: 0 },
    thumbsUpCount: { type: Number, default: 24 },
    thumbsDownCount: { type: Number, default: 1 },
    isFeatured: { type: Boolean, default: false },
    viewsCount: { type: Number, default: 120 },
  },
  { timestamps: true }
);

export const Multimedia = mongoose.model<IMultimedia>('Multimedia', MultimediaSchema);
