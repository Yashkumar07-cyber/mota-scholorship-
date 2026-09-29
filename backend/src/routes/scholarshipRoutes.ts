import { Router } from 'express';
import {
  getAllScholarships,
  getScholarshipById,
  checkEligibility,
} from '../controllers/scholarshipController';
import { optionalAuthenticate } from '../middleware/auth';

const router = Router();

router.get('/', getAllScholarships);
router.get('/:id', getScholarshipById);
router.post('/eligibility/check', optionalAuthenticate, checkEligibility);

export default router;
