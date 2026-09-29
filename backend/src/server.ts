import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import scholarshipRoutes from './routes/scholarshipRoutes';
import applicationRoutes from './routes/applicationRoutes';
import documentRoutes from './routes/documentRoutes';
import paymentRoutes from './routes/paymentRoutes';
import notificationRoutes from './routes/notificationRoutes';
import chatRoutes from './routes/chatRoutes';
import adminRoutes from './routes/adminRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost, vercel deployments, or custom domains
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve demo uploads folder statically
const uploadsDir = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'Ministry of Tribal Affairs Unified Scholarship Platform API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    verificationMode: process.env.VERIFICATION_MODE || 'MOCK',
  });
});

// Mount REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Centralized error handling
app.use(errorHandler);

// Start server (only in standalone Node runtime, not inside Vercel serverless)
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n========================================================`);
    console.log(`🏛️  MoTA Unified Scholarship Platform API Service Running`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`========================================================\n`);
  });
}

export default app;
