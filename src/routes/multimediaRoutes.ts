import { Router } from 'express';
import { getAllMultimedia, getMultimediaDetails, addRatingOrVote } from '../controllers/multimediaController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', getAllMultimedia);
router.get('/:idOrSlug', getMultimediaDetails);
router.post('/:id/feedback', addRatingOrVote);

export default router;
