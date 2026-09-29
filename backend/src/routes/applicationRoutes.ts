import { Router } from 'express';
import {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
} from '../controllers/applicationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createApplication);
router.get('/', getApplications);
router.get('/:id', getApplicationById);
router.put('/:id/status', updateApplicationStatus);

export default router;
