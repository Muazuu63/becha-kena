import { Router } from 'express';
import { AuthController } from '@/modules/auth/auth.controller';
import { validate } from '@/middlewares/validate.middleware';
import { authenticate } from '@/middlewares/auth.middleware';
import {
  sendOtpSchema,
  verifyOtpRegisterSchema,
  loginSchema,
} from '@/modules/auth/auth.validation';

const router = Router();

// Public Authentication Routes
router.post(
  '/register/send-otp',
  validate(sendOtpSchema),
  AuthController.sendRegistrationOtp
);

router.post(
  '/register/verify-otp',
  validate(verifyOtpRegisterSchema),
  AuthController.register
);

router.post(
  '/login',
  validate(loginSchema),
  AuthController.login
);

router.post(
  '/refresh-token',
  AuthController.refreshToken
);

// Protected Authentication Routes
router.post(
  '/logout',
  authenticate,
  AuthController.logout
);

router.get(
  '/me',
  authenticate,
  AuthController.getMe
);

export default router;
