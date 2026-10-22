import { Schema, model, Document, Types } from 'mongoose';

export type OtpPurpose = 'REGISTER' | 'LOGIN' | 'PASSWORD_RESET' | 'GUARDIAN_CONSENT';

export interface IOtp extends Document {
  _id: Types.ObjectId;
  phone_number: string;
  otp_hash: string;
  purpose: OtpPurpose;
  attempts_count: number;
  is_verified: boolean;
  expires_at: Date;
  created_at: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    phone_number: {
      type: String,
      required: [true, 'মোবাইল নম্বর আবশ্যক'],
      trim: true,
      match: [/^\+8801[3-9]\d{8}$/, 'অনুগ্রহ করে সঠিক বাংলাদেশী মোবাইল নম্বর প্রদান করুন'],
      index: true,
    },
    otp_hash: {
      type: String,
      required: [true, 'ওটিপি হ্যাশ আবশ্যক'],
    },
    purpose: {
      type: String,
      enum: ['REGISTER', 'LOGIN', 'PASSWORD_RESET', 'GUARDIAN_CONSENT'],
      default: 'REGISTER',
      index: true,
    },
    attempts_count: {
      type: Number,
      default: 0,
      min: 0,
      max: [3, 'সর্বোচ্চ ৩ বার ভুল ওটিপি প্রদান করা যাবে'],
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    expires_at: {
      type: Date,
      required: true,
      // MongoDB TTL Index: Document will be automatically purged by MongoDB when expires_at timestamp is passed
      index: { expires: 0 },
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
    collection: 'temporary_otps',
  }
);

// Compound Index for fast lookup
OtpSchema.index({ phone_number: 1, purpose: 1 });

export const OtpModel = model<IOtp>('TemporaryOtp', OtpSchema);
