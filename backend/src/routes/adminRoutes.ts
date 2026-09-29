import { Router } from 'express';
import {
  getAdminDashboardMetrics,
  getManualReviewQueue,
  handleManualReviewDecision,
  getOutreachCandidates,
  updateOutreachCandidateStatus,
  scanOutreach,
  getAuditLogs,
} from '../controllers/adminController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(requireRole('ADMIN', 'VERIFICATION_OFFICER'));

router.get('/dashboard', getAdminDashboardMetrics);
router.get('/manual-reviews', getManualReviewQueue);
router.post('/manual-reviews/:id/decision', handleManualReviewDecision);
router.get('/outreach', getOutreachCandidates);
router.post('/outreach/:id/status', updateOutreachCandidateStatus);
router.post('/outreach/scan', scanOutreach);
router.get('/audit-logs', getAuditLogs);

export default router;
