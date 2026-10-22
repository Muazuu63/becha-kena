import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '@/config/env';
import { IUser } from '@/modules/users/user.model';
import { UserRole, NidStatus } from '@/constants';
import { AppError } from '@/utils/app-error';

export interface TokenPayload {
  userId: string;
  phoneNumber: string;
  role: UserRole;
  nidStatus: NidStatus;
  tokenVersion: number;
  jti: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export class TokenService {
  /**
   * Generates Dual Tokens (Access Token + Refresh Token) for authenticated user
   */
  static generateTokens(user: IUser): AuthTokens {
    const jti = crypto.randomUUID();

    const payload: TokenPayload = {
      userId: user._id.toString(),
      phoneNumber: user.phone_number,
      role: user.role,
      nidStatus: user.nid_status,
      tokenVersion: user.token_version ?? 0,
      jti,
    };

    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    const refreshToken = jwt.sign(
      { userId: user._id.toString(), jti },
      env.JWT_REFRESH_SECRET,
      {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    };
  }

  /**
   * Verifies and decodes an Access Token
   */
  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw AppError.unauthorized('AUTH_TOKEN_EXPIRED', 'আপনার অ্যাক্সেস টোকেনের মেয়াদ শেষ হয়েছে। অনুগ্রহ করে রিফ্রেশ টোকেন ব্যবহার করুন।');
      }
      throw AppError.unauthorized('AUTH_TOKEN_INVALID', 'প্রদত্ত অথেনটিকেশন টোকেনটি সঠিক বা বৈধ নয়।');
    }
  }

  /**
   * Verifies and decodes a Refresh Token
   */
  static verifyRefreshToken(token: string): { userId: string; jti: string } {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string; jti: string };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw AppError.unauthorized('AUTH_REFRESH_EXPIRED', 'আপনার রিফ্রেশ টোকেনের মেয়াদ শেষ হয়েছে। অনুগ্রহ করে পুনরায় লগইন করুন।');
      }
      throw AppError.unauthorized('AUTH_REFRESH_INVALID', 'প্রদত্ত রিফ্রেশ টোকেনটি সঠিক বা বৈধ নয়।');
    }
  }
}
