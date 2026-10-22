import { Router } from 'express';
import { UserController } from '@/modules/users/user.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import {
  updateProfileSchema,
  changePasswordSchema,
} from '@/modules/users/user.validation';

const router = Router();

// Authenticated User Profile Routes
router.get('/me', authenticate, UserController.getMe);
router.get('/profile', authenticate, UserController.getMe);

router.patch(
  '/profile',
  authenticate,
  validate(updateProfileSchema),
  UserController.updateProfile
);

router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  UserController.changePassword
);

// Public User/Seller Profile Route
router.get('/:id/public', UserController.getPublicProfile);

export default router;
