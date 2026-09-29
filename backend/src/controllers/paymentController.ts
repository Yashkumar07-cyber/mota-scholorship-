import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const getPayments = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
        return res.json({
          success: true,
          summary: { totalReceived: 0, pendingAmount: 0 },
          payments: [],
        });
      }
      whereClause.studentId = student.id;
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        application: {
          include: { scholarship: true },
        },
        student: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalReceived = payments
      .filter((p) => p.status === 'CREDITED')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingAmount = payments
      .filter((p) => p.status === 'PENDING' || p.status === 'PROCESSING')
      .reduce((sum, p) => sum + p.amount, 0);

    return res.json({
      success: true,
      summary: {
        totalReceived,
        pendingAmount,
        totalTransactions: payments.length,
      },
      payments,
    });
  } catch (error) {
    next(error);
  }
};
