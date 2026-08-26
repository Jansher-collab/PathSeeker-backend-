import { Router } from 'express';
import { getAllResources, trackDownload } from '../controllers/resourceController';

const router = Router();

router.get('/', getAllResources);
router.post('/:id/download', trackDownload);

export default router;
