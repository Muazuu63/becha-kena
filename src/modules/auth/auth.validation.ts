import { z } from 'zod';

const bangladeshiPhoneRegex = /^\+8801[3-9]\d{8}$/;

export const sendOtpSchema = {
  body: z.object({
    phone_number: z
      .string()
      .trim()
      .min(1, 'মোবাইল নম্বর আবশ্যক')
      .regex(bangladeshiPhoneRegex, 'অনুগ্রহ করে সঠিক বাংলাদেশী মোবাইল নম্বর দিন (+8801XXXXXXXXX)'),
    purpose: z
      .enum(['REGISTER', 'LOGIN', 'PASSWORD_RESET', 'GUARDIAN_CONSENT'])
      .optional()
      .default('REGISTER'),
  }),
};

export const verifyOtpRegisterSchema = {
  body: z.object({
    phone_number: z
      .string()
      .trim()
      .min(1, 'মোবাইল নম্বর আবশ্যক')
      .regex(bangladeshiPhoneRegex, 'অনুগ্রহ করে সঠিক বাংলাদেশী মোবাইল নম্বর দিন (+8801XXXXXXXXX)'),
    otp: z
      .string()
      .length(6, 'ওটিপি কোড অবশ্যই ৬ ডিজিটের হতে হবে')
      .regex(/^\d{6}$/, 'ওটিপি শুধুমাত্র সংখ্যা হতে হবে'),
    full_name: z
      .string()
      .trim()
      .min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে')
      .max(100, 'নাম সর্বোচ্চ ১০০ অক্ষরের হতে পারে'),
    password: z
      .string()
      .min(8, 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'পাসওয়ার্ডে কমপক্ষে ১টি বড় হাতের অক্ষর, ১টি ছোট হাতের অক্ষর, ১টি সংখ্যা এবং ১টি স্পেশাল ক্যারেক্টার (@$!%*?&) থাকতে হবে'
      ),
  }),
};

export const loginSchema = {
  body: z.object({
    phone_number: z
      .string()
      .trim()
      .min(1, 'মোবাইল নম্বর আবশ্যক')
      .regex(bangladeshiPhoneRegex, 'অনুগ্রহ করে সঠিক বাংলাদেশী মোবাইল নম্বর দিন (+8801XXXXXXXXX)'),
    password: z
      .string()
      .min(1, 'অনুগ্রহ করে পাসওয়ার্ড প্রদান করুন'),
  }),
};
