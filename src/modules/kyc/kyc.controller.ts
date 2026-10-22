import { Response, NextFunction } from 'express';
import { KycService } from '@/modules/kyc/kyc.service';
import { ApiResponse } from '@/utils/api-response';
import { AppError } from '@/utils/app-error';
import { AuthenticatedRequest } from '@/types';
import { HTTP_STATUS } from '@/constants';

export class KycController {
  /**
   * POST /kyc/nid/submit (Adult 18+)
   */
  static async submitAdultNid(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw AppError.unauthorized('AUTH_UNAUTHORIZED', 'অনুমোদনহীন অ্যাক্সেস।');
      }

      const { nid_number, date_of_birth, front_image_url, back_image_url } = req.body;

      const result = await KycService.submitAdultNid({
        userId: req.user.userId,
        nidNumber: nid_number,
        dateOfBirth: date_of_birth,
        frontImageRef: front_image_url,
        backImageRef: back_image_url,
      });

      ApiResponse.success(res, {
        statusCode: result.verified ? HTTP_STATUS.OK : HTTP_STATUS.ACCEPTED,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /kyc/minor/parental-consent (<18)
   */
  static async initiateMinorConsent(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw AppError.unauthorized('AUTH_UNAUTHORIZED', 'অনুমোদনহীন অ্যাক্সেস।');
      }

      const { parent_phone_number, parent_nid_number, date_of_birth } = req.body;

      const result = await KycService.initiateMinorConsent({
        minorUserId: req.user.userId,
        parentPhoneNumber: parent_phone_number,
        parentNidNumber: parent_nid_number,
        minorDateOfBirth: date_of_birth,
      });

      ApiResponse.success(res, {
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /kyc/minor/parental-consent/verify
   */
  static async verifyMinorConsent(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw AppError.unauthorized('AUTH_UNAUTHORIZED', 'অনুমোদনহীন অ্যাক্সেস।');
      }

      const { parent_phone_number, otp } = req.body;

      const result = await KycService.verifyMinorConsent({
        minorUserId: req.user.userId,
        parentPhoneNumber: parent_phone_number,
        otp,
      });

      ApiResponse.success(res, {
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /kyc/status
   */
  static async getKycStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw AppError.unauthorized('AUTH_UNAUTHORIZED', 'অনুমোদনহীন অ্যাক্সেস।');
      }

      const statusData = await KycService.getKycStatus(req.user.userId);

      ApiResponse.success(res, {
        message: 'KYC যাচাইকরণ স্ট্যাটাস সফলভাবে পাওয়া গেছে।',
        data: statusData,
      });
    } catch (error) {
      next(error);
    }
  }
}
