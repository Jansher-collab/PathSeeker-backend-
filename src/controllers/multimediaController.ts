import { Request, Response } from 'express';
import { Multimedia } from '../models/Multimedia';
import { mockMultimedia } from '../seed/seedData';
import { AuthRequest } from '../middleware/auth';

// 1. Get All Multimedia with Category & Tag Filtering
export const getAllMultimedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, type, search } = req.query;

    let items: any[] = [];
    try {
      const filter: any = {};
      if (category && category !== 'All') filter.category = category;
      if (type && type !== 'All') filter.type = type;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { speakerName: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search as string, 'i')] } },
        ];
      }
      items = await Multimedia.find(filter).sort({ createdAt: -1 });
    } catch (e) {
      items = mockMultimedia.filter((m) => {
        if (category && category !== 'All' && m.category !== category) return false;
        if (type && type !== 'All' && m.type !== type) return false;
        if (search) {
          const s = (search as string).toLowerCase();
          const matchTitle = m.title.toLowerCase().includes(s);
          const matchSpeaker = m.speakerName.toLowerCase().includes(s);
          const matchTag = m.tags.some((t: any) => t.toLowerCase().includes(s));
          if (!matchTitle && !matchSpeaker && !matchTag) return false;
        }
        return true;
      });
    }

    const categories = ['All', 'Day in the Life', 'Masterclass', 'Tech Deep Dive', 'Career Pivot'];

    res.status(200).json({
      success: true,
      count: items.length,
      categories,
      multimedia: items,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get Single Multimedia with Transcript
export const getMultimediaDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const idOrSlug = String(req.params.idOrSlug);
    let item: any;

    try {
      item = await Multimedia.findOne({
        $or: [{ slug: idOrSlug.toLowerCase() }, { _id: idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? idOrSlug : null }],
      });
      if (item) {
        item.viewsCount = (item.viewsCount || 0) + 1;
        await item.save();
      }
    } catch (e) {
      item = mockMultimedia.find((m) => m.slug === idOrSlug.toLowerCase() || m._id === idOrSlug);
    }

    if (!item) {
      item = mockMultimedia.find((m) => m.slug === idOrSlug.toLowerCase() || m._id === idOrSlug);
    }

    if (!item) {
      res.status(404).json({ success: false, message: 'Multimedia content not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      multimedia: item,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Add Rating & Review / Thumbs Vote
export const addRatingOrVote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, comment, voteType } = req.body; // voteType: 'up' | 'down'

    let item: any;
    try {
      item = await Multimedia.findById(id);
    } catch (e) {
      item = mockMultimedia.find((m) => m._id === id || m.slug === id);
    }

    if (!item) {
      item = mockMultimedia.find((m) => m._id === id || m.slug === id);
    }

    if (!item) {
      res.status(404).json({ success: false, message: 'Multimedia not found.' });
      return;
    }

    if (voteType === 'up') {
      item.thumbsUpCount = (item.thumbsUpCount || 0) + 1;
    } else if (voteType === 'down') {
      item.thumbsDownCount = (item.thumbsDownCount || 0) + 1;
    }

    if (rating) {
      const newReview = {
        user: req.user?._id || 'anonymous',
        userName: req.user?.name || 'Guest Explorer',
        rating: Number(rating),
        comment: comment || 'Great insights and practical guidance!',
        createdAt: new Date(),
      };
      if (!item.ratings) item.ratings = [];
      item.ratings.unshift(newReview);
      item.totalReviews = item.ratings.length;
      const sum = item.ratings.reduce((acc: number, r: any) => acc + r.rating, 0);
      item.averageRating = Number((sum / item.ratings.length).toFixed(1));
    }

    if (item.save) await item.save();

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully.',
      multimedia: item,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
