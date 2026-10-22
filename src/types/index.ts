import { Request } from 'express';
import { UserRole, NidStatus } from '@/constants';

export interface AuthenticatedUserPayload {
  userId: string;
  phoneNumber: string;
  role: UserRole;
  nidStatus: NidStatus;
  tokenVersion: number;
  deviceId?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUserPayload;
}
