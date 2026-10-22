import { NidVerificationModel } from '@/modules/kyc/nid-verification.model';
import { ParentalConsentModel } from '@/modules/kyc/parental-consent.model';
import { UserModel } from '@/modules/users/user.model';
import { OcrService } from '@/services/ocr.service';
import { OtpService } from '@/modules/auth/otp.service';
import { hashNid, maskNid, calculateAge, isValidNidFormat } from '@/utils/nid';
import { AppError } from '@/utils/app-error';
import { NidStatus, UserRole } from '@/constants';
import { logger } from '@/utils/logger';

export interface SubmitAdultNidDto {
  userId: string;
  nidNumber: string;
  dateOfBirth: Date | string;
  frontImageRef?: string | null;
  backImageRef?: string | null;
}

export interface InitiateMinorConsentDto {
  minorUserId: string;
  parentPhoneNumber: string;
  parentNidNumber: string;
  minorDateOfBirth: Date | string;
}

export interface VerifyMinorConsentDto {
  minorUserId: string;
  parentPhoneNumber: string;
  otp: string;
}

export class KycService {
  /**
   * Submits adult NID for OCR processing and verification
   */
  static async submitAdultNid(dto: SubmitAdultNidDto) {
    const { userId, nidNumber, dateOfBirth, frontImageRef, backImageRef } = dto;

    // 1. Validate NID format
    if (!isValidNidFormat(nidNumber)) {
      throw AppError.badRequest(
        'KYC_INVALID_NID_FORMAT',
        'জাতীয় পরিচয়পত্র নম্বর অবশ্যই ১০, ১৩ বা ১৭ ডিজিটের হতে হবে।'
      );
    }

    // 2. Validate age >= 18
    const age = calculateAge(dateOfBirth);
    if (age < 18) {
      throw AppError.badRequest(
        'KYC_AGE_UNDER_18',
        'আপনার বয়স ১৮ বছরের নিচে। অনুগ্রহ করে অপ্রাপ্তবয়স্ক অভিভাবক সম্মতি (Parental Consent) ফ্লো ব্যবহার করুন।'
      );
    }

    // 3. Check User Status
    const user = await UserModel.findById(userId);
    if (!user) {
      throw AppError.notFound('USER_NOT_FOUND', 'ব্যবহারকারী অ্যাকাউন্টটি পাওয়া যায়নি।');
    }

    if (user.nid_status === NidStatus.APPROVED) {
      throw AppError.badRequest(
        'KYC_ALREADY_APPROVED',
        'আপনার জাতীয় পরিচয়পত্র ইতোমধ্যেই অনুমোদিত ও ভেরিফাইড।'
      );
    }

    // 4. Check Duplicate NID via SHA-256 Hash
    const nidHash = hashNid(nidNumber);
    const duplicate = await NidVerificationModel.findOne({
      nid_hash: nidHash,
      user_id: { $ne: user._id },
    });

    if (duplicate) {
      throw AppError.conflict(
        'KYC_DUPLICATE_NID',
        'এই NID কার্ড দিয়ে ইতোমধ্যেই প্ল্যাটফর্মে একটি অ্যাকাউন্ট নিবন্ধিত রয়েছে।'
      );
    }

    // 5. OCR Processing
    const ocrResult = await OcrService.extractNidData(frontImageRef, nidNumber, dateOfBirth);

    // 6. Verification decision
    const isAutoApproved = ocrResult.confidence >= 0.85;
    const finalNidStatus = isAutoApproved ? NidStatus.APPROVED : NidStatus.PENDING_REVIEW;
    const maskedNid = maskNid(nidNumber);

    // 7. Upsert NID Verification record
    const verificationRecord = await NidVerificationModel.findOneAndUpdate(
      { user_id: user._id },
      {
        $set: {
          user_id: user._id,
          nid_number_masked: maskedNid,
          nid_hash: nidHash,
          date_of_birth: new Date(dateOfBirth),
          ocr_extracted_data: ocrResult,
          front_image_ref: frontImageRef || null,
          back_image_ref: backImageRef || null,
          is_image_purged: false,
          verified_at: isAutoApproved ? new Date() : null,
          rejection_reason: null,
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    // 8. Update User's KYC status and role
    user.nid_status = finalNidStatus;
    if (isAutoApproved) {
      user.role = UserRole.VERIFIED_USER;
    }
    user.nid_verification_id = verificationRecord._id;
    await user.save();

    logger.info(
      `NID verification processed for user ${userId}. Status: ${finalNidStatus} (OCR Confidence: ${ocrResult.confidence})`
    );

    return {
      status: finalNidStatus,
      nid_number_masked: maskedNid,
      verified: isAutoApproved,
      message: isAutoApproved
        ? 'আপনার NID কার্ড সফলভাবে যাচাই ও অনুমোদিত হয়েছে। আপনি এখন ভেরিফাইড ব্যবহারকারী।'
        : 'আপনার NID কার্ড রিভিউ কিউতে জমা হয়েছে। দ্রুত যাচাই সম্পন্ন হবে।',
    };
  }

  /**
   * Initiates parental consent for minor (<18)
   */
  static async initiateMinorConsent(dto: InitiateMinorConsentDto) {
    const { minorUserId, parentPhoneNumber, parentNidNumber, minorDateOfBirth } = dto;

    // 1. Verify minor age < 18
    const age = calculateAge(minorDateOfBirth);
    if (age >= 18) {
      throw AppError.badRequest(
        'KYC_NOT_MINOR',
        'আপনার বয়স ১৮ বা তদূর্ধ্ব। সরাসরি স্ট্যান্ডার্ড NID সাবমিশন ব্যবহার করুন।'
      );
    }

    // 2. Validate Parent NID format
    if (!isValidNidFormat(parentNidNumber)) {
      throw AppError.badRequest(
        'KYC_INVALID_PARENT_NID',
        'অভিভাবকের জাতীয় পরিচয়পত্র নম্বর অবশ্যই ১০, ১৩ বা ১৭ ডিজিটের হতে হবে।'
      );
    }

    // 3. Check 2-child limit per guardian
    const parentNidHash = hashNid(parentNidNumber);
    const existingApprovedMinorsCount = await ParentalConsentModel.countDocuments({
      parent_nid_hash: parentNidHash,
      status: 'APPROVED',
      minor_user_id: { $ne: minorUserId },
    });

    if (existingApprovedMinorsCount >= 2) {
      throw AppError.forbidden(
        'KYC_PARENT_LIMIT_EXCEEDED',
        'একজন অভিভাবক সর্বোচ্চ ২টি অপ্রাপ্তবয়স্ক অ্যাকাউন্ট অনুমোদন করতে পারেন।'
      );
    }

    // 4. Send Consent OTP to parent's phone
    await OtpService.sendOtp(parentPhoneNumber, 'GUARDIAN_CONSENT');

    // 5. Upsert Parental Consent record
    const maskedParentNid = maskNid(parentNidNumber);
    await ParentalConsentModel.findOneAndUpdate(
      { minor_user_id: minorUserId },
      {
        $set: {
          minor_user_id: minorUserId,
          parent_phone_number: parentPhoneNumber,
          parent_nid_masked: maskedParentNid,
          parent_nid_hash: parentNidHash,
          status: 'PENDING_OTP',
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    return {
      success: true,
      message: `অভিভাবকের মোবাইল নম্বর ${parentPhoneNumber}-এ সম্মতি ওটিপি কোড পাঠানো হয়েছে।`,
    };
  }

  /**
   * Verifies guardian OTP and grants minor user PARENT_VERIFIED_MINOR role
   */
  static async verifyMinorConsent(dto: VerifyMinorConsentDto) {
    const { minorUserId, parentPhoneNumber, otp } = dto;

    // 1. Find consent record
    const consent = await ParentalConsentModel.findOne({
      minor_user_id: minorUserId,
      parent_phone_number: parentPhoneNumber,
    });

    if (!consent) {
      throw AppError.notFound(
        'KYC_CONSENT_NOT_FOUND',
        'কোনো অপেক্ষমান অভিভাবক সম্মতি রেকর্ড পাওয়া যায়নি।'
      );
    }

    // 2. Verify OTP code
    await OtpService.verifyOtp(parentPhoneNumber, otp, 'GUARDIAN_CONSENT');

    // 3. Update Consent record
    consent.status = 'APPROVED';
    consent.approved_at = new Date();
    await consent.save();

    // 4. Update minor user to PARENT_VERIFIED_MINOR & APPROVED
    await UserModel.findByIdAndUpdate(minorUserId, {
      $set: {
        role: UserRole.PARENT_VERIFIED_MINOR,
        nid_status: NidStatus.APPROVED,
      },
    });

    logger.info(`Parental consent verified for minor ${minorUserId} by parent ${parentPhoneNumber}`);

    return {
      success: true,
      message: 'অভিভাবকের সম্মতি সফলভাবে যাচাই করা হয়েছে। আপনার অ্যাকাউন্ট অনুমোদিত হয়েছে।',
      role: UserRole.PARENT_VERIFIED_MINOR,
      nid_status: NidStatus.APPROVED,
    };
  }

  /**
   * Retrieves KYC verification status for an authenticated user
   */
  static async getKycStatus(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw AppError.notFound('USER_NOT_FOUND', 'ব্যবহারকারী অ্যাকাউন্টটি পাওয়া যায়নি।');
    }

    const verificationRecord = await NidVerificationModel.findOne({ user_id: user._id });
    const minorConsent = await ParentalConsentModel.findOne({ minor_user_id: user._id });

    return {
      nid_status: user.nid_status,
      role: user.role,
      nid_verification: verificationRecord
        ? {
            masked_nid: verificationRecord.nid_number_masked,
            verified_at: verificationRecord.verified_at,
            rejection_reason: verificationRecord.rejection_reason,
            is_image_purged: verificationRecord.is_image_purged,
          }
        : null,
      parental_consent: minorConsent
        ? {
            parent_phone_number: minorConsent.parent_phone_number,
            parent_nid_masked: minorConsent.parent_nid_masked,
            status: minorConsent.status,
            approved_at: minorConsent.approved_at,
          }
        : null,
    };
  }
}
