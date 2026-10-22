import { Router } from 'express';
import { KycController } from '@/modules/kyc/kyc.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import {
  submitAdultNidSchema,
  initiateMinorConsentSchema,
  verifyMinorConsentSchema,
} from '@/modules/kyc/kyc.validation';

const router = Router();

// Adult NID Submission (18+)
router.post(
  '/nid/submit',
  authenticate,
  validate(submitAdultNidSchema),
  KycController.submitAdultNid
);

// Minor (<18) Parental Consent Workflow
router.post(
  '/minor/parental-consent',
  authenticate,
  validate(initiateMinorConsentSchema),
  KycController.initiateMinorConsent
);

router.post(
  '/minor/parental-consent/verify',
  authenticate,
  validate(verifyMinorConsentSchema),
  KycController.verifyMinorConsent
);

// Check KYC Status
router.get(
  '/status',
  authenticate,
  KycController.getKycStatus
);

export default router;
