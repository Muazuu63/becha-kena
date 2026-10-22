import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { ZodError } from 'zod';
import { AppError, ValidationErrorItem } from '@/utils/app-error';
import { logger } from '@/utils/logger';
import { env } from '@/config/env';
import { HTTP_STATUS } from '@/constants';

interface RFC7807ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
  errors?: ValidationErrorItem[];
  trace_id: string;
  timestamp: string;
  stack?: string;
}

const getHttpTitle = (status: number): string => {
  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      return 'Bad Request';
    case HTTP_STATUS.UNAUTHORIZED:
      return 'Unauthorized';
    case HTTP_STATUS.FORBIDDEN:
      return 'Forbidden';
    case HTTP_STATUS.NOT_FOUND:
      return 'Not Found';
    case HTTP_STATUS.CONFLICT:
      return 'Conflict';
    case HTTP_STATUS.TOO_MANY_REQUESTS:
      return 'Too Many Requests';
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
    default:
      return 'Internal Server Error';
  }
};

/**
 * 404 Not Found Middleware for handling unmatched routes
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new AppError(
    HTTP_STATUS.NOT_FOUND,
    'RESOURCE_NOT_FOUND',
    `অনুরোধকৃত এন্ডপয়েন্ট '${req.method} ${req.originalUrl}' প্ল্যাটফর্মে পাওয়া যায়নি।`,
    undefined,
    'https://api.becha-kena.com/errors/not-found'
  );
  next(error);
};

/**
 * Centralized RFC 7807 Global Error Handler Middleware
 */
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const traceId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let detail = err.detail || err.message || 'সার্ভারে অভ্যন্তরীণ সমস্যা দেখা দিয়েছে।';
  let type = err.type || `https://api.becha-kena.com/errors/${code.toLowerCase().replace(/_/g, '-')}`;
  let errors = err.errors;

  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    code = 'VALIDATION_FAILED';
    detail = 'প্রদত্ত ইনপুট তথ্যে ভুল রয়েছে। অনুগ্রহ করে লাল চিহ্নিত ফিল্ডগুলো সংশোধন করুন।';
    type = 'https://api.becha-kena.com/errors/validation-error';
    errors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      rule: issue.code,
    }));
  }

  // 2. Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    code = 'INVALID_RESOURCE_ID';
    detail = `প্রদত্ত আইডি '${err.value}' সঠিক ফরম্যাটে নেই।`;
    type = 'https://api.becha-kena.com/errors/invalid-resource-id';
  }

  // 3. Mongoose Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    code = 'DUPLICATE_KEY_CONFLICT';
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const val = err.keyValue ? err.keyValue[field] : '';
    detail = `এই '${field}' (${val}) দিয়ে ইতোমধ্যেই তথ্য সংরক্ষিত রয়েছে।`;
    type = 'https://api.becha-kena.com/errors/duplicate-key';
  }

  // 4. Mongoose ValidationError
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    code = 'DATABASE_VALIDATION_FAILED';
    detail = 'ডেটাবেজ ভ্যালিডেশন ব্যর্থ হয়েছে।';
    type = 'https://api.becha-kena.com/errors/database-validation';
    errors = Object.keys(err.errors).map((key) => ({
      field: key,
      message: err.errors[key].message,
    }));
  }

  // 5. JSON Body Parser Syntax Error
  if (err instanceof SyntaxError && 'body' in err) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    code = 'INVALID_JSON_BODY';
    detail = 'অনুরোধের বডিতে সঠিক JSON ফরম্যাট প্রদান করুন।';
    type = 'https://api.becha-kena.com/errors/invalid-json';
  }

  // 6. JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    code = 'AUTH_TOKEN_INVALID';
    detail = 'প্রদত্ত অথেনটিকেশন টোকেনটি সঠিক বা বৈধ নয়।';
    type = 'https://api.becha-kena.com/errors/invalid-token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    code = 'AUTH_TOKEN_EXPIRED';
    detail = 'আপনার লগইন সেশনের মেয়াদ শেষ হয়েছে। অনুগ্রহ করে রিফ্রেশ করুন বা পুনরায় লগইন করুন।';
    type = 'https://api.becha-kena.com/errors/token-expired';
  }

  // Production Masking for unhandled internal errors
  const isProduction = env.NODE_ENV === 'production';
  if (statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR && isProduction) {
    detail = 'সার্ভারে অভ্যন্তরীণ ত্রুটি দেখা দিয়েছে। আমাদের কারিগরি টিম সমস্যাটি পর্যবেক্ষণ করছে।';
  }

  // Log error with appropriate severity
  if (statusCode >= 500) {
    logger.error(
      {
        traceId,
        url: req.originalUrl,
        method: req.method,
        err,
      },
      `💥 [500 Server Error] ${detail}`
    );
  } else {
    logger.warn(
      {
        traceId,
        url: req.originalUrl,
        method: req.method,
        statusCode,
        code,
      },
      `⚠️ [${statusCode} Client Error] ${detail}`
    );
  }

  // RFC 7807 Problem Details Response Structure
  const problemDetails: RFC7807ProblemDetails = {
    type,
    title: getHttpTitle(statusCode),
    status: statusCode,
    detail,
    instance: req.originalUrl,
    code,
    ...(errors && errors.length > 0 ? { errors } : {}),
    trace_id: traceId,
    timestamp: new Date().toISOString(),
    ...(!isProduction && err.stack ? { stack: err.stack } : {}),
  };

  res.setHeader('Content-Type', 'application/problem+json');
  res.status(statusCode).json(problemDetails);
};
