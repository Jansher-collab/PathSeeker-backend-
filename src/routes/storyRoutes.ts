import { Router } from 'express';
import { getApprovedStories, submitStory, likeStory } from '../controllers/storyController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', getApprovedStories);
router.post('/submit', protect, submitStory);
router.post('/:id/like', likeStory);

export default router;
