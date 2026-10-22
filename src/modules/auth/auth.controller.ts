import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/modules/auth/auth.service';
import { UserModel } from '@/modules/users/user.model';
import { ApiResponse } from '@/utils/api-response';
import { AppError } from '@/utils/app-error';
import { AuthenticatedRequest } from '@/types';
import { env } from '@/config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

export class AuthController {
  /**
   * POST /auth/register/send-otp
   */
  static async sendRegistrationOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone_number } = req.body;
      const result = await AuthService.requestRegistrationOtp(phone_number);

      ApiResponse.success(res, {
        message: result.message,
        data: {
          phone_number,
          expires_in_seconds: result.expiresInSeconds,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/register/verify-otp
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone_number, otp, full_name, password } = req.body;

      const { user, tokens } = await AuthService.registerWithOtp({
        phoneNumber: phone_number,
        otp,
        fullName: full_name,
        password,
      });

      // Set Refresh Token in secure HttpOnly cookie
      res.cookie('refresh_token', tokens.refreshToken, COOKIE_OPTIONS);

      ApiResponse.created(res, {
        message: 'নিবন্ধন সফলভাবে সম্পন্ন হয়েছে।',
        data: {
          user,
          access_token: tokens.accessToken,
          expires_in: tokens.expiresIn,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/login
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone_number, password } = req.body;

      const { user, tokens } = await AuthService.login({
        phoneNumber: phone_number,
        password,
      });

      // Set Refresh Token in secure HttpOnly cookie
      res.cookie('refresh_token', tokens.refreshToken, COOKIE_OPTIONS);

      ApiResponse.success(res, {
        message: 'লগইন সফল হয়েছে।',
        data: {
          user,
          access_token: tokens.accessToken,
          expires_in: tokens.expiresIn,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/refresh-token
   */
  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refresh_token || req.body?.refresh_token;

      if (!refreshToken) {
        throw AppError.unauthorized(
          'AUTH_REFRESH_TOKEN_REQUIRED',
          'রিফ্রেশ টোকেন প্রদান করা হয়নি।'
        );
      }

      const { user, tokens } = await AuthService.refreshSession(refreshToken);

      // Rotate Refresh Token cookie
      res.cookie('refresh_token', tokens.refreshToken, COOKIE_OPTIONS);

      ApiResponse.success(res, {
        message: 'অ্যাক্সেস টোকেন সফলভাবে রিফ্রেশ করা হয়েছে।',
        data: {
          user,
          access_token: tokens.accessToken,
          expires_in: tokens.expiresIn,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/logout
   */
  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Invalidate existing sessions by incrementing token_version if user is authenticated
      if (req.user?.userId) {
        await UserModel.findByIdAndUpdate(req.user.userId, {
          $inc: { token_version: 1 },
        });
      }

      // Clear refresh token cookie
      res.clearCookie('refresh_token', COOKIE_OPTIONS);

      ApiResponse.success(res, {
        message: 'সফলভাবে লগআউট সম্পন্ন হয়েছে।',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /auth/me
   */
  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw AppError.unauthorized('AUTH_UNAUTHORIZED', 'অনুমোদনহীন অ্যাক্সেস।');
      }

      const user = await AuthService.getProfile(req.user.userId);

      ApiResponse.success(res, {
        message: 'প্রোফাইল তথ্য সফলভাবে পাওয়া গেছে।',
        data: {
          user: user.toJSON(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
