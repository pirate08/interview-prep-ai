// --Handles POST api/otp/request to verify an OTP code for a user's email address.--

import { NextRequest, NextResponse } from 'next/server';
import { verifyOtpSchema } from '@/utils/validators';
import { ApiResponse, VerifyOtpResponse } from '@/types/auth.types';
import { verifyOtp } from '@/lib/otp';
import { FindUserByEmail, VerifyUserEmail } from '@/services/user.service';

export async function POST(req: NextRequest) {
  try {
    // --Step 1: Parse request body--
    const body = await req.json();

    // --Step 2: Validate request data--
    const validateData = verifyOtpSchema.safeParse(body);

    if (!validateData.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error:
            validateData.error.issues[0].message || 'Invalid request data.',
        },
        { status: 400 },
      );
    }

    const { email, code, purpose } = validateData.data;

    // --Step 3: Verify the OTP code--
    const result = await verifyOtp(email, code, purpose);

    if (!result.valid) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: result.message,
        },
        { status: 400 },
      );
    }

    // --Step 4: Mark the email as verified (Only if it's for registration/login)--
    if (purpose !== 'password_reset') {
      const user = await FindUserByEmail(email);
      if (user && !user.emailVerified) {
        await VerifyUserEmail(email);
      }
    }

    // Step 5: Return success response
    const response: VerifyOtpResponse = {
      success: true,
      verified: true,
      message: result.message,
    };

    return NextResponse.json<ApiResponse<VerifyOtpResponse>>(
      {
        success: true,
        data: response,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error in Otp Verifcation process', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error during OTP verification.',
      },
      { status: 500 },
    );
  }
}
