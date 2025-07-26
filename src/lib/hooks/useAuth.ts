'use client';

import { useState, useEffect, useCallback } from 'react';
import { secureStorage } from '@/lib/security/secureStorage';
import { getSupabase } from '@/lib/supabase';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
  } | null;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
}

const STORAGE_KEYS = {
  USER_ID: 'userId',
  USER_EMAIL: 'userEmail',
  AUTH_TOKEN: 'authToken',
  SUPABASE_SESSION: 'supabase.auth.token'
};

export function useAuth(): AuthState & AuthActions {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null
  });

  // Utility functions for storage management (client-side only)
  const setCookie = useCallback((name: string, value: string, days: number = 7) => {
    if (typeof document === 'undefined') return;
    try {
      const expires = new Date();
      expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
      document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    } catch (error) {
      console.warn('Error setting cookie:', error);
    }
  }, []);

  const getCookie = useCallback((name: string): string | null => {
    if (typeof document === 'undefined') return null;
    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift();
        return cookieValue || null;
      }
      return null;
    } catch (error) {
      console.warn('Error reading cookie:', error);
      return null;
    }
  }, []);

  const removeCookie = useCallback((name: string) => {
    if (typeof document === 'undefined') return;
    try {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    } catch (error) {
      console.warn('Error removing cookie:', error);
    }
  }, []);

  const getStoredValue = useCallback(async (key: string): Promise<string | null> => {
    try {
      // Try secure storage first, then fallback to cookies
      const secureValue = await secureStorage.getSecureItem<string>(key);
      if (secureValue) return secureValue;
      
      return getCookie(key);
    } catch (error) {
      console.warn(`Error reading ${key} from secure storage:`, error);
      return getCookie(key);
    }
  }, [getCookie]);

  const setStoredValue = useCallback(async (key: string, value: string) => {
    try {
      // Store in secure storage and cookies for redundancy
      await secureStorage.setSecureItem(key, value, { fallbackToPlaintext: true });
      setCookie(key, value);
    } catch (error) {
      console.warn(`Error storing ${key} in secure storage:`, error);
      // Fallback to cookies only
      setCookie(key, value);
    }
  }, [setCookie]);

  const clearStoredValues = useCallback(async () => {
    try {
      // Clear secure storage and cookies
      await secureStorage.clearAllSecureData();
      Object.values(STORAGE_KEYS).forEach(key => {
        removeCookie(key);
      });
    } catch (error) {
      console.warn('Error clearing stored values:', error);
      // Fallback to clearing cookies only
      Object.values(STORAGE_KEYS).forEach(key => {
        removeCookie(key);
      });
    }
  }, [removeCookie]);

  const refreshAuth = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Check stored authentication data
      const userId = await getStoredValue(STORAGE_KEYS.USER_ID);
      const userEmail = await getStoredValue(STORAGE_KEYS.USER_EMAIL);
      const authToken = await getStoredValue(STORAGE_KEYS.AUTH_TOKEN);

      console.log('Auth check - stored values:', {
        hasUserId: !!userId,
        hasUserEmail: !!userEmail,
        hasAuthToken: !!authToken,
        userEmail: userEmail?.substring(0, 10) + '...'
      });

      if (!userId || !userEmail || !authToken) {
        console.log('Missing auth credentials, user not authenticated');
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null
        });
        return;
      }

      // Verify with Supabase
      const supabase = getSupabase();
      if (!supabase) {
        console.warn('Supabase client not available');
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: 'Authentication service unavailable'
        });
        return;
      }

      // Get current session with error handling
      let session = null;
      let sessionError = null;
      
      try {
        const result = await supabase.auth.getSession();
        session = result.data?.session;
        sessionError = result.error;
      } catch (error) {
        console.warn('Auth state error:', error);
        // If AuthSessionMissingError, treat as unauthenticated rather than error
        if (error instanceof Error && error.message.includes('AuthSessionMissingError')) {
          console.log('No auth session found, treating as unauthenticated');
          await clearStoredValues();
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: null
          });
          return;
        }
        sessionError = error;
      }
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        await clearStoredValues();
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: sessionError.message
        });
        return;
      }

      if (session && session.user) {
        // Session is valid, update stored values if needed
        if (session.user.id !== userId || session.user.email !== userEmail) {
          await setStoredValue(STORAGE_KEYS.USER_ID, session.user.id);
          await setStoredValue(STORAGE_KEYS.USER_EMAIL, session.user.email || '');
          await setStoredValue(STORAGE_KEYS.AUTH_TOKEN, session.access_token);
          
          // Set session token for encryption
          secureStorage.setSessionToken(session.access_token);
        }

        setAuthState({
          isAuthenticated: true,
          user: {
            id: session.user.id,
            email: session.user.email || ''
          },
          loading: false,
          error: null
        });
      } else {
        // No valid session but we have stored auth data
        // This could indicate an expired session
        console.log('No valid session found, clearing stored auth');
        await clearStoredValues();
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Error during auth refresh:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication error'
      });
    }
  }, [getStoredValue, setStoredValue, clearStoredValues]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const supabase = getSupabase();
      if (!supabase) {
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Authentication service unavailable' 
        }));
        return false;
      }

      let data = null;
      let error = null;
      
      try {
        const result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        data = result.data;
        error = result.error;
      } catch (authError) {
        console.error('Auth error during login:', authError);
        error = authError;
      }

      if (error) {
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message || 'Login failed'
        }));
        return false;
      }

      if (data?.session && data?.user) {
        // Store authentication data securely
        await setStoredValue(STORAGE_KEYS.USER_ID, data.user.id);
        await setStoredValue(STORAGE_KEYS.USER_EMAIL, data.user.email || '');
        await setStoredValue(STORAGE_KEYS.AUTH_TOKEN, data.session.access_token);
        
        // Set session token for encryption
        secureStorage.setSessionToken(data.session.access_token);
        await setStoredValue(STORAGE_KEYS.SUPABASE_SESSION, JSON.stringify(data.session));

        setAuthState({
          isAuthenticated: true,
          user: {
            id: data.user.id,
            email: data.user.email || ''
          },
          loading: false,
          error: null
        });

        return true;
      }

      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Login failed' 
      }));
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      }));
      return false;
    }
  }, [setStoredValue]);

  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear stored values, even if signOut fails
      await clearStoredValues();
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      });
    }
  }, [clearStoredValues]);

  // Initialize authentication state (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      refreshAuth();
    }
  }, [refreshAuth]);

  // Listen for storage changes (for cross-tab synchronization, client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleStorageChange = (e: StorageEvent) => {
      if (Object.values(STORAGE_KEYS).includes(e.key as any)) {
        console.log('Storage changed, refreshing auth');
        refreshAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshAuth]);

  return {
    ...authState,
    refreshAuth,
    logout,
    login
  };
}