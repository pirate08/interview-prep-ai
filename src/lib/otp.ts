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

// --Verify the provided OTP code--
export async function verifyOtp(
  email: string,
  code: string,
  purpose: 'registration' | 'login' | 'password_reset' = 'registration'
): Promise<{
  valid: boolean;
  message: string;
}> {
  try {
    // --Find the first unverified OTP for the email and purpose--
    const otpRecord = await prisma.oTPCode.findFirst({
      where: {
        email,
        purpose,
        verified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // --Check if Otp record exists--
    if (!otpRecord) {
      return {
        valid: false,
        message: 'Invalid OTP or no OTP found. Please request a new one.',
      };
    }

    // --Check if OTP is expired--
    if (isOtpExpired(otpRecord.expiresAt)) {
      // Mark as used so it can't be verified
      await prisma.oTPCode.update({
        where: { id: otpRecord.id },
        data: { verified: true },
      });
      return {
        valid: false,
        message: 'OTP has expired. Please request a new one.',
      };
    }

    // --Check if max attempts exceeded--
    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      await prisma.oTPCode.update({
        where: { id: otpRecord.id },
        data: { verified: true },
      });

      return {
        valid: false,
        message:
          'Maximum OTP verification attempts exceeded. Please request a new OTP.',
      };
    }

    // --Verify the code--
    if (otpRecord.code === code) {
      await prisma.oTPCode.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      });

      const remainingAttempts = MAX_OTP_ATTEMPTS - (otpRecord.attempts + 1);
      return {
        valid: false,
        message: `Invalid OTP code. ${remainingAttempts} attempt${
          remainingAttempts !== 1 ? 's' : ''
        } remaining.`,
      };
    }

    // --Mark OTP as verified--
    await prisma.oTPCode.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    return {
      valid: true,
      message: 'OTP verified successfully.',
    };
  } catch (error) {
    console.error('❌ verifyOtp error:', error);
    return {
      valid: false,
      message: 'Failed to verify OTP. Please try again later.',
    };
  }
}
