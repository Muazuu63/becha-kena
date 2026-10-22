import crypto from 'crypto';

/**
 * Hashes an NID number using SHA-256 for duplicate detection
 */
export const hashNid = (nidNumber: string): string => {
  const sanitized = nidNumber.trim().replace(/[-\s]/g, '');
  return crypto.createHash('sha256').update(sanitized).digest('hex');
};

/**
 * Masks an NID number for privacy preservation in UI and logs (e.g. 1992********0123)
 */
export const maskNid = (nidNumber: string): string => {
  const sanitized = nidNumber.trim().replace(/[-\s]/g, '');
  if (sanitized.length <= 8) {
    return sanitized.replace(/^(.{2}).*(.{2})$/, '$1****$2');
  }

  const prefix = sanitized.slice(0, 4);
  const suffix = sanitized.slice(-4);
  const maskLength = sanitized.length - 8;
  return `${prefix}${'*'.repeat(maskLength)}${suffix}`;
};

/**
 * Validates Bangladeshi NID format (10-digit Smart Card, 13-digit legacy, or 17-digit with birth year prefix)
 */
export const isValidNidFormat = (nidNumber: string): boolean => {
  const sanitized = nidNumber.trim().replace(/[-\s]/g, '');
  return /^(?:\d{10}|\d{13}|\d{17})$/.test(sanitized);
};

/**
 * Calculates exact age in years from date of birth
 */
export const calculateAge = (dateOfBirth: Date | string): number => {
  const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
};
