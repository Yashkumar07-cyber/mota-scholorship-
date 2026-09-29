import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  
  // Friendly user-facing messages
  let message = err.message || 'An unexpected system condition occurred. Please retry.';

  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      message = 'A record with this unique identifier or email already exists.';
    } else if (err.code === 'P2025') {
      message = 'The requested resource could not be found.';
    }
  }

  console.error(`[Error ${statusCode}] ${req.method} ${req.originalUrl}:`, err.message);

  res.status(statusCode).json({
    success: false,
    message,
    code: err.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
  });
};
