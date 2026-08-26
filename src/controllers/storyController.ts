import { Request, Response } from 'express';
import { SuccessStory } from '../models/SuccessStory';
import { mockSuccessStories } from '../seed/seedData';
import { AuthRequest } from '../middleware/auth';

// 1. Get Approved / Featured Success Stories
export const getApprovedStories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { domain } = req.query;

    let stories: any[] = [];
    try {
      const filter: any = { status: { $in: ['approved', 'featured'] } };
      if (domain && domain !== 'All') filter.domain = domain;
      stories = await SuccessStory.find(filter).sort({ createdAt: -1 });
    } catch (e) {
      stories = mockSuccessStories.filter((s) => {
        if (s.status !== 'approved' && s.status !== 'featured') return false;
        if (domain && domain !== 'All' && s.domain !== domain) return false;
        return true;
      });
    }

    res.status(200).json({
      success: true,
      count: stories.length,
      stories,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. User Submission Portal (Requires Admin Approval)
export const submitStory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      authorName,
      authorRole,
      company,
      domain,
      currentSalary,
      timeToTransition,
      educationalPath,
      challenges,
      breakthroughMilestones,
      outcome,
      adviceForOthers,
      avatarUrl,
    } = req.body;

    if (!authorName || !authorRole || !educationalPath || !challenges || !breakthroughMilestones || !outcome) {
      res.status(400).json({ success: false, message: 'Please complete all required timeline fields.' });
      return;
    }

    const storyData = {
      authorName,
      authorRole,
      company: company || 'Independent / Tech Firm',
      avatarUrl: avatarUrl || req.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      domain: domain || 'Software Engineering',
      currentSalary: currentSalary || '$120,000 / yr',
      timeToTransition: timeToTransition || '6 Months',
      educationalPath,
      challenges,
      breakthroughMilestones,
      outcome,
      adviceForOthers: adviceForOthers || 'Keep building and documenting your trajectory.',
      status: 'pending' as const,
      user: req.user?._id,
      likesCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await SuccessStory.create(storyData);
    } catch (e) {
      mockSuccessStories.unshift({
        _id: `story-${Date.now()}`,
        ...storyData,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Your success story has been submitted! It is currently pending review by PathSeeker Administrators.',
      story: storyData,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Like Success Story
export const likeStory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let story: any;

    try {
      story = await SuccessStory.findById(id);
      if (story) {
        story.likesCount = (story.likesCount || 0) + 1;
        await story.save();
      }
    } catch (e) {
      story = mockSuccessStories.find((s) => s._id === id);
      if (story) story.likesCount = (story.likesCount || 0) + 1;
    }

    res.status(200).json({
      success: true,
      likesCount: story ? story.likesCount : 1,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
