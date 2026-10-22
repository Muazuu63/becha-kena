import app from '@/app';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { connectDatabase, disconnectDatabase } from '@/config/database';
import { Server } from 'http';

let server: Server;

const startServer = async () => {
  try {
    // 1. Establish resilient Database Connection
    await connectDatabase();

    // 2. Start HTTP listener
    server = app.listen(env.PORT, () => {
      logger.info(`🚀 Becha-Kena Backend Server running on port ${env.PORT} [${env.NODE_ENV}]`);
      logger.info(`📡 API Base URL: http://localhost:${env.PORT}${env.API_PREFIX}`);
      logger.info(`🩺 Health Check: http://localhost:${env.PORT}/health`);
    });
  } catch (error) {
    logger.fatal(error, '💥 Failed to initialize server! Shutting down...');
    process.exit(1);
  }
};

const handleGracefulShutdown = async (signal: string) => {
  logger.info(`🛑 Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('👋 HTTP server closed.');
      await disconnectDatabase();
      process.exit(0);
    });
  } else {
    await disconnectDatabase();
    process.exit(0);
  }

  // Force close after 10s if connections linger
  setTimeout(() => {
    logger.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason: Error | unknown) => {
  logger.error(reason, '💥 Unhandled Promise Rejection:');
});

process.on('uncaughtException', (error: Error) => {
  logger.fatal(error, '💥 Uncaught Exception! Crashing process...');
  process.exit(1);
});

startServer();
