import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from '@/config/env';
import { HTTP_STATUS } from '@/constants';
import { notFoundHandler, globalErrorHandler } from '@/middlewares/error.middleware';
import { ApiResponse } from '@/utils/api-response';
import { checkDatabaseHealth } from '@/config/database';
import authRoutes from '@/modules/auth/auth.routes';

const app: Application = express();

// Security & Core Middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoints
app.get('/health', async (_req: Request, res: Response) => {
  const dbHealth = await checkDatabaseHealth();
  const isHealthy = dbHealth.status === 'connected';

  return ApiResponse.success(res, {
    statusCode: isHealthy ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE,
    message: isHealthy ? 'Becha-Kena Backend Service is healthy.' : 'Database service degraded.',
    data: {
      status: isHealthy ? 'healthy' : 'degraded',
      env: env.NODE_ENV,
      service: 'becha-kena-backend',
      database: dbHealth,
    },
  });
});

app.get(`${env.API_PREFIX}/health`, async (_req: Request, res: Response) => {
  const dbHealth = await checkDatabaseHealth();

  return ApiResponse.success(res, {
    statusCode: HTTP_STATUS.OK,
    message: 'API v1 is operational.',
    data: {
      status: 'healthy',
      prefix: env.API_PREFIX,
      version: '1.0.0',
      database: dbHealth,
    },
  });
});

// API Modules Routing
app.use(`${env.API_PREFIX}/auth`, authRoutes);

// Centralized Error Handling Middlewares (Must be last in chain)
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
