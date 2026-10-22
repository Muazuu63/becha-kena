import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { AppError, ValidationErrorItem } from '@/utils/app-error';

export interface RequestValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export const validate = (schemas: RequestValidationSchemas) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors: ValidationErrorItem[] = [];

      if (schemas.body) {
        const result = await schemas.body.safeParseAsync(req.body);
        if (!result.success) {
          errors.push(...formatZodErrors(result.error, 'body'));
        } else {
          req.body = result.data;
        }
      }

      if (schemas.query) {
        const result = await schemas.query.safeParseAsync(req.query);
        if (!result.success) {
          errors.push(...formatZodErrors(result.error, 'query'));
        } else {
          req.query = result.data as Request['query'];
        }
      }

      if (schemas.params) {
        const result = await schemas.params.safeParseAsync(req.params);
        if (!result.success) {
          errors.push(...formatZodErrors(result.error, 'params'));
        } else {
          req.params = result.data as Request['params'];
        }
      }

      if (errors.length > 0) {
        throw AppError.validationFailed(errors);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

function formatZodErrors(error: ZodError, sourcePrefix?: string): ValidationErrorItem[] {
  return error.issues.map((issue) => {
    const pathStr = issue.path.join('.');
    const field = pathStr || sourcePrefix || 'field';
    return {
      field,
      message: issue.message,
      rule: issue.code,
    };
  });
}
