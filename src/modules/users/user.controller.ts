import { Response, NextFunction } from 'express';
import { UserService } from '@/modules/users/user.service';
import { ApiResponse } from '@/utils/api-response';
import { AppError } from '@/utils/app-error';
import { AuthenticatedRequest } from '@/types';

export class UserController {
  /**
   * GET /users/me or /users/profile
   */
  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw AppError.unauthorized('AUTH_UNAUTHORIZED', 'অনুমোদনহীন অনুরোধ।');
      }

      const user = await UserService.getProfile(req.user.userId);

      ApiResponse.success(res, {
        message: 'ব্যবহারকারীর প্রোফাইল তথ্য সফলভাবে পাওয়া গেছে।',
        data: { user: user.toJSON() },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /users/profile
   */
  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw AppError.unauthorized('AUTH_UNAUTHORIZED', 'অনুমোদনহীন অনুরোধ।');
      }

      const updatedUser = await UserService.updateProfile(req.user.userId, req.body);

      ApiResponse.success(res, {
        message: 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে।',
        data: { user: updatedUser.toJSON() },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /users/change-password
   */
  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw AppError.unauthorized('AUTH_UNAUTHORIZED', 'অনুমোদনহীন অনুরোধ।');
      }

      const { current_password, new_password } = req.body;
      const result = await UserService.changePassword(
        req.user.userId,
        current_password,
        new_password
      );

      ApiResponse.success(res, {
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /users/:id/public
   */
  static async getPublicProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!id) {
        throw AppError.badRequest('INVALID_USER_ID', 'ব্যবহারকারী আইডি প্রদান করুন।');
      }

      const publicProfile = await UserService.getPublicProfile(id);

      ApiResponse.success(res, {
        message: 'পাবলিক প্রোফাইল তথ্য সফলভাবে পাওয়া গেছে।',
        data: { user: publicProfile },
      });
    } catch (error) {
      next(error);
    }
  }
}
