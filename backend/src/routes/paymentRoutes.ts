import { Router } from 'express';
import { getPayments } from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getPayments);

export default router;
