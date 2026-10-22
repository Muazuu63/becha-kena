import { Schema, model, Document, Types } from 'mongoose';
import { UserRole, NidStatus } from '@/constants';

export interface IUser extends Document {
  _id: Types.ObjectId;
  phone_number: string;
  password_hash: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  nid_status: NidStatus;
  nid_verification_id?: Types.ObjectId;
  parent_user_id?: Types.ObjectId;
  rating_average: number;
  rating_count: number;
  completed_deals_count: number;
  strikes_count: number;
  warnings_count: number;
  is_frozen: boolean;
  is_banned: boolean;
  active_sessions_count: number;
  token_version: number;
  created_at: Date;
  updated_at: Date;
}

const UserSchema = new Schema<IUser>(
  {
    phone_number: {
      type: String,
      required: [true, 'মোবাইল নম্বর আবশ্যক'],
      unique: true,
      trim: true,
      match: [/^\+8801[3-9]\d{8}$/, 'অনুগ্রহ করে সঠিক বাংলাদেশী মোবাইল নম্বর প্রদান করুন (+8801XXXXXXXXX)'],
      index: true,
    },
    password_hash: {
      type: String,
      required: [true, 'পাসওয়ার্ড আবশ্যক'],
      select: false, // Do not return password by default in queries
    },
    full_name: {
      type: String,
      required: [true, 'ব্যবহারকারীর পূর্ণ নাম আবশ্যক'],
      trim: true,
      minlength: [2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে'],
      maxlength: [100, 'নাম সর্বোচ্চ ১০০ অক্ষরের হতে পারে'],
    },
    avatar_url: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.UNVERIFIED_USER,
      index: true,
    },
    nid_status: {
      type: String,
      enum: Object.values(NidStatus),
      default: NidStatus.UNVERIFIED,
      index: true,
    },
    nid_verification_id: {
      type: Schema.Types.ObjectId,
      ref: 'NidVerification',
      default: null,
    },
    parent_user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rating_average: {
      type: Number,
      default: 0.0,
      min: 0.0,
      max: 5.0,
      set: (val: number) => Math.round(val * 10) / 10, // Round to 1 decimal place
    },
    rating_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    completed_deals_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    strikes_count: {
      type: Number,
      default: 0,
      min: 0,
      max: [3, 'সর্বোচ্চ স্ট্রাইক সীমা ৩'],
    },
    warnings_count: {
      type: Number,
      default: 0,
      min: 0,
      max: 3,
    },
    is_frozen: {
      type: Boolean,
      default: false,
      index: true,
    },
    is_banned: {
      type: Boolean,
      default: false,
      index: true,
    },
    active_sessions_count: {
      type: Number,
      default: 0,
      min: 0,
      max: [2, 'একসাথে সর্বোচ্চ ২টি ডিভাইসে সক্রিয় সেশন রাখা যাবে'],
    },
    token_version: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        delete ret.password_hash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound Index
UserSchema.index({ role: 1, is_banned: 1 });

export const UserModel = model<IUser>('User', UserSchema);
