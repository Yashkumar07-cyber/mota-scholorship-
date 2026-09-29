import { Router } from 'express';
import { login, register, getMe, sendOtp } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/otp/send', sendOtp);
router.get('/me', authenticate, getMe);

export default router;
