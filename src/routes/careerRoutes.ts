import { Router } from 'express';
import {
  getAllCareers,
  getSearchAutocomplete,
  getCareerDetails,
  getFeaturedCareers,
} from '../controllers/careerController';

const router = Router();

router.get('/', getAllCareers);
router.get('/autocomplete', getSearchAutocomplete);
router.get('/featured', getFeaturedCareers);
router.get('/:idOrSlug', getCareerDetails);

export default router;
