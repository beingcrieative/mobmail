// Authentication service types
import { z } from 'zod';

// User profile schema matching Supabase auth user structure
export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  user_metadata: z.object({
    name: z.string().optional(),
    company_name: z.string().optional(),
    mobile_number: z.string().optional(),
    additional_info: z.string().optional(),
  }).optional(),
});

// Auth state schema
export const AuthStateSchema = z.object({
  user: UserProfileSchema.nullable(),
  isLoading: z.boolean(),
  isLoggedIn: z.boolean(),
  error: z.string().nullable(),
});

// Login credentials schema
export const LoginCredentialsSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Registration data schema
export const RegisterDataSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  name: z.string().min(1, 'Name is required'),
  companyName: z.string().optional(),
  mobileNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Password reset schema
export const PasswordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// New password schema
export const NewPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Route access configuration
export const RouteAccessSchema = z.object({
  route: z.string(),
  requireAuth: z.boolean(),
  requiredRoles: z.array(z.string()).optional(),
  redirectTo: z.string().optional(),
});

// Auth operation result
export const AuthResultSchema = z.object({
  success: z.boolean(),
  error: z.string().nullable(),
  user: UserProfileSchema.nullable(),
  redirectTo: z.string().optional(),
});

// Export types
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type AuthState = z.infer<typeof AuthStateSchema>;
export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;
export type RegisterData = z.infer<typeof RegisterDataSchema>;
export type PasswordReset = z.infer<typeof PasswordResetSchema>;
export type NewPassword = z.infer<typeof NewPasswordSchema>;
export type RouteAccess = z.infer<typeof RouteAccessSchema>;
export type AuthResult = z.infer<typeof AuthResultSchema>;

// Auth event types
export type AuthEvent = 
  | 'SIGNED_IN'
  | 'SIGNED_OUT' 
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'PASSWORD_RECOVERY';

// Auth error types
export type AuthError =
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'EMAIL_ALREADY_EXISTS'
  | 'WEAK_PASSWORD'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

// Auth service configuration
export interface AuthServiceConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  redirectUrls: {
    login: string;
    logout: string;
    dashboard: string;
    resetPassword: string;
  };
  sessionTimeout: number;
  rememberMe: boolean;
}