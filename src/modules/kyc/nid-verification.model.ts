import { Schema, model, Document, Types } from 'mongoose';

export enum NidRejectionReason {
  BLURRY_IMAGE = 'BLURRY_IMAGE',
  NAME_MISMATCH = 'NAME_MISMATCH',
  UNDERAGE = 'UNDERAGE',
  TAMPERED_DOC = 'TAMPERED_DOC',
  DUPLICATE_NID = 'DUPLICATE_NID',
}

export interface INidVerification extends Document {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  nid_number_masked: string;
  nid_hash: string;
  date_of_birth: Date;
  ocr_extracted_data?: Record<string, unknown>;
  front_image_ref?: string | null;
  back_image_ref?: string | null;
  is_image_purged: boolean;
  verified_by_admin?: Types.ObjectId | null;
  rejection_reason?: NidRejectionReason | null;
  verified_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

const NidVerificationSchema = new Schema<INidVerification>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'ইউজার আইডি আবশ্যক'],
      unique: true,
      index: true,
    },
    nid_number_masked: {
      type: String,
      required: [true, 'মাস্কড NID নম্বর আবশ্যক'],
      trim: true,
    },
    nid_hash: {
      type: String,
      required: [true, 'NID হ্যাশ আবশ্যক'],
      unique: true,
      index: true,
    },
    date_of_birth: {
      type: Date,
      required: [true, 'জন্ম তারিখ আবশ্যক'],
    },
    ocr_extracted_data: {
      type: Schema.Types.Mixed,
      default: null,
    },
    front_image_ref: {
      type: String,
      default: null,
    },
    back_image_ref: {
      type: String,
      default: null,
    },
    is_image_purged: {
      type: Boolean,
      default: false,
      index: true,
    },
    verified_by_admin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejection_reason: {
      type: String,
      enum: Object.values(NidRejectionReason),
      default: null,
    },
    verified_at: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'nid_verifications',
  }
);

// TTL-Cron Target Index: 30-day purge lookup { verified_at: 1, is_image_purged: 1 }
NidVerificationSchema.index({ verified_at: 1, is_image_purged: 1 });

export const NidVerificationModel = model<INidVerification>(
  'NidVerification',
  NidVerificationSchema
);
