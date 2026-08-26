import { Router } from 'express';
import { submitFeedback, getUserFeedback } from '../controllers/feedbackController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/', submitFeedback);
router.get('/my-history', protect, getUserFeedback);

export default router;
