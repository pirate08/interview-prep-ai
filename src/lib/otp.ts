import { prisma } from '@/lib/prisma';
import {
  generateOtp,
  getOtpExperationTime,
  isOtpExpired,
} from '@/utils/helpers';
import { sendOTPEmail } from '@/services/email.service';

// --Configuration--
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

// --Generate and send OTP to user's email--
export async function sendOtp(
  email: string,
  purpose: 'registration' | 'login' | 'password_reset' = 'registration'
): Promise<{
  success: boolean;
  message: string;
  debug?: { otp: string };
}> {
  try {
    // --Invalidate previous OTPs for the same purpose--
    await prisma.oTPCode.updateMany({
      where: {
        email,
        verified: false,
        purpose,
      },
      data: {
        verified: true,
      },
    });

    // --Generate new OTP--
    const otpCode = generateOtp();
    const expiresAt = getOtpExperationTime(OTP_EXPIRY_MINUTES);

    // --Save OTP to database--
    await prisma.oTPCode.create({
      data: {
        code: otpCode,
        email,
        purpose,
        expiresAt,
      },
    });

    // --Send OTP via email--
    const emailSent = await sendOTPEmail(email, otpCode, purpose);

    if (!emailSent) {
      return {
        success: false,
        message: 'Failed to send OTP email. Please try again later.',
      };
    }

    return {
      success: true,
      message: 'OTP sent successfully.',
      debug:
        process.env.NODE_ENV === 'development' ? { otp: otpCode } : undefined,
    };
  } catch (error) {
    // --Handle unexpected errors--
    console.error('❌ sendOtp error:', error);
    return {
      success: false,
      message: 'Failed to send OTP. Please try again later.',
    };
  }
}
