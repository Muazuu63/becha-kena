import { z } from 'zod';

export const updateProfileSchema = {
  body: z.object({
    full_name: z
      .string()
      .trim()
      .min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে')
      .max(100, 'নাম সর্বোচ্চ ১০০ অক্ষরের হতে পারে')
      .optional(),
    avatar_url: z
      .string()
      .url('সঠিক ইমেজ URL দিন')
      .optional()
      .nullable(),
  }),
};

export const changePasswordSchema = {
  body: z.object({
    current_password: z
      .string()
      .min(1, 'বর্তমান পাসওয়ার্ড প্রদান করুন'),
    new_password: z
      .string()
      .min(8, 'নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'পাসওয়ার্ডে কমপক্ষে ১টি বড় হাতের অক্ষর, ১টি ছোট হাতের অক্ষর, ১টি সংখ্যা এবং ১টি স্পেশাল ক্যারেক্টার (@$!%*?&) থাকতে হবে'
      ),
  }),
};
