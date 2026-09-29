import { Router } from 'express';
import { handleChatMessage, getChatHistory } from '../controllers/chatController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', handleChatMessage);
router.get('/history', getChatHistory);

export default router;
