import { z } from 'zod';

const nidRegex = /^(?:\d{10}|\d{13}|\d{17})$/;
const bangladeshiPhoneRegex = /^\+8801[3-9]\d{8}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const submitAdultNidSchema = {
  body: z.object({
    nid_number: z
      .string()
      .trim()
      .min(1, 'জাতীয় পরিচয়পত্র নম্বর আবশ্যক')
      .regex(nidRegex, 'জাতীয় পরিচয়পত্র নম্বর অবশ্যই ১০, ১৩ বা ১৭ ডিজিটের হতে হবে'),
    date_of_birth: z
      .string()
      .min(1, 'জন্ম তারিখ আবশ্যক')
      .regex(dateRegex, 'জন্ম তারিখ YYYY-MM-DD ফরম্যাটে প্রদান করুন (যেমন: 1995-06-15)'),
    front_image_url: z
      .string()
      .optional()
      .nullable(),
    back_image_url: z
      .string()
      .optional()
      .nullable(),
  }),
};

export const initiateMinorConsentSchema = {
  body: z.object({
    parent_phone_number: z
      .string()
      .trim()
      .min(1, 'অভিভাবকের মোবাইল নম্বর আবশ্যক')
      .regex(bangladeshiPhoneRegex, 'অনুগ্রহ করে অভিভাবকের সঠিক বাংলাদেশী মোবাইল নম্বর দিন (+8801XXXXXXXXX)'),
    parent_nid_number: z
      .string()
      .trim()
      .min(1, 'অভিভাবকের জাতীয় পরিচয়পত্র নম্বর আবশ্যক')
      .regex(nidRegex, 'অভিভাবকের জাতীয় পরিচয়পত্র নম্বর অবশ্যই ১০, ১৩ বা ১৭ ডিজিটের হতে হবে'),
    date_of_birth: z
      .string()
      .min(1, 'জন্ম তারিখ আবশ্যক')
      .regex(dateRegex, 'জন্ম তারিখ YYYY-MM-DD ফরম্যাটে প্রদান করুন (যেমন: 2010-08-10)'),
  }),
};

export const verifyMinorConsentSchema = {
  body: z.object({
    parent_phone_number: z
      .string()
      .trim()
      .min(1, 'অভিভাবকের মোবাইল নম্বর আবশ্যক')
      .regex(bangladeshiPhoneRegex, 'অনুগ্রহ করে অভিভাবকের সঠিক বাংলাদেশী মোবাইল নম্বর দিন (+8801XXXXXXXXX)'),
    otp: z
      .string()
      .length(6, 'সম্মতি ওটিপি অবশ্যই ৬ ডিজিটের হতে হবে')
      .regex(/^\d{6}$/, 'ওটিপি শুধুমাত্র সংখ্যা হতে হবে'),
  }),
};
