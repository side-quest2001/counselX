import { env } from './config/env';
import { prisma } from './config/database';
import { logger } from './utils/logger';
import app from './app';
import fs from 'fs';

// Ensure upload directory exists
if (!fs.existsSync(env.UPLOAD_DIR)) {
  fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
}

// Ensure logs directory exists
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs', { recursive: true });
}

const server = app.listen(env.PORT, async () => {
  try {
    await prisma.$connect();
    logger.info(`✅ Database connected`);
    logger.info(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  } catch (error) {
    logger.error('❌ Failed to connect to database', { error });
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason });
  process.exit(1);
});

export default server;
