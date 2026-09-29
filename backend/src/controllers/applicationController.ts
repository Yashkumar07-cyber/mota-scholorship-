import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const createApplication = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const student = await prisma.studentProfile.findFirst({
      where: { userId: req.user.id },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const { scholarshipId, scholarshipCode, academicYear, documentIds, status } = req.body;

    // Find scholarship
    const scholarship = await prisma.scholarship.findFirst({
      where: {
        OR: [
          { id: scholarshipId || '' },
          { code: scholarshipCode || (scholarshipId ? scholarshipId.toUpperCase() : '') },
        ],
      },
    });

    if (!scholarship) {
      return res.status(404).json({ success: false, message: 'Scholarship scheme not found.' });
    }

    // Generate unique Application ID
    const count = await prisma.application.count();
    const uniqueNumber = String(count + 1).padStart(6, '0');
    const applicationId = `MOTA-2026-${uniqueNumber}`;

    const targetStatus = status || 'SUBMITTED';
    const isSubmitted = targetStatus !== 'DRAFT';

    const application = await prisma.application.create({
      data: {
        applicationId,
        studentId: student.id,
        scholarshipId: scholarship.id,
        academicYear: academicYear || '2025-2026',
        status: targetStatus,
        currentStage: targetStatus === 'MANUAL_REVIEW' 
          ? 'Flagged for Officer Scrutiny' 
          : targetStatus === 'SUBMITTED' 
          ? 'Awaiting Institute Scrutiny' 
          : 'Draft Prepared',
        submissionDate: isSubmitted ? new Date() : null,
        remarks: req.body.remarks || 'Application registered via Unified Portal.',
        statusHistory: {
          create: [
            {
              fromStatus: 'DRAFT',
              toStatus: targetStatus,
              remarks: isSubmitted ? 'Application submitted with verified credentials' : 'Draft created',
              changedBy: student.name,
              changedAt: new Date(),
            },
          ],
        },
      },
      include: {
        scholarship: true,
        statusHistory: true,
      },
    });

    // Link uploaded documents to this application
    if (Array.isArray(documentIds) && documentIds.length > 0) {
      await prisma.document.updateMany({
        where: { id: { in: documentIds } },
        data: { applicationId: application.id },
      });
    }

    // If application went to MANUAL_REVIEW, generate notification
    if (targetStatus === 'MANUAL_REVIEW') {
      await prisma.notification.create({
        data: {
          userId: req.user.id,
          title: 'Application Under Manual Review',
          message: `Application ${applicationId} is currently under Manual Review by the verification desk due to document scrutiny.`,
          type: 'WARNING',
          link: `/applications/${application.id}`,
        },
      });
    } else if (isSubmitted) {
      await prisma.notification.create({
        data: {
          userId: req.user.id,
          title: 'Application Submitted Successfully',
          message: `Your application ${applicationId} for ${scholarship.name} has been submitted for institutional scrutiny.`,
          type: 'SUCCESS',
          link: `/applications/${application.id}`,
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        userRole: req.user.role,
        action: 'APPLICATION_CREATED',
        entity: 'Application',
        entityId: application.id,
        newValue: JSON.stringify({ applicationId, status: targetStatus, scholarship: scholarship.code }),
      },
    });

    return res.status(201).json({
      success: true,
      message: `Application created successfully with ID ${applicationId}.`,
      application,
    });
  } catch (error) {
    next(error);
  }
};

export const getApplications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    let whereClause: any = {};

    if (req.user.role === 'STUDENT') {
      const student = await prisma.studentProfile.findFirst({
        where: { userId: req.user.id },
      });
      if (!student) {
        return res.json({ success: true, count: 0, applications: [] });
      }
      whereClause.studentId = student.id;
    }

    // Filter by status or scheme if query params provided
    if (req.query.status) {
      whereClause.status = String(req.query.status);
    }
    if (req.query.scheme) {
      whereClause.scholarship = { code: String(req.query.scheme).toUpperCase() };
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        scholarship: true,
        student: true,
        statusHistory: {
          orderBy: { changedAt: 'desc' },
        },
        documents: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const application = await prisma.application.findFirst({
      where: {
        OR: [{ id }, { applicationId: id }],
      },
      include: {
        scholarship: true,
        student: {
          include: { familyMembers: true },
        },
        statusHistory: {
          orderBy: { changedAt: 'asc' },
        },
        documents: {
          include: { verifications: true },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application record not found.',
      });
    }

    return res.json({
      success: true,
      application,
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, remarks, currentStage, sanctionAmount } = req.body;

    const application = await prisma.application.findFirst({
      where: { OR: [{ id }, { applicationId: id }] },
      include: { student: { include: { user: true } }, scholarship: true },
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const oldStatus = application.status;
    const newStatus = status || oldStatus;

    const updateData: any = {
      status: newStatus,
      remarks: remarks || application.remarks,
      currentStage: currentStage || application.currentStage,
    };

    if (newStatus === 'SANCTIONED' && !application.sanctionDate) {
      updateData.sanctionDate = new Date();
      updateData.currentStage = 'Sanction Order Issued';

      // Auto-generate DBT payment record when sanctioned!
      const paymentAmount = Number(sanctionAmount) || (application.scholarship.code === 'PRE_MATRIC' ? 5250 : 36500);
      await prisma.payment.create({
        data: {
          applicationId: application.id,
          studentId: application.studentId,
          amount: paymentAmount,
          status: 'CREDITED', // In demo flow, credits to student
          transactionId: `PFMS-2026-ST-${Math.floor(100000 + Math.random() * 900000)}`,
          paymentDate: new Date(),
          dbtStatus: 'CREDITED',
        },
      });

      // Notification to student
      await prisma.notification.create({
        data: {
          userId: application.student.userId,
          title: 'Scholarship Sanctioned & Disbursed via DBT!',
          message: `Congratulations! Your ${application.scholarship.name} has been sanctioned for ₹${paymentAmount.toLocaleString('en-IN')}. Funds credited to your Aadhaar-seeded account.`,
          type: 'SUCCESS',
          link: `/payments`,
        },
      });
    }

    if (newStatus === 'DEFICIENCY') {
      updateData.currentStage = 'Deficiency Action Required';
      await prisma.notification.create({
        data: {
          userId: application.student.userId,
          title: 'Action Required: Document Deficiency Raised',
          message: `Verification Officer remarks: "${remarks || 'Please upload corrected certificate'}"`,
          type: 'ACTION_REQUIRED',
          link: `/applications/${application.id}`,
        },
      });
    }

    const updated = await prisma.application.update({
      where: { id: application.id },
      data: updateData,
    });

    // Record transition history
    await prisma.applicationStatusHistory.create({
      data: {
        applicationId: application.id,
        fromStatus: oldStatus,
        toStatus: newStatus,
        remarks: remarks || `Transitioned to ${newStatus}`,
        changedBy: req.user?.role === 'ADMIN' ? 'MoTA Verification Desk' : (req.user?.mobile || 'System'),
        changedAt: new Date(),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        userRole: req.user?.role || 'SYSTEM',
        action: 'APPLICATION_STATUS_UPDATED',
        entity: 'Application',
        entityId: application.id,
        oldValue: JSON.stringify({ status: oldStatus }),
        newValue: JSON.stringify({ status: newStatus, remarks }),
      },
    });

    return res.json({
      success: true,
      message: `Application status transitioned from ${oldStatus} to ${newStatus}.`,
      application: updated,
    });
  } catch (error) {
    next(error);
  }
};
