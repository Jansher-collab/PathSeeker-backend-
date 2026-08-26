import { Response } from 'express';
import { User, IBookmark } from '../models/User';
import { mockUsers } from '../seed/seedData';
import { AuthRequest } from '../middleware/auth';

// 1. Toggle Bookmark (Add or Remove)
export const toggleBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const { itemId, itemType, title, slug, domain, notes } = req.body;

    if (!itemId || !itemType) {
      res.status(400).json({ success: false, message: 'Please specify itemId and itemType.' });
      return;
    }

    let user: any;
    try {
      user = await User.findById(userId);
    } catch (e) {
      user = mockUsers.find((u) => u._id === userId.toString());
    }

    if (!user) {
      user = mockUsers.find((u) => u._id === userId.toString());
    }

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (!user.bookmarks) user.bookmarks = [];

    const existingIndex = user.bookmarks.findIndex((b: IBookmark) => b.itemId === itemId);
    let action: 'added' | 'removed';

    if (existingIndex > -1) {
      user.bookmarks.splice(existingIndex, 1);
      action = 'removed';
    } else {
      user.bookmarks.unshift({
        itemId,
        itemType,
        title: title || 'Saved Item',
        slug: slug || itemId,
        domain: domain || 'General',
        notes: notes || '',
        createdAt: new Date(),
      });
      action = 'added';
    }

    if (user.save) await user.save();

    res.status(200).json({
      success: true,
      action,
      bookmarksCount: user.bookmarks.length,
      bookmarks: user.bookmarks,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Update Digital Sticky Notes for a Bookmark
export const updateBookmarkNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const { itemId, notes } = req.body;

    let user: any;
    try {
      user = await User.findById(userId);
    } catch (e) {
      user = mockUsers.find((u) => u._id === userId.toString());
    }

    if (!user) {
      user = mockUsers.find((u) => u._id === userId.toString());
    }

    if (!user || !user.bookmarks) {
      res.status(404).json({ success: false, message: 'Bookmark not found.' });
      return;
    }

    const bookmark = user.bookmarks.find((b: IBookmark) => b.itemId === itemId);
    if (!bookmark) {
      res.status(404).json({ success: false, message: 'Bookmark not found in your list.' });
      return;
    }

    bookmark.notes = notes || '';
    if (user.save) await user.save();

    res.status(200).json({
      success: true,
      message: 'Sticky note updated successfully.',
      bookmark,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get User Bookmarks
export const getUserBookmarks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookmarks = req.user?.bookmarks || [];
    res.status(200).json({
      success: true,
      count: bookmarks.length,
      bookmarks,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
