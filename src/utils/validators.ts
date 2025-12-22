import { z } from 'zod';

// ==========================================
// INDIVIDUAL FIELD VALIDATORS
// ==========================================

export const emailSchema = z
  .email({ message: 'Invalid email address' })
  .min(1, 'Email is required')
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(100, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[^a-zA-Z0-9]/,
    'Password must contain at least one special character(e.g., !@#$%^&*)'
  );

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters long')
  .max(50, 'Name is too long')
  .trim();

export const otpSchema = z
  .string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only digits');

// ==========================================
// REQUEST VALIDATORS
// ==========================================

export const sendOtpschema = z.object({
  email: emailSchema,
  purpose: z.enum(['registration', 'login', 'password_reset']),
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  code: otpSchema,
  purpose: z.enum(['registration', 'login', 'password_reset']),
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  otp: otpSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// ==========================================
// HELPER FUNCTIONS (Using safeParse)
// ==========================================
export const isValidEmail = (email: string) =>
  emailSchema.safeParse(email).success;

export const isValidPassword = (password: string) =>
  passwordSchema.safeParse(password).success;

export const isValidName = (name: string) => nameSchema.safeParse(name).success;

export const isValidOtp = (otp: string) => otpSchema.safeParse(otp).success;
