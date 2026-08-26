import { Router } from 'express';
import { getQuizQuestions, submitQuiz, getQuizHistory } from '../controllers/quizController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/questions', getQuizQuestions);
router.post('/submit', protect, submitQuiz);
router.post('/submit-guest', submitQuiz); // Allow guest submissions
router.get('/history', protect, getQuizHistory);

export default router;
