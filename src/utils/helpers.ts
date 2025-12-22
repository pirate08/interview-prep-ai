// ==========================================
// OTP FUNCTIONS
// ==========================================

// --Generate a random 6-digit OTP code--
export function generateOtp(): string {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

// --Get Otp extention time in milliseconds (e.g., 5 minutes)--
export function getOtpExperationTime(minutes: number = 10): Date {
  const now = new Date();
  return new Date(now.getTime() + minutes * 60000);
}

// --Check if an OTP has expired--
export function isOtpExpired(expiryDate: Date): boolean {
  return new Date() > expiryDate;
}

// ==========================================
// PRIVACY FUNCTIONS
// ==========================================

// -- Mask email for privacy in responses (e.g, maxxxhdxbgxxwxxx@gmail.com)--
export function maskEmail(email: string): string {
  const [username, domain] = email.split('@');

  if (!username || !domain) return email;

  if (username.length <= 2) {
    return `${username[0]}***@${domain}`;
  }

  // --Show first character + *** + @ + domain--
  return `${username[0]}${'*'.repeat(
    Math.min(username.length - 1, 5)
  )}@${domain}`;
}

// ==========================================
// DATA SANITIZATION
// ==========================================

// --Remove password from user object before sending to client--
export function sanitizeUser(user: any) {
  const { password, ...sanitized } = user;
  return sanitized;
}

// ==========================================
// RATE LIMITING HELPERS
// ==========================================

// --Sleep function for rate limiting--
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ==========================================
// ERROR HANDLING
// ==========================================

// --Format error message for consistent API responses--
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}
