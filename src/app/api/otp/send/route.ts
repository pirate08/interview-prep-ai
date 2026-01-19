// --Handles the POST api/otp/send request to send an OTP to a user's email address.

import { NextRequest, NextResponse } from 'next/server';
import { sendOtpschema } from '@/utils/validators';
import { sendOtp } from '@/lib/otp';
import { UserExists } from '@/services/user.service';
import { maskEmail } from '@/utils/helpers';
import { ApiResponse, SendOtpResponse } from '@/types/auth.types';

export async function POST(req: NextRequest) {
  try {
    // Step 1: Parse request body
    const body = await req.json();

    // Step 2: Validate request data
    const validation = sendOtpschema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: validation.error.issues[0].message || 'Invalid request data.',
        },
        { status: 400 }
      );
    }

    const { email, purpose } = validation.data;

    // Step 3: Check if user exists (based on purpose)
    const exists = await UserExists(email);

    if (purpose === 'registration' && exists) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'An account with this email already exists. Please login instead.',
        },
        { status: 409 }
      );
    }

    if (purpose === 'login' && !exists) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'No account found with this email. Please register first.',
        },
        { status: 404 }
      );
    }

    // Step 4: Send OTP
    const result = await sendOtp(email, purpose);

    if (!result.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: result.message,
        },
        { status: 500 }
      );
    }

    // Step 5: Return success response
    const maskedEmail = maskEmail(email);
    
    const response: SendOtpResponse = {
      success: true,
      message: `Verification code sent to ${maskedEmail}`,
      expiresIn: 600, // 10 minutes in seconds
    };

    // Include OTP in development mode for testing
    if (result.debug) {
      response.debug = result.debug;
    }

    return NextResponse.json<ApiResponse<SendOtpResponse>>(
      {
        success: true,
        data: response,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Send OTP API error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}
