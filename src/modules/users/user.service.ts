import { UserModel, IUser } from '@/modules/users/user.model';
import { hashPassword, comparePassword } from '@/utils/password';
import { AppError } from '@/utils/app-error';

export interface UpdateProfileDto {
  full_name?: string;
  avatar_url?: string | null;
}

export interface PublicUserProfile {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  role: string;
  nid_status: string;
  rating_average: number;
  rating_count: number;
  completed_deals_count: number;
  member_since: Date;
}

export class UserService {
  /**
   * Retrieves the current user's full authenticated profile
   */
  static async getProfile(userId: string): Promise<IUser> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw AppError.notFound('USER_NOT_FOUND', 'ব্যবহারকারী অ্যাকাউন্টটি পাওয়া যায়নি।');
    }
    return user;
  }

  /**
   * Updates mutable profile fields (name, avatar)
   */
  static async updateProfile(userId: string, dto: UpdateProfileDto): Promise<IUser> {
    const updateData: Record<string, unknown> = {};

    if (dto.full_name !== undefined) {
      updateData.full_name = dto.full_name.trim();
    }

    if (dto.avatar_url !== undefined) {
      updateData.avatar_url = dto.avatar_url;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedUser) {
      throw AppError.notFound('USER_NOT_FOUND', 'ব্যবহারকারী অ্যাকাউন্টটি পাওয়া যায়নি।');
    }

    return updatedUser;
  }

  /**
   * Securely changes the user's password and revokes all other active sessions (Token Version +1)
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    // 1. Fetch user including password hash
    const user = await UserModel.findById(userId).select('+password_hash');
    if (!user) {
      throw AppError.notFound('USER_NOT_FOUND', 'ব্যবহারকারী অ্যাকাউন্টটি পাওয়া যায়নি।');
    }

    // 2. Validate current password
    const isMatch = await comparePassword(currentPassword, user.password_hash);
    if (!isMatch) {
      throw AppError.unauthorized(
        'AUTH_INVALID_CURRENT_PASSWORD',
        'বর্তমান পাসওয়ার্ডটি সঠিক নয়। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
      );
    }

    // 3. Hash new password
    const newHashedPassword = await hashPassword(newPassword);

    // 4. Update password and increment token_version for instant session revocation
    await UserModel.findByIdAndUpdate(userId, {
      $set: { password_hash: newHashedPassword },
      $inc: { token_version: 1 },
    });

    return {
      message: 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে। আপনার সকল সেশন নিরাপদ করা হয়েছে।',
    };
  }

  /**
   * Returns sanitized public profile of a user/seller for marketplace viewing
   */
  static async getPublicProfile(targetUserId: string): Promise<PublicUserProfile> {
    const user = await UserModel.findById(targetUserId);

    if (!user || user.is_banned) {
      throw AppError.notFound('USER_NOT_FOUND', 'ব্যবহারকারী অ্যাকাউন্টটি পাওয়া যায়নি বা স্থগিত রয়েছে।');
    }

    return {
      id: user._id.toString(),
      full_name: user.full_name,
      avatar_url: user.avatar_url || null,
      role: user.role,
      nid_status: user.nid_status,
      rating_average: user.rating_average,
      rating_count: user.rating_count,
      completed_deals_count: user.completed_deals_count,
      member_since: user.created_at,
    };
  }
}
