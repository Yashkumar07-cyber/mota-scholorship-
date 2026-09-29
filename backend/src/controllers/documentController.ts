import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { verificationService } from '../services/verification/verificationService';

export const getDocuments = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

    const documents = await prisma.document.findMany({
      where: { studentId: student.id },
      include: {
        verifications: {
          orderBy: { verifiedAt: 'desc' },
          take: 1,
        },
        application: {
          select: { applicationId: true, status: true },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    return res.json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

    const { documentType, fileName, fileUrl, applicationId, forceManualReview } = req.body;

    if (!documentType || !fileName) {
      return res.status(400).json({
        success: false,
        message: 'documentType and fileName are required.',
      });
    }

    // Determine initial prototype verification
    const verification = await verificationService.verifyDocument({
      documentType,
      studentName: student.name,
      declaredIncome: student.familyIncome,
      forceManualReview: forceManualReview !== undefined ? Boolean(forceManualReview) : false,
      fileName,
    });

    const newDoc = await prisma.document.create({
      data: {
        studentId: student.id,
        applicationId: applicationId || null,
        documentType,
        fileName,
        fileUrl: fileUrl || `/uploads/${fileName}`,
        fileSize: 154200,
        verificationStatus: verification.status,
        verificationSource: verification.source,
        mismatchReason: verification.discrepancyReason || null,
        verifications: {
          create: {
            verificationAdapter: verification.source,
            externalReference: verification.reference,
            status: verification.status,
            details: JSON.stringify(verification.details || {}),
          },
        },
      },
      include: { verifications: true },
    });

    // If an application ID is provided and this document is verified or corrected,
    // check if it was resolving a DEFICIENCY or advancing MANUAL_REVIEW
    if (applicationId) {
      const app = await prisma.application.findUnique({ where: { id: applicationId } });
      if (app && (app.status === 'DEFICIENCY' || app.status === 'MANUAL_REVIEW')) {
        if (verification.status === 'VERIFIED') {
          await prisma.application.update({
            where: { id: applicationId },
            data: {
              status: 'INSTITUTE_VERIFICATION',
              currentStage: 'Correction Verified; Resuming Institutional Review',
              remarks: 'Corrected document verified successfully via State e-District.',
            },
          });
          await prisma.applicationStatusHistory.create({
            data: {
              applicationId,
              fromStatus: app.status,
              toStatus: 'INSTITUTE_VERIFICATION',
              remarks: 'Corrected document uploaded and verified.',
              changedBy: student.name,
            },
          });
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Document saved to wallet and evaluated through Government Prototype Verification.',
      document: newDoc,
      verificationResult: verification,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyDocumentById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { forceManualReview } = req.body;

    const doc = await prisma.document.findUnique({
      where: { id },
      include: { student: true, application: true },
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const verification = await verificationService.verifyDocument({
      documentType: doc.documentType,
      studentName: doc.student.name,
      declaredIncome: doc.student.familyIncome,
      forceManualReview: forceManualReview !== undefined ? Boolean(forceManualReview) : false,
      fileName: doc.fileName,
    });

    const updated = await prisma.document.update({
      where: { id },
      data: {
        verificationStatus: verification.status,
        verificationSource: verification.source,
        mismatchReason: verification.discrepancyReason || null,
        verifications: {
          create: {
            verificationAdapter: verification.source,
            externalReference: verification.reference,
            status: verification.status,
            details: JSON.stringify(verification.details || {}),
          },
        },
      },
      include: { verifications: { orderBy: { verifiedAt: 'desc' }, take: 1 } },
    });

    return res.json({
      success: true,
      message: 'Prototype verification completed.',
      document: updated,
      verification,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.document.delete({ where: { id } });
    return res.json({ success: true, message: 'Document removed from wallet.' });
  } catch (error) {
    next(error);
  }
};
