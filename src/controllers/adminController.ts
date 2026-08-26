import { Request, Response } from 'express';
import { User } from '../models/User';
import { Career } from '../models/Career';
import { QuizQuestion } from '../models/QuizQuestion';
import { Multimedia } from '../models/Multimedia';
import { Resource } from '../models/Resource';
import { SuccessStory } from '../models/SuccessStory';
import { Feedback } from '../models/Feedback';
import {
  mockUsers,
  mockCareers,
  mockQuizQuestions,
  mockMultimedia,
  mockResources,
  mockSuccessStories,
  mockFeedback,
} from '../seed/seedData';
import { AuthRequest } from '../middleware/auth';

// 1. Platform Analytics Dashboard Metrics
export const getPlatformAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let totalUsers = mockUsers.length;
    let studentsCount = mockUsers.filter((u) => u.role === 'Student').length;
    let gradsCount = mockUsers.filter((u) => u.role === 'Graduate').length;
    let prosCount = mockUsers.filter((u) => u.role === 'Working Professional').length;
    let totalQuizzes = 142;
    let totalCareers = mockCareers.length;
    let totalResources = mockResources.length;
    let totalStories = mockSuccessStories.length;
    let pendingStories = mockSuccessStories.filter((s) => s.status === 'pending').length;
    let totalFeedback = mockFeedback.length;

    try {
      totalUsers = await User.countDocuments();
      studentsCount = await User.countDocuments({ role: 'Student' });
      gradsCount = await User.countDocuments({ role: 'Graduate' });
      prosCount = await User.countDocuments({ role: 'Working Professional' });
      totalCareers = await Career.countDocuments();
      totalResources = await Resource.countDocuments();
      totalStories = await SuccessStory.countDocuments();
      pendingStories = await SuccessStory.countDocuments({ status: 'pending' });
      totalFeedback = await Feedback.countDocuments();
    } catch (e) {
      // Use in-memory counts
    }

    const roleDistribution = [
      { role: 'Student', count: studentsCount, percentage: Math.round((studentsCount / (totalUsers || 1)) * 100) },
      { role: 'Graduate', count: gradsCount, percentage: Math.round((gradsCount / (totalUsers || 1)) * 100) },
      { role: 'Working Professional', count: prosCount, percentage: Math.round((prosCount / (totalUsers || 1)) * 100) },
      { role: 'Admin', count: 1, percentage: 5 },
    ];

    const sentimentOverview = {
      positive: mockFeedback.filter((f) => f.sentiment === 'Positive').length,
      neutral: mockFeedback.filter((f) => f.sentiment === 'Neutral').length,
      negative: mockFeedback.filter((f) => f.sentiment === 'Negative').length,
    };

    const mostPopularCareers = mockCareers.slice(0, 5).map((c) => ({
      id: c._id,
      title: c.title,
      domain: c.domain,
      views: c.viewsCount,
      bookmarks: c.bookmarksCount,
    }));

    res.status(200).json({
      success: true,
      metrics: {
        totalUsers,
        totalQuizzes,
        totalCareers,
        totalResources,
        totalStories,
        pendingStories,
        totalFeedback,
        roleDistribution,
        sentimentOverview,
        mostPopularCareers,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. User Management: List All Users
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let users: any[] = [];
    try {
      users = await User.find().select('-password').sort({ createdAt: -1 });
    } catch (e) {
      users = mockUsers.map((u) => {
        const copy = { ...u };
        delete (copy as any).password;
        return copy;
      });
    }

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Update User Role
export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['Student', 'Graduate', 'Working Professional', 'Admin'].includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role specified.' });
      return;
    }

    let user: any;
    try {
      user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    } catch (e) {
      user = mockUsers.find((u) => u._id === userId);
      if (user) user.role = role;
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}.`,
      user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Success Story Moderation
export const moderateStory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { storyId } = req.params;
    const { status } = req.body; // 'approved' | 'rejected' | 'featured'

    if (!['approved', 'rejected', 'featured', 'pending'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status.' });
      return;
    }

    let story: any;
    try {
      story = await SuccessStory.findByIdAndUpdate(storyId, { status }, { new: true });
    } catch (e) {
      story = mockSuccessStories.find((s) => s._id === storyId);
      if (story) story.status = status;
    }

    res.status(200).json({
      success: true,
      message: `Story status updated to ${status}.`,
      story,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Feedback Moderation & Pipeline
export const updateFeedbackStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { feedbackId } = req.params;
    const { status, adminNotes } = req.body;

    let fb: any;
    try {
      fb = await Feedback.findByIdAndUpdate(
        feedbackId,
        {
          ...(status && { status }),
          ...(adminNotes !== undefined && { adminNotes }),
        },
        { new: true }
      );
    } catch (e) {
      fb = mockFeedback.find((f) => f._id === feedbackId);
      if (fb) {
        if (status) fb.status = status;
        if (adminNotes !== undefined) fb.adminNotes = adminNotes;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Feedback record updated.',
      feedback: fb,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Create / Edit Career Profile (Admin CRUD)
export const saveCareer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const careerData = req.body;
    if (!careerData.title || !careerData.domain) {
      res.status(400).json({ success: false, message: 'Title and domain are required.' });
      return;
    }

    careerData.slug = careerData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    let saved: any;
    try {
      if (careerData._id) {
        saved = await Career.findByIdAndUpdate(careerData._id, careerData, { new: true });
      } else {
        saved = await Career.create(careerData);
      }
    } catch (e) {
      const idx = mockCareers.findIndex((c) => c._id === careerData._id || c.slug === careerData.slug);
      if (idx !== -1) {
        mockCareers[idx] = { ...mockCareers[idx], ...careerData };
        saved = mockCareers[idx];
      } else {
        saved = { _id: `career-${Date.now()}`, ...careerData };
        mockCareers.unshift(saved);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Career profile saved successfully.',
      career: saved,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Delete Career Profile
export const deleteCareer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    try {
      await Career.findByIdAndDelete(id);
    } catch (e) {
      const idx = mockCareers.findIndex((c) => c._id === id);
      if (idx !== -1) mockCareers.splice(idx, 1);
    }

    res.status(200).json({
      success: true,
      message: 'Career profile deleted.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
