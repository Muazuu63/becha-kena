import { HTTP_STATUS } from '@/constants';

export interface ValidationErrorItem {
  field: string;
  message: string;
  rule?: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly detail: string;
  public readonly type: string;
  public readonly errors?: ValidationErrorItem[];
  public readonly isOperational: boolean;

  constructor(
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: string = 'INTERNAL_SERVER_ERROR',
    detail: string = 'সার্ভারে একটি অপ্রত্যাশিত সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।',
    errors?: ValidationErrorItem[],
    type?: string
  ) {
    super(detail);

    this.statusCode = statusCode;
    this.code = code;
    this.detail = detail;
    this.errors = errors;
    this.isOperational = true;
    this.type = type || `https://api.becha-kena.com/errors/${code.toLowerCase().replace(/_/g, '-')}`;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(code: string, detail: string, errors?: ValidationErrorItem[]): AppError {
    return new AppError(HTTP_STATUS.BAD_REQUEST, code, detail, errors);
  }

  static unauthorized(code: string = 'AUTH_UNAUTHORIZED', detail: string = 'অনুমোদনহীন অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।'): AppError {
    return new AppError(HTTP_STATUS.UNAUTHORIZED, code, detail);
  }

  static forbidden(code: string = 'AUTH_FORBIDDEN', detail: string = 'এই কাজটি করার অনুমতি আপনার নেই।'): AppError {
    return new AppError(HTTP_STATUS.FORBIDDEN, code, detail);
  }

  static notFound(code: string = 'RESOURCE_NOT_FOUND', detail: string = 'অনুরোধকৃত রিসোর্সটি বা তথ্যটি পাওয়া যায়নি।'): AppError {
    return new AppError(HTTP_STATUS.NOT_FOUND, code, detail);
  }

  static conflict(code: string = 'RESOURCE_CONFLICT', detail: string = 'তথ্যটি ইতোমধ্যেই প্ল্যাটফর্মে বিদ্যমান বা কনফ্লিক্ট তৈরি করছে।'): AppError {
    return new AppError(HTTP_STATUS.CONFLICT, code, detail);
  }

  static validationFailed(errors: ValidationErrorItem[]): AppError {
    return new AppError(
      HTTP_STATUS.BAD_REQUEST,
      'VALIDATION_FAILED',
      'প্রদত্ত ইনপুট তথ্যে ভুল রয়েছে। অনুগ্রহ করে লাল চিহ্নিত ফিল্ডগুলো সংশোধন করুন।',
      errors,
      'https://api.becha-kena.com/errors/validation-error'
    );
  }

  static internal(detail?: string): AppError {
    return new AppError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'INTERNAL_SERVER_ERROR',
      detail || 'সার্ভারে অভ্যন্তরীণ ত্রুটি দেখা দিয়েছে। আমাদের কারিগরি টিমকে অবহিত করা হয়েছে।'
    );
  }
}
