import { Router } from 'express';
import {
  getPlatformAnalytics,
  getAllUsers,
  updateUserRole,
  moderateStory,
  updateFeedbackStatus,
  saveCareer,
  deleteCareer,
} from '../controllers/adminController';
import { protect } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';

const router = Router();

// Protect all admin routes
router.use(protect, requireAdmin);

router.get('/analytics', getPlatformAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:userId/role', updateUserRole);
router.put('/stories/:storyId/status', moderateStory);
router.put('/feedback/:feedbackId/status', updateFeedbackStatus);
router.post('/careers', saveCareer);
router.delete('/careers/:id', deleteCareer);

export default router;
