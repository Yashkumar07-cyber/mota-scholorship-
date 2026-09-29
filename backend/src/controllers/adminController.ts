import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { outreachService } from '../services/outreach/outreachService';

export const getAdminDashboardMetrics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const totalStudents = await prisma.studentProfile.count();
    const totalApplications = await prisma.application.count();
    const pendingVerification = await prisma.application.count({
      where: {
        status: { in: ['SUBMITTED', 'INSTITUTE_VERIFICATION', 'STATE_VERIFICATION', 'MINISTRY_VERIFICATION'] },
      },
    });
    const manualReview = await prisma.application.count({
      where: { status: 'MANUAL_REVIEW' },
    });
    const sanctioned = await prisma.application.count({
      where: { status: 'SANCTIONED' },
    });
    const disbursed = await prisma.application.count({
      where: { status: 'DISBURSED' },
    });
    const rejectedApplications = await prisma.application.count({
      where: { status: 'REJECTED' },
    });
    const failedPayments = await prisma.payment.count({
      where: { status: 'FAILED' },
    });
    const potentialUnreached = await prisma.outreachCandidate.count({
      where: { outreachStatus: { in: ['UNTOUCHED', 'OUTREACH_PLANNED'] } },
    });

    const totalDisbursedAmountResult = await prisma.payment.aggregate({
      where: { status: 'CREDITED' },
      _sum: { amount: true },
    });
    const totalDisbursedAmount = totalDisbursedAmountResult._sum.amount || 0;

    // Fetch live recent applications with student & scholarship details
    const recentApplications = await prisma.application.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      include: {
        student: true,
        scholarship: true,
        documents: true,
      },
    });

    // Applications by scheme breakdown
    const schemes = await prisma.scholarship.findMany({
      include: {
        _count: { select: { applications: true } },
      },
    });

    const applicationsByScheme = schemes.map((s) => ({
      code: s.code,
      name: s.name,
      count: s._count.applications,
    }));

    // Applications by status breakdown
    const allApps = await prisma.application.findMany({ select: { status: true } });
    const statusCounts: Record<string, number> = {};
    for (const app of allApps) {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    }

    const applicationsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));

    // Verification outcomes from documents
    const docVerifications = await prisma.document.groupBy({
      by: ['verificationStatus'],
      _count: { id: true },
    });

    const verificationOutcomes = docVerifications.map((v) => ({
      status: v.verificationStatus,
      count: v._count.id,
    }));

    return res.json({
      success: true,
      metrics: {
        totalStudents,
        totalApplications,
        pendingVerification,
        manualReview,
        sanctioned,
        disbursed,
        rejected: rejectedApplications,
        failedPayments,
        potentialUnreached,
        totalDisbursedAmount,
      },
      recentApplications,
      charts: {
        applicationsByScheme,
        applicationsByStatus,
        verificationOutcomes,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getManualReviewQueue = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cases = await prisma.application.findMany({
      where: { status: 'MANUAL_REVIEW' },
      include: {
        student: true,
        scholarship: true,
        documents: {
          include: { verifications: true },
        },
        statusHistory: {
          orderBy: { changedAt: 'desc' },
          take: 3,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return res.json({
      success: true,
      count: cases.length,
      cases,
    });
  } catch (error) {
    next(error);
  }
};

export const handleManualReviewDecision = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { decision, remarks, sanctionAmount } = req.body;
    // decision: 'APPROVE' | 'REQUEST_CORRECTION' | 'REJECT'

    const application = await prisma.application.findFirst({
      where: { OR: [{ id }, { applicationId: id }] },
      include: { student: true, scholarship: true },
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    let targetStatus = application.status;
    let targetStage = application.currentStage;
    let notifTitle = '';
    let notifMsg = '';
    let notifType = 'INFO';

    if (decision === 'APPROVE') {
      targetStatus = 'SANCTIONED';
      targetStage = 'Sanction Order Issued';
      notifTitle = 'Application Approved by Verification Desk!';
      notifMsg = `Your application ${application.applicationId} was approved. Sanction order issued for ${application.scholarship.name}.`;
      notifType = 'SUCCESS';

      // Auto-generate DBT payment record
      const amount = Number(sanctionAmount) || (application.scholarship.code === 'PRE_MATRIC' ? 5250 : 36500);
      await prisma.payment.create({
        data: {
          applicationId: application.id,
          studentId: application.studentId,
          amount,
          status: 'CREDITED',
          transactionId: `PFMS-2026-ST-${Math.floor(100000 + Math.random() * 900000)}`,
          paymentDate: new Date(),
          dbtStatus: 'CREDITED',
        },
      });
    } else if (decision === 'REQUEST_CORRECTION') {
      targetStatus = 'DEFICIENCY';
      targetStage = 'Deficiency Action Required';
      notifTitle = 'Document Correction Requested by MoTA Officer';
      notifMsg = remarks || 'Please upload a refreshed or clearer income certificate.';
      notifType = 'ACTION_REQUIRED';
    } else if (decision === 'REJECT') {
      targetStatus = 'REJECTED';
      targetStage = 'Rejected';
      notifTitle = 'Scholarship Application Rejected';
      notifMsg = `Reason: ${remarks || 'Eligibility criteria could not be validated.'}`;
      notifType = 'WARNING';
    }

    const updated = await prisma.application.update({
      where: { id: application.id },
      data: {
        status: targetStatus,
        currentStage: targetStage,
        remarks: remarks || application.remarks,
        sanctionDate: decision === 'APPROVE' ? new Date() : application.sanctionDate,
      },
    });

    // Application status history
    await prisma.applicationStatusHistory.create({
      data: {
        applicationId: application.id,
        fromStatus: application.status,
        toStatus: targetStatus,
        remarks: remarks || `Officer Decision: ${decision}`,
        changedBy: 'Senior Verification Officer (MoTA)',
      },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: application.student.userId,
        title: notifTitle,
        message: notifMsg,
        type: notifType,
        link: `/applications/${application.id}`,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        userRole: 'ADMIN',
        action: `MANUAL_REVIEW_${decision}`,
        entity: 'Application',
        entityId: application.id,
        oldValue: JSON.stringify({ status: application.status }),
        newValue: JSON.stringify({ status: targetStatus, remarks }),
      },
    });

    return res.json({
      success: true,
      message: `Manual review decision "${decision}" recorded successfully.`,
      application: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const getOutreachCandidates = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const candidates = await prisma.outreachCandidate.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      count: candidates.length,
      candidates,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOutreachCandidateStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const candidate = await prisma.outreachCandidate.update({
      where: { id },
      data: {
        outreachStatus: status,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        userRole: 'ADMIN',
        action: 'OUTREACH_STATUS_UPDATED',
        entity: 'OutreachCandidate',
        entityId: candidate.id,
        newValue: JSON.stringify({ status, notes }),
      },
    });

    return res.json({
      success: true,
      message: 'Outreach candidate status updated.',
      candidate,
    });
  } catch (error) {
    next(error);
  }
};

export const scanOutreach = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const newItems = await outreachService.scanAndIdentifyUnreached(prisma);
    return res.json({
      success: true,
      message: `Scan complete. Found ${newItems.length} new potential beneficiaries.`,
      candidates: newItems,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { email: true, mobile: true, role: true } },
      },
    });

    return res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    next(error);
  }
};
