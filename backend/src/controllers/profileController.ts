import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

// Dynamic profile completion calculator
export function calculateProfileCompletion(profile: any): number {
  const fields = [
    profile.name,
    profile.dateOfBirth,
    profile.gender,
    profile.mobile,
    profile.email,
    profile.state,
    profile.district,
    profile.tribeCategory,
    profile.otrId,
    profile.institution,
    profile.course,
    profile.academicYear,
    profile.familyIncome,
    profile.bankStatus,
    profile.accountNumberMasked,
    profile.dbtStatus,
  ];

  const filledCount = fields.filter((f) => f !== null && f !== undefined && f !== '').length;
  return Math.min(100, Math.round((filledCount / fields.length) * 100));
}

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const profile = await prisma.studentProfile.findFirst({
      where: { userId: req.user.id },
      include: {
        familyMembers: true,
        applications: {
          include: {
            scholarship: true,
            payments: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found for this account.',
      });
    }

    const dynamicPct = calculateProfileCompletion(profile);

    return res.json({
      success: true,
      profile: {
        ...profile,
        profileCompletionPct: dynamicPct,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const {
      name,
      dateOfBirth,
      gender,
      state,
      district,
      tribeCategory,
      tribeName,
      pvtgStatus,
      institution,
      course,
      academicYear,
      familyIncome,
      bankName,
      accountNumberMasked,
      ifscCode,
    } = req.body;

    const existing = await prisma.studentProfile.findFirst({
      where: { userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const updated = await prisma.studentProfile.update({
      where: { id: existing.id },
      data: {
        name: name !== undefined ? name : existing.name,
        dateOfBirth: dateOfBirth !== undefined ? dateOfBirth : existing.dateOfBirth,
        gender: gender !== undefined ? gender : existing.gender,
        state: state !== undefined ? state : existing.state,
        district: district !== undefined ? district : existing.district,
        tribeCategory: tribeCategory !== undefined ? tribeCategory : existing.tribeCategory,
        tribeName: tribeName !== undefined ? tribeName : existing.tribeName,
        pvtgStatus: pvtgStatus !== undefined ? Boolean(pvtgStatus) : existing.pvtgStatus,
        institution: institution !== undefined ? institution : existing.institution,
        course: course !== undefined ? course : existing.course,
        academicYear: academicYear !== undefined ? academicYear : existing.academicYear,
        familyIncome: familyIncome !== undefined ? Number(familyIncome) : existing.familyIncome,
        bankName: bankName !== undefined ? bankName : existing.bankName,
        accountNumberMasked: accountNumberMasked !== undefined ? accountNumberMasked : existing.accountNumberMasked,
        ifscCode: ifscCode !== undefined ? ifscCode : existing.ifscCode,
      },
      include: { familyMembers: true },
    });

    const completionPct = calculateProfileCompletion(updated);
    await prisma.studentProfile.update({
      where: { id: updated.id },
      data: { profileCompletionPct: completionPct },
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      profile: { ...updated, profileCompletionPct: completionPct },
    });
  } catch (error) {
    next(error);
  }
};

export const addFamilyMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const student = await prisma.studentProfile.findFirst({
      where: { userId: req.user!.id },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const { name, relation, age, educationLevel, currentScholarship, scholarshipStatus } = req.body;

    const member = await prisma.familyMember.create({
      data: {
        studentId: student.id,
        name,
        relation,
        age: Number(age) || 16,
        educationLevel,
        currentScholarship: currentScholarship || 'None',
        scholarshipStatus: scholarshipStatus || 'None',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Family member registered for household scholarship monitoring.',
      member,
    });
  } catch (error) {
    next(error);
  }
};
