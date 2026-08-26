import mongoose, { Schema, Document } from 'mongoose';

export interface IResource extends Document {
  title: string;
  slug: string;
  description: string;
  category: string; // e.g. "Resume Templates", "Interview Cheatsheets", "Salary Benchmark", "Skill Checklists"
  targetAudience: 'Student' | 'Graduate' | 'Working Professional' | 'All';
  format: 'PDF' | 'Checklist' | 'Infographic' | 'Spreadsheet' | 'Cheatsheet';
  fileUrl: string;
  previewSnippet: string;
  pagesCount: number;
  fileSize: string; // e.g. "2.4 MB"
  downloadCount: number;
  tags: string[];
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    targetAudience: {
      type: String,
      enum: ['Student', 'Graduate', 'Working Professional', 'All'],
      default: 'All',
      index: true,
    },
    format: {
      type: String,
      enum: ['PDF', 'Checklist', 'Infographic', 'Spreadsheet', 'Cheatsheet'],
      default: 'PDF',
    },
    fileUrl: { type: String, required: true },
    previewSnippet: { type: String, required: true },
    pagesCount: { type: Number, default: 4 },
    fileSize: { type: String, default: '1.8 MB' },
    downloadCount: { type: Number, default: 42 },
    tags: [String],
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Resource = mongoose.model<IResource>('Resource', ResourceSchema);
