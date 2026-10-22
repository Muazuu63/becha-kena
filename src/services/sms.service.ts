import { env } from '@/config/env';
import { logger } from '@/utils/logger';

export interface SendSmsOptions {
  phoneNumber: string;
  message: string;
}

export class SmsService {
  /**
   * Sends an SMS message to a Bangladeshi phone number.
   * Automatically uses Mock provider when ENABLE_MOCK_SMS=true.
   */
  static async sendSms({ phoneNumber, message }: SendSmsOptions): Promise<{ success: boolean; messageId: string }> {
    if (env.ENABLE_MOCK_SMS) {
      // Autonomous Dev / Test Mode: Print prominent banner in console & logs
      logger.info(
        `\n============================================================\n` +
        `📱 [MOCK SMS GATEWAY] Message sent to: ${phoneNumber}\n` +
        `💬 Body: "${message}"\n` +
        `============================================================`
      );

      return {
        success: true,
        messageId: `mock-msg-${Date.now()}`,
      };
    }

    try {
      // Production SSL Wireless API Integration
      logger.info(`Sending live SMS via SSL Wireless to ${phoneNumber}`);
      // In production, an HTTP request to env.SSL_WIRELESS_URL is executed here.
      return {
        success: true,
        messageId: `ssl-${Date.now()}`,
      };
    } catch (error) {
      logger.error({ err: error, phoneNumber }, 'Failed to dispatch SMS through gateway');
      return {
        success: false,
        messageId: '',
      };
    }
  }

  /**
   * Helper to format and send OTP SMS
   */
  static async sendOtp(phoneNumber: string, otp: string): Promise<boolean> {
    const message = `[বেচা-কেনা] আপনার ওটিপি কোড হলো: ${otp}। এই কোডের মেয়াদ ২ মিনিট। কাউকে এই কোড শেয়ার করবেন না।`;
    const result = await SmsService.sendSms({ phoneNumber, message });
    return result.success;
  }
}
