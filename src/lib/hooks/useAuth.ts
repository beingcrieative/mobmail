'use client';

import { useState, useEffect, useCallback } from 'react';
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

  // Utility functions for storage management
  const setCookie = useCallback((name: string, value: string, days: number = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  }, []);

  const getCookie = useCallback((name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue || null;
    }
    return null;
  }, []);

  const removeCookie = useCallback((name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }, []);

  const getStoredValue = useCallback((key: string): string | null => {
    try {
      // Try localStorage first, then cookies
      const localValue = localStorage.getItem(key);
      if (localValue) return localValue;
      
      return getCookie(key);
    } catch (error) {
      console.warn(`Error reading ${key} from storage:`, error);
      return getCookie(key);
    }
  }, [getCookie]);

  const setStoredValue = useCallback((key: string, value: string) => {
    try {
      // Store in both localStorage and cookies for redundancy
      localStorage.setItem(key, value);
      setCookie(key, value);
    } catch (error) {
      console.warn(`Error storing ${key}:`, error);
      // Fallback to cookies only
      setCookie(key, value);
    }
  }, [setCookie]);

  const clearStoredValues = useCallback(() => {
    try {
      // Clear localStorage
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
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
      const userId = getStoredValue(STORAGE_KEYS.USER_ID);
      const userEmail = getStoredValue(STORAGE_KEYS.USER_EMAIL);
      const authToken = getStoredValue(STORAGE_KEYS.AUTH_TOKEN);

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

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        clearStoredValues();
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
          setStoredValue(STORAGE_KEYS.USER_ID, session.user.id);
          setStoredValue(STORAGE_KEYS.USER_EMAIL, session.user.email || '');
          setStoredValue(STORAGE_KEYS.AUTH_TOKEN, session.access_token);
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
        clearStoredValues();
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }));
        return false;
      }

      if (data?.session && data?.user) {
        // Store authentication data
        setStoredValue(STORAGE_KEYS.USER_ID, data.user.id);
        setStoredValue(STORAGE_KEYS.USER_EMAIL, data.user.email || '');
        setStoredValue(STORAGE_KEYS.AUTH_TOKEN, data.session.access_token);
        setStoredValue(STORAGE_KEYS.SUPABASE_SESSION, JSON.stringify(data.session));

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
      clearStoredValues();
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      });
    }
  }, [clearStoredValues]);

  // Initialize authentication state
  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  // Listen for storage changes (for cross-tab synchronization)
  useEffect(() => {
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