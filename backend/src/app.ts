import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { authenticateToken } from './middleware/auth.middleware';
import { globalErrorHandler } from './middleware/error.middleware';

import authRoutes from './modules/auth/auth.routes';
import etlRoutes from './modules/etl/etl.routes';
import datasetRoutes from './modules/dataset/dataset.routes';
import recordsCrudRoutes from './modules/records/records.crud.routes';
import studentsRoutes from './modules/students/students.routes';
import recommendationRoutes from './modules/recommendation/recommendation.routes';

const app = express();

// Security
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',')
      : ['http://localhost:3000', 'http://localhost:3001', 'https://counsel-x-delta.vercel.app'],
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined'));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'ETL Platform API is running' });
});

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);   // signup/login public; /me protected internally

// Admin-protected routes
app.use('/api/etl', authenticateToken, etlRoutes);
app.use('/api/datasets', authenticateToken, datasetRoutes);
app.use('/api/records', authenticateToken, recordsCrudRoutes);

// Student-protected routes (auth enforced inside router)
app.use('/api/recommendations', recommendationRoutes);

// Global error handler (must be last)
app.use(globalErrorHandler);

export default app;
