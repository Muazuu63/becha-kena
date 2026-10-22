import crypto from 'crypto';
import { OtpModel, OtpPurpose, IOtp } from '@/modules/auth/otp.model';
import { SmsService } from '@/services/sms.service';
import { AppError } from '@/utils/app-error';
import { logger } from '@/utils/logger';

export class OtpService {
  /**
   * Hashes a 6-digit numeric OTP using SHA-256 for secure database storage
   */
  private static hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  /**
   * Generates a 6-digit CSPRNG numeric OTP, stores the hash with a 2-minute TTL, and sends SMS
   */
  static async sendOtp(
    phoneNumber: string,
    purpose: OtpPurpose = 'REGISTER'
  ): Promise<{ success: boolean; message: string; expiresInSeconds: number }> {
    // 1. Generate cryptographically secure 6-digit OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = OtpService.hashOtp(rawOtp);

    // 2. Set expiry to 2 minutes (120 seconds) from now
    const expiresAt = new Date(Date.now() + 120 * 1000);

    // 3. Remove any previous pending OTP for this phone and purpose
    await OtpModel.deleteMany({ phone_number: phoneNumber, purpose });

    // 4. Save new OTP in MongoDB
    await OtpModel.create({
      phone_number: phoneNumber,
      otp_hash: otpHash,
      purpose,
      attempts_count: 0,
      is_verified: false,
      expires_at: expiresAt,
    });

    // 5. Send OTP via SMS service (Logs prominently in dev mode)
    await SmsService.sendOtp(phoneNumber, rawOtp);

    logger.info(`OTP generated and dispatched to ${phoneNumber} for purpose [${purpose}]`);

    return {
      success: true,
      message: 'আপনার মোবাইল নম্বরে ৬ ডিজিটের ওটিপি পাঠানো হয়েছে।',
      expiresInSeconds: 120,
    };
  }

  /**
   * Verifies the submitted OTP against the stored hash and enforces 3-attempt limit
   */
  static async verifyOtp(
    phoneNumber: string,
    submittedOtp: string,
    purpose: OtpPurpose = 'REGISTER'
  ): Promise<IOtp> {
    // 1. Find the latest OTP record
    const otpRecord = await OtpModel.findOne({
      phone_number: phoneNumber,
      purpose,
    });

    // 2. Check if OTP exists
    if (!otpRecord) {
      throw AppError.badRequest(
        'AUTH_OTP_NOT_FOUND',
        'কোনো সক্রিয় ওটিপি পাওয়া যায়নি। অনুগ্রহ করে নতুন ওটিপি চেয়ে অনুরোধ করুন।'
      );
    }

    // 3. Check if expired
    if (new Date() > otpRecord.expires_at) {
      await OtpModel.deleteOne({ _id: otpRecord._id });
      throw AppError.badRequest(
        'AUTH_OTP_EXPIRED',
        'ওটিপির ২ মিনিটের মেয়াদ শেষ হয়েছে। অনুগ্রহ করে পুনরায় ওটিপি নিন।'
      );
    }

    // 4. Check brute-force attempts
    if (otpRecord.attempts_count >= 3) {
      await OtpModel.deleteOne({ _id: otpRecord._id });
      throw AppError.badRequest(
        'AUTH_OTP_MAX_ATTEMPTS',
        'পরপর ৩ বার ভুল ওটিপি প্রদানের কারণে কোডটি বাতিল করা হয়েছে। অনুগ্রহ করে নতুন কোড নিন।'
      );
    }

    // 5. Verify hash
    const submittedHash = OtpService.hashOtp(submittedOtp);
    if (submittedHash !== otpRecord.otp_hash) {
      // Increment attempts counter
      otpRecord.attempts_count += 1;
      await otpRecord.save();

      const remainingAttempts = 3 - otpRecord.attempts_count;
      throw AppError.badRequest(
        'AUTH_OTP_MISMATCH',
        `ভুল ওটিপি কোড দেওয়া হয়েছে। আপনার আর ${remainingAttempts} বার চেষ্টা করার সুযোগ রয়েছে।`
      );
    }

    // 6. Verification successful - mark or clean up
    otpRecord.is_verified = true;
    await otpRecord.save();

    return otpRecord;
  }
}
