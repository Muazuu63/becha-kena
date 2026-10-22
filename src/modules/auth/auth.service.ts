import { UserModel, IUser } from '@/modules/users/user.model';
import { OtpModel } from '@/modules/auth/otp.model';
import { OtpService } from '@/modules/auth/otp.service';
import { TokenService, AuthTokens } from '@/modules/auth/token.service';
import { hashPassword, comparePassword } from '@/utils/password';
import { AppError } from '@/utils/app-error';
import { UserRole, NidStatus } from '@/constants';

export interface RegisterDto {
  phoneNumber: string;
  otp: string;
  fullName: string;
  password: string;
}

export interface LoginDto {
  phoneNumber: string;
  password: string;
}

export interface AuthResponse {
  user: Partial<IUser>;
  tokens: AuthTokens;
}

export class AuthService {
  /**
   * Request OTP for registration
   */
  static async requestRegistrationOtp(phoneNumber: string) {
    // 1. Check if phone number already belongs to an existing user
    const existingUser = await UserModel.findOne({ phone_number: phoneNumber });
    if (existingUser) {
      throw AppError.conflict(
        'AUTH_PHONE_ALREADY_EXISTS',
        'এই মোবাইল নম্বর দিয়ে ইতোমধ্যেই একটি অ্যাকাউন্ট নিবন্ধিত রয়েছে। অনুগ্রহ করে লগইন করুন।'
      );
    }

    // 2. Dispatch OTP
    return OtpService.sendOtp(phoneNumber, 'REGISTER');
  }

  /**
   * Complete registration by verifying OTP and setting credentials
   */
  static async registerWithOtp(dto: RegisterDto): Promise<AuthResponse> {
    const { phoneNumber, otp, fullName, password } = dto;

    // 1. Double-check unique phone constraint
    const existingUser = await UserModel.findOne({ phone_number: phoneNumber });
    if (existingUser) {
      throw AppError.conflict(
        'AUTH_PHONE_ALREADY_EXISTS',
        'এই মোবাইল নম্বর দিয়ে ইতোমধ্যেই একটি অ্যাকাউন্ট নিবন্ধিত রয়েছে।'
      );
    }

    // 2. Verify OTP code
    await OtpService.verifyOtp(phoneNumber, otp, 'REGISTER');

    // 3. Hash password
    const hashedPassword = await hashPassword(password);

    // 4. Create new user document
    const user = await UserModel.create({
      phone_number: phoneNumber,
      password_hash: hashedPassword,
      full_name: fullName.trim(),
      role: UserRole.UNVERIFIED_USER,
      nid_status: NidStatus.UNVERIFIED,
      rating_average: 0.0,
      rating_count: 0,
      completed_deals_count: 0,
      strikes_count: 0,
      warnings_count: 0,
      is_frozen: false,
      is_banned: false,
      active_sessions_count: 1,
    });

    // 5. Clean up consumed OTP
    await OtpModel.deleteMany({ phone_number: phoneNumber, purpose: 'REGISTER' });

    // 6. Generate authentication tokens
    const tokens = TokenService.generateTokens(user);

    return {
      user: user.toJSON(),
      tokens,
    };
  }

  /**
   * Authenticate user with phone number and password
   */
  static async login(dto: LoginDto): Promise<AuthResponse> {
    const { phoneNumber, password } = dto;

    // 1. Find user by phone number and include hidden password_hash field
    const user = await UserModel.findOne({ phone_number: phoneNumber }).select('+password_hash');
    if (!user) {
      throw AppError.unauthorized(
        'AUTH_INVALID_CREDENTIALS',
        'মোবাইল নম্বর অথবা পাসওয়ার্ড সঠিক নয়।'
      );
    }

    // 2. Check if account is banned
    if (user.is_banned) {
      throw AppError.forbidden(
        'AUTH_ACCOUNT_BANNED',
        '৩টি ফ্রড স্ট্রাইকের কারণে আপনার অ্যাকাউন্ট স্থায়ীভাবে নিষিদ্ধ করা হয়েছে।'
      );
    }

    // 3. Check if account is temporarily frozen
    if (user.is_frozen) {
      throw AppError.forbidden(
        'AUTH_ACCOUNT_FROZEN',
        'ডিসপিউট তদন্তাধীন থাকার কারণে আপনার অ্যাকাউন্ট সাময়িকভাবে স্থগিত রয়েছে।'
      );
    }

    // 4. Validate password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw AppError.unauthorized(
        'AUTH_INVALID_CREDENTIALS',
        'মোবাইল নম্বর অথবা পাসওয়ার্ড সঠিক নয়।'
      );
    }

    // 5. Generate fresh tokens
    const tokens = TokenService.generateTokens(user);

    return {
      user: user.toJSON(),
      tokens,
    };
  }

  /**
   * Refresh expired access token using valid refresh token
   */
  static async refreshSession(refreshToken: string): Promise<AuthResponse> {
    // 1. Verify token cryptographic signature
    const { userId } = TokenService.verifyRefreshToken(refreshToken);

    // 2. Fetch active user
    const user = await UserModel.findById(userId);
    if (!user) {
      throw AppError.unauthorized('AUTH_USER_NOT_FOUND', 'ব্যবহারকারী অ্যাকাউন্টটি পাওয়া যায়নি।');
    }

    if (user.is_banned || user.is_frozen) {
      throw AppError.forbidden('AUTH_ACCOUNT_RESTRICTED', 'আপনার অ্যাকাউন্টটিতে প্রবেশাধিকার স্থগিত রয়েছে।');
    }

    // 3. Issue rotated tokens
    const tokens = TokenService.generateTokens(user);

    return {
      user: user.toJSON(),
      tokens,
    };
  }

  /**
   * Get authenticated user profile (/auth/me)
   */
  static async getProfile(userId: string): Promise<IUser> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw AppError.notFound('AUTH_USER_NOT_FOUND', 'ব্যবহারকারীর তথ্য পাওয়া যায়নি।');
    }
    return user;
  }
}
