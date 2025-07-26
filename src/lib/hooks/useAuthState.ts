// Custom hook for authentication state management
import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '@/lib/services/authService';
import type { AuthState, AuthResult } from '@/lib/services/types/auth';

/**
 * Custom hook for managing authentication state
 * Replaces direct auth logic in components
 */
export function useAuthState() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isLoggedIn: false,
    error: null,
  });

  /**
   * Check authentication status
   */
  const checkAuthStatus = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const state = await AuthService.getAuthState();
      setAuthState(state);
    } catch (error) {
      console.error('Auth state check failed:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isLoggedIn: false,
        error: 'Failed to check authentication status',
      });
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async (): Promise<AuthResult> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    const result = await AuthService.logout();
    
    if (result.success) {
      setAuthState({
        user: null,
        isLoading: false,
        isLoggedIn: false,
        error: null,
      });
    } else {
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: result.error,
      }));
    }
    
    return result;
  }, []);

  /**
   * Check if user has access to a route
   */
  const checkAccess = useCallback(async (route: string): Promise<boolean> => {
    return AuthService.hasAccess(route);
  }, []);

  /**
   * Refresh authentication session
   */
  const refreshSession = useCallback(async (): Promise<AuthResult> => {
    const result = await AuthService.refreshSession();
    
    if (result.success && result.user) {
      setAuthState({
        user: result.user,
        isLoading: false,
        isLoggedIn: true,
        error: null,
      });
    }
    
    return result;
  }, []);

  // Initial auth check
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = AuthService.onAuthStateChange((newAuthState) => {
      setAuthState(newAuthState);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Legacy support: Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userId' || e.key === 'userEmail') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkAuthStatus]);

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    isLoggedIn: authState.isLoggedIn,
    error: authState.error,
    logout,
    checkAccess,
    refreshSession,
    checkAuthStatus,
  };
}