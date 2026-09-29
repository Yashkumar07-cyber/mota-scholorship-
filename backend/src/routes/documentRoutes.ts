import { Router } from 'express';
import {
  getDocuments,
  uploadDocument,
  verifyDocumentById,
  deleteDocument,
} from '../controllers/documentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getDocuments);
router.post('/', uploadDocument);
router.post('/:id/verify', verifyDocumentById);
router.delete('/:id', deleteDocument);

export default router;
