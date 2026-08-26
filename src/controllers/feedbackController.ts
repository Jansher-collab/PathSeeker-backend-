import { Request, Response } from 'express';
import { Feedback } from '../models/Feedback';
import { mockFeedback } from '../seed/seedData';
import { AuthRequest } from '../middleware/auth';
import { emailService } from '../services/emailService';

// 1. Submit Categorized Feedback
export const submitFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, message, priority = 'Medium', userName, userEmail } = req.body;

    if (!category || !message) {
      res.status(400).json({ success: false, message: 'Please provide category and message.' });
      return;
    }

    const name = req.user?.name || userName || 'Guest Explorer';
    const email = req.user?.email || userEmail || 'guest@pathseeker.io';

    // Auto sentiment heuristic
    const msgLower = message.toLowerCase();
    let sentiment: 'Positive' | 'Neutral' | 'Negative' = 'Neutral';
    if (msgLower.includes('love') || msgLower.includes('great') || msgLower.includes('amazing') || msgLower.includes('helpful') || msgLower.includes('excellent')) {
      sentiment = 'Positive';
    } else if (msgLower.includes('bug') || msgLower.includes('broken') || msgLower.includes('error') || msgLower.includes('fail') || msgLower.includes('crash')) {
      sentiment = 'Negative';
    }

    const feedbackData = {
      user: req.user?._id,
      userName: name,
      userEmail: email,
      category,
      message,
      priority,
      sentiment,
      status: 'New' as const,
      adminNotes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await Feedback.create(feedbackData);
    } catch (e) {
      mockFeedback.unshift({
        _id: `fb-${Date.now()}`,
        ...feedbackData,
      });
    }

    // Trigger form submission emails
    emailService.sendFeedbackConfirmationEmail(email, name).catch(console.error);
    emailService.sendAdminFeedbackNotificationEmail(name, email, category, message).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'Feedback received! Our engineering and career advisory team has been notified.',
      feedback: feedbackData,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get User's Own Feedback History
export const getUserFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const email = req.user?.email;
    let list: any[] = [];

    try {
      list = await Feedback.find({ userEmail: email }).sort({ createdAt: -1 });
    } catch (e) {
      list = mockFeedback.filter((f) => f.userEmail === email);
    }

    res.status(200).json({
      success: true,
      count: list.length,
      feedback: list,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
