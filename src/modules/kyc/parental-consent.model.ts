import { Schema, model, Document, Types } from 'mongoose';

export type ParentalConsentStatus = 'PENDING_OTP' | 'APPROVED' | 'REJECTED';

export interface IParentalConsent extends Document {
  _id: Types.ObjectId;
  minor_user_id: Types.ObjectId;
  parent_user_id?: Types.ObjectId | null;
  parent_phone_number: string;
  parent_nid_masked: string;
  parent_nid_hash: string;
  status: ParentalConsentStatus;
  rejection_reason?: string | null;
  approved_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

const ParentalConsentSchema = new Schema<IParentalConsent>(
  {
    minor_user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'অপ্রাপ্তবয়স্ক ব্যবহারকারী আইডি আবশ্যক'],
      unique: true,
      index: true,
    },
    parent_user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    parent_phone_number: {
      type: String,
      required: [true, 'অভিভাবকের মোবাইল নম্বর আবশ্যক'],
      match: [/^\+8801[3-9]\d{8}$/, 'সঠিক বাংলাদেশী মোবাইল নম্বর দিন'],
    },
    parent_nid_masked: {
      type: String,
      required: [true, 'অভিভাবকের মাস্কড NID নম্বর আবশ্যক'],
    },
    parent_nid_hash: {
      type: String,
      required: [true, 'অভিভাবকের NID হ্যাশ আবশ্যক'],
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING_OTP', 'APPROVED', 'REJECTED'],
      default: 'PENDING_OTP',
      index: true,
    },
    rejection_reason: {
      type: String,
      default: null,
    },
    approved_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'parental_consents',
  }
);

export const ParentalConsentModel = model<IParentalConsent>(
  'ParentalConsent',
  ParentalConsentSchema
);
