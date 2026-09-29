import { Router } from 'express';
import { getProfile, updateProfile, addFamilyMember } from '../controllers/profileController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/family', addFamilyMember);

export default router;
