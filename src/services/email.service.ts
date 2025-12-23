import { Resend } from 'resend';

// --Initialize the Resend client with API key--
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

if (!resend) {
  throw new Error('Resend API key is not defined in environment variables.');
}

// --Send OTP email to user--

export async function sendOTPEmail(
  email: string,
  otp: string,
  purpose: 'registration' | 'login' | 'password_reset'
): Promise<boolean> {
  try {
    const { subject, html } = getEmailContent(otp, purpose);

    // --DEVELOPMENT MODE: Just log to console--
    if (process.env.NODE_ENV === 'development' || !resend) {
      console.log('\n' + '='.repeat(50));
      console.log('📧 EMAIL (Development Mode)');
      console.log('='.repeat(50));
      console.log(`To: ${email}`);
      console.log(`Subject: ${subject}`);
      console.log(`OTP Code: ${otp}`);
      console.log(`Purpose: ${purpose}`);
      console.log(`Expires: 10 minutes`);
      console.log('='.repeat(50) + '\n');

      return true;
    }
    // --PRODUCTION MODE: Actually send email via Resend--
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: [email],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('❌ Resend email error:', error);
      return false;
    }

    console.log('✅ Email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error);
    return false;
  }
}

// --Generate email subject and HTML content based on purpose--
export function getEmailContent(
  otp: string,
  purpose: 'registration' | 'login' | 'password_reset'
): { subject: string; html: string } {
  const appName = process.env.APP_NAME || 'InterviewMate AI';

  let subject = '';
  let heading = '';
  let message = '';

  switch (purpose) {
    case 'registration':
      subject = `Please Verify your email`;
      heading = `Welcome to ${appName}! Verify Your Email`;
      message = `Thank you for signing up. Please use the code below to verify your email address and complete your registration.`;
      break;

    case 'login':
      subject = `Your login code - ${appName}`;
      heading = `Login to ${appName}`;
      message =
        'You requested to sign in to your account. Use the code below to continue.';
      break;

    case 'password_reset':
      subject = `Reset your password - ${appName}`;
      heading = 'Password Reset Request';
      message =
        "You requested to reset your password. Use the code below to continue. If you didn't request this, please ignore this email.";
      break;
  }

  // --HTML email template--
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
        
        <!-- Main Container -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
          <tr>
            <td align="center">
              
              <!-- Email Card -->
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                      ${appName}
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 600;">
                      ${heading}
                    </h2>
                    
                    <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6;">
                      ${message}
                    </p>
                    
                    <!-- OTP Box -->
                    <div style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border: 2px dashed #667eea; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                      <p style="margin: 0 0 10px; color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                        Your Verification Code
                      </p>
                      <p style="margin: 0; color: #667eea; font-size: 42px; font-weight: bold; letter-spacing: 10px; font-family: 'Courier New', monospace;">
                        ${otp}
                      </p>
                    </div>
                    
                    <!-- Important Notice -->
                    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 30px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                        ⚠️ This code will expire in <strong>10 minutes</strong>. Never share this code with anyone.
                      </p>
                    </div>
                    
                    <p style="margin: 30px 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                      If you didn't request this code, please ignore this email or contact support if you have concerns.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="margin: 0; color: #999999; font-size: 12px;">
                      © ${new Date().getFullYear()} ${appName}. All rights reserved.
                    </p>
                    <p style="margin: 10px 0 0; color: #999999; font-size: 12px;">
                      This is an automated email, please do not reply.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return { subject, html };
}
