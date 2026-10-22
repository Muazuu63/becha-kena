import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val < 65536, {
      message: 'PORT must be a valid port number (1-65535)',
    }),
  API_PREFIX: z.string().default('/api/v1'),
  CLIENT_URL: z.string().url().default('http://localhost:3000'),

  // Database & Cache
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z
    .string()
    .default('6379')
    .transform((val) => parseInt(val, 10)),
  REDIS_PASSWORD: z.string().optional().default(''),

  // JWT Secrets
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters long'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Cryptographic Signatures & PII Security
  HMAC_CONTACT_SECRET: z.string().min(16, 'HMAC_CONTACT_SECRET is required for privacy shield'),
  DATA_ENCRYPTION_KEY: z
    .string()
    .default('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),

  // SMS Gateway
  SSL_WIRELESS_API_KEY: z.string().default('mock_ssl_wireless_api_key'),
  SSL_WIRELESS_SID: z.string().default('mock_sid'),
  SSL_WIRELESS_URL: z.string().url().default('https://smsplus.sslwireless.com/api/v3/send-sms'),

  // Payment Gateway: bKash
  BKASH_APP_KEY: z.string().default('mock_bkash_app_key'),
  BKASH_APP_SECRET: z.string().default('mock_bkash_app_secret'),
  BKASH_USERNAME: z.string().default('mock_bkash_username'),
  BKASH_PASSWORD: z.string().default('mock_bkash_password'),
  BKASH_BASE_URL: z.string().url().default('https://tokenized.sandbox.bka.sh/v2.0-beta'),

  // Payment Gateway: Nagad
  NAGAD_MERCHANT_ID: z.string().default('mock_nagad_merchant_id'),
  NAGAD_PUBLIC_KEY: z.string().default('mock_nagad_public_key'),
  NAGAD_PRIVATE_KEY: z.string().default('mock_nagad_private_key'),
  NAGAD_BASE_URL: z.string().url().default('https://api.mynagad.com/api/dfs'),

  // AWS S3 Storage
  AWS_REGION: z.string().default('ap-southeast-1'),
  AWS_ACCESS_KEY_ID: z.string().default('mock_aws_access_key'),
  AWS_SECRET_ACCESS_KEY: z.string().default('mock_aws_secret_key'),
  AWS_S3_BUCKET_PUBLIC: z.string().default('becha-kena-public-assets'),
  AWS_S3_BUCKET_PRIVATE: z.string().default('becha-kena-private-kyc'),

  // Google Cloud Services
  GOOGLE_VISION_KEY: z.string().default('mock_google_vision_api_key'),
  GOOGLE_MAPS_API_KEY: z.string().default('mock_google_maps_api_key'),
  RECAPTCHA_SECRET_KEY: z.string().default('mock_recaptcha_secret_key'),

  // Mock Service Toggles
  ENABLE_MOCK_SMS: z
    .string()
    .default('true')
    .transform((val) => val === 'true'),
  ENABLE_MOCK_OCR: z
    .string()
    .default('true')
    .transform((val) => val === 'true'),
  ENABLE_MOCK_PAYMENT: z
    .string()
    .default('true')
    .transform((val) => val === 'true'),
});

export type EnvConfig = z.infer<typeof envSchema>;

const parseEnv = (): EnvConfig => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ FATAL: Invalid Environment Configuration:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }

  return result.data;
};

export const env = parseEnv();
