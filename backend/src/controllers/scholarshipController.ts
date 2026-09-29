import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { eligibilityEngine } from '../services/eligibility/eligibilityEngine';
import { AuthRequest } from '../middleware/auth';

export const getAllScholarships = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const scholarships = await prisma.scholarship.findMany({
      where: { active: true },
      orderBy: { createdAt: 'asc' },
    });

    const parsed = scholarships.map((s) => ({
      ...s,
      requiredDocuments: JSON.parse(s.requiredDocuments || '[]'),
      importantDates: JSON.parse(s.importantDates || '{}'),
      sourceAttribution: {
        sourceName: 'Ministry of Tribal Affairs (Government of India)',
        portalUrl: s.sourceUrl,
        lastVerifiedAt: s.lastVerifiedAt,
      },
    }));

    return res.json({
      success: true,
      count: parsed.length,
      scholarships: parsed,
    });
  } catch (error) {
    next(error);
  }
};

export const getScholarshipById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const scholarship = await prisma.scholarship.findFirst({
      where: {
        OR: [{ id }, { code: id.toUpperCase() }],
      },
      include: {
        rules: true,
      },
    });

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship scheme not found in the official registry.',
      });
    }

    return res.json({
      success: true,
      scholarship: {
        ...scholarship,
        requiredDocuments: JSON.parse(scholarship.requiredDocuments || '[]'),
        importantDates: JSON.parse(scholarship.importantDates || '{}'),
        sourceAttribution: {
          sourceName: 'Ministry of Tribal Affairs (MoTA)',
          portalUrl: scholarship.sourceUrl,
          lastVerifiedAt: scholarship.lastVerifiedAt,
          notice: 'Information is retrieved from the official Ministry of Tribal Affairs portal.',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const checkEligibility = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { scholarshipId, scholarshipCode, studentProfile } = req.body;

    // If logged in student and no profile provided in body, use database profile
    let profileToEvaluate = studentProfile;
    if (!profileToEvaluate && req.user) {
      const student = await prisma.studentProfile.findFirst({
        where: {
          OR: [
            { userId: req.user.id },
            { id: req.user.studentId || '' },
            { mobile: req.user.mobile || '' },
          ],
        },
      });
      if (student) {
        profileToEvaluate = {
          name: student.name,
          tribeCategory: student.tribeCategory,
          pvtgStatus: student.pvtgStatus,
          familyIncome: student.familyIncome,
          course: student.course,
          institution: student.institution,
          academicYear: student.academicYear,
          state: student.state,
          district: student.district,
        };
      }
    }

    // If still no profile, fallback to the primary demo student (Rahul Munda)
    if (!profileToEvaluate) {
      const demoStudent = await prisma.studentProfile.findFirst({
        where: { mobile: '9999999999' },
      }) || await prisma.studentProfile.findFirst();

      if (demoStudent) {
        profileToEvaluate = {
          name: demoStudent.name,
          tribeCategory: demoStudent.tribeCategory,
          pvtgStatus: demoStudent.pvtgStatus,
          familyIncome: demoStudent.familyIncome,
          course: demoStudent.course,
          institution: demoStudent.institution,
          academicYear: demoStudent.academicYear,
          state: demoStudent.state,
          district: demoStudent.district,
        };
      }
    }

    if (!profileToEvaluate) {
      return res.status(400).json({
        success: false,
        message: 'Student profile data (familyIncome, tribeCategory, course) is required to evaluate eligibility.',
      });
    }

    // Determine target scheme
    const code = scholarshipCode || (scholarshipId ? scholarshipId.toUpperCase() : null);

    if (code && code !== 'ALL') {
      const result = eligibilityEngine.evaluate(code, profileToEvaluate);
      return res.json({
        success: true,
        evaluation: result,
      });
    }

    // Otherwise evaluate all 5 official schemes
    const results = eligibilityEngine.evaluateAll(profileToEvaluate);
    return res.json({
      success: true,
      evaluations: results,
      eligibleCount: results.filter((r) => r.eligible).length,
    });
  } catch (error) {
    next(error);
  }
};
