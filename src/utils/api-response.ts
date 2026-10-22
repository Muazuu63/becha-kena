import { Response } from 'express';
import { HTTP_STATUS } from '@/constants';

export interface ApiResponseOptions<T> {
  statusCode?: number;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export interface StandardApiResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
  timestamp: string;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    {
      statusCode = HTTP_STATUS.OK,
      message = 'অনুরোধটি সফলভাবে সম্পন্ন হয়েছে।',
      data,
      meta,
    }: ApiResponseOptions<T>
  ): Response {
    const responsePayload: StandardApiResponse<T> = {
      success: true,
      message,
      data: (data !== undefined ? data : null) as T,
      ...(meta ? { meta } : {}),
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(responsePayload);
  }

  static created<T>(
    res: Response,
    {
      message = 'সফলভাবে তৈরি করা হয়েছে।',
      data,
      meta,
    }: Omit<ApiResponseOptions<T>, 'statusCode'>
  ): Response {
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message,
      data,
      meta,
    });
  }
}
