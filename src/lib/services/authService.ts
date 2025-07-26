// Authentication service
import { createBrowserClient } from '@supabase/ssr';
import type { 
  UserProfile, 
  AuthState, 
  LoginCredentials, 
  RegisterData, 
  PasswordReset, 
  NewPassword, 
  AuthResult
} from './types/auth';

// Re-export types for external use
export type {
  UserProfile,
  AuthState,
  LoginCredentials,
  RegisterData,
  PasswordReset,
  NewPassword,
  AuthResult,
} from './types/auth';
import { 
  LoginCredentialsSchema, 
  RegisterDataSchema, 
  PasswordResetSchema, 
  NewPasswordSchema 
} from './types/auth';

/**
 * Authentication service class
 * Handles all authentication operations with Supabase
 */
export class AuthService {
  private static supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          if (typeof document === 'undefined') return '';
          const value = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`))
            ?.split('=')[1];
          return value || '';
        },
        set(name, value) {
          if (typeof document === 'undefined') return;
          document.cookie = `${name}=${value}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        },
        remove(name) {
          if (typeof document === 'undefined') return;
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        },
      },
    }
  );

  /**
   * Get current authentication state
   */
  static async getAuthState(): Promise<AuthState> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      
      if (error) {
        console.error('Auth state error:', error);
        return {
          user: null,
          isLoading: false,
          isLoggedIn: false,
          error: error.message,
        };
      }

      return {
        user: user as UserProfile | null,
        isLoading: false,
        isLoggedIn: !!user,
        error: null,
      };
    } catch (error) {
      console.error('Auth state check failed:', error);
      return {
        user: null,
        isLoading: false,
        isLoggedIn: false,
        error: 'Failed to check authentication state',
      };
    }
  }

  /**
   * Login with email and password
   */
  static async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      // Validate input
      const validatedCredentials = LoginCredentialsSchema.parse(credentials);
      
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: validatedCredentials.email,
        password: validatedCredentials.password,
      });

      if (error) {
        return {
          success: false,
          error: this.mapSupabaseError(error.message),
          user: null,
        };
      }

      return {
        success: true,
        error: null,
        user: data.user as UserProfile,
        redirectTo: '/dashboard',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Login failed. Please try again.',
        user: null,
      };
    }
  }

  /**
   * Register new user
   */
  static async register(data: RegisterData): Promise<AuthResult> {
    try {
      // Validate input
      const validatedData = RegisterDataSchema.parse(data);
      
      const { data: authData, error } = await this.supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: {
            name: validatedData.name,
            company_name: validatedData.companyName,
            mobile_number: validatedData.mobileNumber,
          },
        },
      });

      if (error) {
        return {
          success: false,
          error: this.mapSupabaseError(error.message),
          user: null,
        };
      }

      return {
        success: true,
        error: null,
        user: authData.user as UserProfile,
        redirectTo: '/dashboard',
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Registration failed. Please try again.',
        user: null,
      };
    }
  }

  /**
   * Logout current user
   */
  static async logout(): Promise<AuthResult> {
    try {
      const { error } = await this.supabase.auth.signOut();
      
      if (error) {
        return {
          success: false,
          error: 'Logout failed. Please try again.',
          user: null,
        };
      }

      // Clear any stored session data
      if (typeof window !== 'undefined') {
        // Clear localStorage items
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('cal_') || key.startsWith('voicemail-')) {
            localStorage.removeItem(key);
          }
        });

        // Clear cookies
        document.cookie.split(";").forEach(cookie => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });
      }

      return {
        success: true,
        error: null,
        user: null,
        redirectTo: '/login',
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: 'Logout failed. Please try again.',
        user: null,
      };
    }
  }

  /**
   * Request password reset
   */
  static async resetPassword(resetData: PasswordReset): Promise<AuthResult> {
    try {
      // Validate input
      const validatedData = PasswordResetSchema.parse(resetData);
      
      const { error } = await this.supabase.auth.resetPasswordForEmail(
        validatedData.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        return {
          success: false,
          error: this.mapSupabaseError(error.message),
          user: null,
        };
      }

      return {
        success: true,
        error: null,
        user: null,
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: 'Password reset failed. Please try again.',
        user: null,
      };
    }
  }

  /**
   * Update password
   */
  static async updatePassword(passwordData: NewPassword): Promise<AuthResult> {
    try {
      // Validate input
      const validatedData = NewPasswordSchema.parse(passwordData);
      
      const { data, error } = await this.supabase.auth.updateUser({
        password: validatedData.password,
      });

      if (error) {
        return {
          success: false,
          error: this.mapSupabaseError(error.message),
          user: null,
        };
      }

      return {
        success: true,
        error: null,
        user: data.user as UserProfile,
      };
    } catch (error) {
      console.error('Password update error:', error);
      return {
        success: false,
        error: 'Password update failed. Please try again.',
        user: null,
      };
    }
  }

  /**
   * Check if user has access to a route
   */
  static async hasAccess(route: string): Promise<boolean> {
    try {
      const authState = await this.getAuthState();
      
      // Define protected routes
      const protectedRoutes = [
        '/dashboard',
        '/mobile-v3',
        '/profile',
        '/settings',
        '/subscription',
        '/analytics',
      ];

      // Check if route requires authentication
      const requiresAuth = protectedRoutes.some(protectedRoute => 
        route.startsWith(protectedRoute)
      );

      if (!requiresAuth) {
        return true;
      }

      return authState.isLoggedIn;
    } catch (error) {
      console.error('Access check error:', error);
      return false;
    }
  }

  /**
   * Subscribe to authentication state changes
   */
  static onAuthStateChange(callback: (authState: AuthState) => void) {
    return this.supabase.auth.onAuthStateChange(async () => {
      const authState = await this.getAuthState();
      callback(authState);
    });
  }

  /**
   * Map Supabase errors to user-friendly messages
   */
  private static mapSupabaseError(error: string): string {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Invalid email or password',
      'Email not confirmed': 'Please check your email and confirm your account',
      'User already registered': 'An account with this email already exists',
      'Password should be at least 6 characters': 'Password must be at least 6 characters',
      'Signup requires a valid password': 'Please enter a valid password',
      'Invalid email': 'Please enter a valid email address',
    };

    return errorMap[error] || error || 'An unexpected error occurred';
  }

  /**
   * Refresh current session
   */
  static async refreshSession(): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession();
      
      if (error) {
        return {
          success: false,
          error: 'Session refresh failed',
          user: null,
        };
      }

      return {
        success: true,
        error: null,
        user: data.user as UserProfile,
      };
    } catch (error) {
      console.error('Session refresh error:', error);
      return {
        success: false,
        error: 'Session refresh failed',
        user: null,
      };
    }
  }
}