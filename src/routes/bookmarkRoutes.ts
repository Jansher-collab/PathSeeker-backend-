import { Router } from 'express';
import { toggleBookmark, updateBookmarkNotes, getUserBookmarks } from '../controllers/bookmarkController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/toggle', protect, toggleBookmark);
router.put('/notes', protect, updateBookmarkNotes);
router.get('/', protect, getUserBookmarks);

export default router;
