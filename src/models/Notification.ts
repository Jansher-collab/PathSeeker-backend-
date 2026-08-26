import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'visa_stamp' | 'security' | 'quiz_result' | 'admin_announcement' | 'system' | 'story_approved';
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['visa_stamp', 'security', 'quiz_result', 'admin_announcement', 'system', 'story_approved'],
      default: 'system',
    },
    isRead: { type: Boolean, default: false },
    actionUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
