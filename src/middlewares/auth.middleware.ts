import { Response, NextFunction } from 'express';
import { TokenService } from '@/modules/auth/token.service';
import { UserModel } from '@/modules/users/user.model';
import { AuthenticatedRequest } from '@/types';
import { UserRole, NidStatus } from '@/constants';
import { AppError } from '@/utils/app-error';

/**
 * Authentication Middleware:
 * Validates Bearer JWT Access Token and verifies Token Version against DB.
 * Attaches authenticated user payload to req.user.
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check for Bearer token in Authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized(
        'AUTH_UNAUTHORIZED',
        'অনুমোদনহীন অ্যাক্সেস। অনুগ্রহ করে বৈধ অথেনটিকেশন টোকেন প্রদান করুন।'
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw AppError.unauthorized(
        'AUTH_UNAUTHORIZED',
        'অথেনটিকেশন টোকেন পাওয়া যায়নি।'
      );
    }

    // 2. Cryptographically verify signature and expiration
    const payload = TokenService.verifyAccessToken(token);

    // 3. Verify user existence and active status in MongoDB
    const user = await UserModel.findById(payload.userId);
    if (!user) {
      throw AppError.unauthorized(
        'AUTH_USER_NOT_FOUND',
        'ব্যবহারকারী অ্যাকাউন্টটি প্ল্যাটফর্মে পাওয়া যায়নি।'
      );
    }

    // 4. Verify account restrictions (Ban / Freeze)
    if (user.is_banned) {
      throw AppError.forbidden(
        'AUTH_ACCOUNT_BANNED',
        '৩টি ফ্রড স্ট্রাইকের কারণে আপনার অ্যাকাউন্ট স্থায়ীভাবে নিষিদ্ধ করা হয়েছে।'
      );
    }

    if (user.is_frozen) {
      throw AppError.forbidden(
        'AUTH_ACCOUNT_FROZEN',
        'তদন্তের কারণে আপনার অ্যাকাউন্ট সাময়িকভাবে স্থগিত রয়েছে।'
      );
    }

    // 5. Token Version Validation (Global Logout / Password Reset / Revocation check)
    const currentTokenVersion = user.token_version ?? 0;
    if (payload.tokenVersion !== currentTokenVersion) {
      throw AppError.unauthorized(
        'AUTH_TOKEN_REVOKED',
        'আপনার লগইন সেশনটি বাতিল করা হয়েছে। অনুগ্রহ করে পুনরায় লগইন করুন।'
      );
    }

    // 6. Attach sanitized user payload to Request object
    req.user = {
      userId: user._id.toString(),
      phoneNumber: user.phone_number,
      role: user.role,
      nidStatus: user.nid_status,
      tokenVersion: currentTokenVersion,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-Based Access Control (RBAC) Guard Middleware:
 * Ensures the authenticated user possesses one of the required roles.
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        AppError.unauthorized(
          'AUTH_UNAUTHORIZED',
          'অনুমোদনহীন অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।'
        )
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          'AUTH_INSUFFICIENT_PERMISSIONS',
          'এই রিসোর্সটিতে প্রবেশের পর্যাপ্ত অনুমতি আপনার নেই।'
        )
      );
    }

    next();
  };
};

/**
 * NID Verified Guard Middleware:
 * Ensures the user has completed and been approved for National ID (NID) verification.
 */
export const requireNidVerified = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(
      AppError.unauthorized(
        'AUTH_UNAUTHORIZED',
        'অনুমোদনহীন অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।'
      )
    );
  }

  if (req.user.nidStatus !== NidStatus.APPROVED) {
    return next(
      AppError.forbidden(
        'PRIVACY_NID_VERIFICATION_REQUIRED',
        'এই ফিচারটি ব্যবহার করতে আপনার জাতীয় পরিচয়পত্র (NID) ভেরিফিকেশন সম্পন্ন থাকা আবশ্যক।'
      )
    );
  }

  next();
};
