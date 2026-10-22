import mongoose from 'mongoose';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

interface DatabaseHealthStatus {
  status: 'connected' | 'disconnected' | 'connecting' | 'disconnecting';
  latencyMs: number;
}

export const connectDatabase = async (): Promise<typeof mongoose> => {
  try {
    const isProduction = env.NODE_ENV === 'production';

    // Configure Mongoose options
    mongoose.set('autoIndex', !isProduction);
    mongoose.set('strictQuery', true);

    // Event listeners
    mongoose.connection.on('connected', () => {
      logger.info('🍃 MongoDB connection established successfully');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(err, '❌ MongoDB connection error:');
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected from cluster');
    });

    logger.info('⏳ Connecting to MongoDB Atlas cluster...');
    const conn = await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 50,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    return conn;
  } catch (error) {
    logger.fatal(error, '💥 Failed to connect to MongoDB Atlas! Exiting...');
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      logger.info('👋 MongoDB connection closed cleanly');
    }
  } catch (error) {
    logger.error(error, 'Error disconnecting from MongoDB:');
  }
};

export const checkDatabaseHealth = async (): Promise<DatabaseHealthStatus> => {
  const state = mongoose.connection.readyState;
  const statusMap: Record<number, 'disconnected' | 'connected' | 'connecting' | 'disconnecting'> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const status = statusMap[state] || 'disconnected';

  if (state !== 1) {
    return { status, latencyMs: -1 };
  }

  const start = Date.now();
  try {
    await mongoose.connection.db?.admin().ping();
    const latencyMs = Date.now() - start;
    return { status: 'connected', latencyMs };
  } catch (error) {
    return { status: 'disconnected', latencyMs: -1 };
  }
};
