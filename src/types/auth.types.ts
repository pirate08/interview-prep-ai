// ==========================================
// REQUEST TYPES
// ==========================================

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  otp: string; 
}

export interface SendOtpRequest {
  email: string;
  purpose: 'registration' | 'login' | 'password_reset';
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
  purpose: 'registration' | 'login' | 'password_reset';
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ==========================================
// RESPONSE TYPES
// ==========================================

// Standardized uppercase <T>
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  expiresIn: number;
  debug?: {
    otpCode: string;
  };
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  verified: boolean;
}

// Matching Prisma Schema exactly
export interface UserData {
  id: string;
  name: string;
  email: string;
  bio?: string | null;
  image?: string | null;
  emailVerified: Date | null;
  role: string;
  isNewUser: boolean;
  createdAt: Date;

  // --Profile / Onboarding--
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | null;
  designation?: string | null;
  selectedCourse?: string | null;

  // --Stats--
  totalRightAnswers: number;
  totalWrongAnswers: number;
  totalAiHelped: number;
  journeyProgress: number;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: UserData;
  token: string;
}
