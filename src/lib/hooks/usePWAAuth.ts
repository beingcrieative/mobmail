/**
 * React Hook for PWA Authentication Management
 * Provides reactive state management for secure authentication with offline support
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { pwaAuth, type AuthState, type User, type LoginCredentials, type AuthResult } from '../auth/pwaAuth';

interface PWAAuthHookState extends AuthState {
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  biometricSupported: boolean;
  sessionTimeRemaining: number | null;
}

export function usePWAAuth() {
  const [state, setState] = useState<PWAAuthHookState>({
    ...pwaAuth.getAuthState(),
    isLoading: true,
    error: null,
    isInitialized: false,
    biometricSupported: false,
    sessionTimeRemaining: null
  });

  /**
   * Update state from PWA auth manager
   */
  const updateState = useCallback(() => {
    const authState = pwaAuth.getAuthState();
    
    // Calculate session time remaining
    let sessionTimeRemaining: number | null = null;
    if (authState.expiresAt) {
      sessionTimeRemaining = Math.max(0, authState.expiresAt - Date.now());
    }

    setState(prev => ({
      ...prev,
      ...authState,
      sessionTimeRemaining,
      isLoading: false
    }));
  }, []);

  /**
   * Initialize PWA auth and setup listeners
   */
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        await pwaAuth.initialize();
        
        // Check biometric support
        const biometricSupported = 'PublicKeyCredential' in window &&
          await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().catch(() => false);
        
        if (mounted) {
          setState(prev => ({
            ...prev,
            isInitialized: true,
            biometricSupported,
            isLoading: false
          }));
          updateState();
        }
      } catch (error) {
        console.error('Failed to initialize PWA auth:', error);
        if (mounted) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            isInitialized: false,
            error: error instanceof Error ? error.message : 'Initialization failed'
          }));
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [updateState]);

  /**
   * Setup auth event listeners
   */
  useEffect(() => {
    // Auth state change handlers
    const handleAuthRestored = (data: { user: User }) => {
      updateState();
      setState(prev => ({ ...prev, error: null }));
    };

    const handleLoginStarted = () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
    };

    const handleLoginSuccess = (data: { user: User; method?: string }) => {
      updateState();
      setState(prev => ({ ...prev, isLoading: false, error: null }));
    };

    const handleLoginFailed = (data: { error: string }) => {
      updateState();
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: data.error 
      }));
    };

    const handleBiometricLoginStarted = () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
    };

    const handleBiometricLoginFailed = (data: { error: string }) => {
      updateState();
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: `Biometric login failed: ${data.error}` 
      }));
    };

    const handleTokenRefreshed = () => {
      updateState();
    };

    const handleLogout = (data: { reason: string }) => {
      updateState();
      setState(prev => ({ 
        ...prev, 
        error: data.reason === 'inactivity' ? 'Session expired due to inactivity' :
               data.reason === 'token_expired' ? 'Session expired' :
               data.reason === 'security' ? 'Logged out for security reasons' : null
      }));
    };

    const handleUserUpdated = () => {
      updateState();
    };

    const handlePreferencesUpdated = () => {
      updateState();
    };

    const handleBiometricEnabled = () => {
      updateState();
    };

    // Register event listeners
    pwaAuth.on('auth-restored', handleAuthRestored);
    pwaAuth.on('login-started', handleLoginStarted);
    pwaAuth.on('login-success', handleLoginSuccess);
    pwaAuth.on('login-failed', handleLoginFailed);
    pwaAuth.on('biometric-login-started', handleBiometricLoginStarted);
    pwaAuth.on('biometric-login-failed', handleBiometricLoginFailed);
    pwaAuth.on('token-refreshed', handleTokenRefreshed);
    pwaAuth.on('logout', handleLogout);
    pwaAuth.on('user-updated', handleUserUpdated);
    pwaAuth.on('preferences-updated', handlePreferencesUpdated);
    pwaAuth.on('biometric-enabled', handleBiometricEnabled);

    // Cleanup listeners
    return () => {
      pwaAuth.off('auth-restored', handleAuthRestored);
      pwaAuth.off('login-started', handleLoginStarted);
      pwaAuth.off('login-success', handleLoginSuccess);
      pwaAuth.off('login-failed', handleLoginFailed);
      pwaAuth.off('biometric-login-started', handleBiometricLoginStarted);
      pwaAuth.off('biometric-login-failed', handleBiometricLoginFailed);
      pwaAuth.off('token-refreshed', handleTokenRefreshed);
      pwaAuth.off('logout', handleLogout);
      pwaAuth.off('user-updated', handleUserUpdated);
      pwaAuth.off('preferences-updated', handlePreferencesUpdated);
      pwaAuth.off('biometric-enabled', handleBiometricEnabled);
    };
  }, [updateState]);

  /**
   * Setup session timer to update remaining time
   */
  useEffect(() => {
    if (!state.expiresAt) return;

    const timer = setInterval(() => {
      const remaining = Math.max(0, state.expiresAt! - Date.now());
      setState(prev => ({ ...prev, sessionTimeRemaining: remaining }));
      
      // Auto-logout if session expired
      if (remaining === 0 && state.isAuthenticated) {
        pwaAuth.logout('token_expired');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [state.expiresAt, state.isAuthenticated]);

  /**
   * Authentication operations
   */
  const operations = {
    // Login with email/password
    login: useCallback(async (credentials: LoginCredentials): Promise<AuthResult> => {
      try {
        setState(prev => ({ ...prev, error: null }));
        return await pwaAuth.login(credentials);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Login failed';
        setState(prev => ({ ...prev, error: errorMessage }));
        return { success: false, error: errorMessage };
      }
    }, []),

    // Login with biometric
    loginWithBiometric: useCallback(async (): Promise<AuthResult> => {
      try {
        setState(prev => ({ ...prev, error: null }));
        return await pwaAuth.loginWithBiometric();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Biometric login failed';
        setState(prev => ({ ...prev, error: errorMessage }));
        return { success: false, error: errorMessage };
      }
    }, []),

    // Setup biometric authentication
    setupBiometric: useCallback(async (): Promise<boolean> => {
      try {
        setState(prev => ({ ...prev, error: null }));
        return await pwaAuth.setupBiometric();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Biometric setup failed';
        setState(prev => ({ ...prev, error: errorMessage }));
        return false;
      }
    }, []),

    // Logout
    logout: useCallback(async (reason?: 'user' | 'inactivity' | 'token_expired' | 'security'): Promise<void> => {
      try {
        await pwaAuth.logout(reason);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }, []),

    // Update user preferences
    updatePreferences: useCallback(async (preferences: any): Promise<boolean> => {
      try {
        setState(prev => ({ ...prev, error: null }));
        return await pwaAuth.updatePreferences(preferences);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update preferences';
        setState(prev => ({ ...prev, error: errorMessage }));
        return false;
      }
    }, []),

    // Clear error
    clearError: useCallback(() => {
      setState(prev => ({ ...prev, error: null }));
    }, [])
  };

  /**
   * Utility functions
   */
  const utils = {
    // Get session token for API calls
    getSessionToken: useCallback((): string | null => {
      return pwaAuth.getSessionToken();
    }, []),

    // Format session time remaining
    getSessionTimeFormatted: useCallback((): string => {
      if (!state.sessionTimeRemaining) return 'Expired';
      
      const minutes = Math.floor(state.sessionTimeRemaining / 60000);
      const seconds = Math.floor((state.sessionTimeRemaining % 60000) / 1000);
      
      if (minutes > 60) {
        const hours = Math.floor(minutes / 60);
        return `${hours}h ${minutes % 60}m`;
      }
      
      if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      }
      
      return `${seconds}s`;
    }, [state.sessionTimeRemaining]),

    // Check if session is expiring soon (within 5 minutes)
    isSessionExpiringSoon: useCallback((): boolean => {
      return !!(state.sessionTimeRemaining && state.sessionTimeRemaining < 5 * 60 * 1000);
    }, [state.sessionTimeRemaining]),

    // Get user display name
    getUserDisplayName: useCallback((): string => {
      if (!state.user) return '';
      return state.user.name || state.user.email.split('@')[0];
    }, [state.user]),

    // Get user initials for avatar
    getUserInitials: useCallback((): string => {
      if (!state.user) return '';
      
      if (state.user.name) {
        return state.user.name
          .split(' ')
          .map(part => part[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
      }
      
      return state.user.email[0].toUpperCase();
    }, [state.user]),

    // Check if user has specific plan
    hasPlan: useCallback((plan: 'basic' | 'pro' | 'enterprise'): boolean => {
      if (!state.user) return false;
      
      const planHierarchy = { basic: 1, pro: 2, enterprise: 3 };
      const userPlanLevel = planHierarchy[state.user.plan];
      const requiredPlanLevel = planHierarchy[plan];
      
      return userPlanLevel >= requiredPlanLevel;
    }, [state.user]),

    // Get last activity time formatted
    getLastActivityFormatted: useCallback((): string => {
      const diff = Date.now() - state.lastActivity;
      
      if (diff < 60000) return 'Just now';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      return `${Math.floor(diff / 86400000)}d ago`;
    }, [state.lastActivity])
  };

  return {
    // State
    ...state,
    
    // Operations
    ...operations,
    
    // Utilities
    ...utils,
    
    // Computed values
    canUseBiometric: state.biometricSupported && state.biometricEnabled,
    shouldShowBiometricSetup: state.biometricSupported && !state.biometricEnabled && state.isAuthenticated,
    isSessionValid: state.isAuthenticated && !!(state.sessionTimeRemaining && state.sessionTimeRemaining > 0),
    authStatus: state.isLoading ? 'loading' :
               !state.isInitialized ? 'error' :
               state.isAuthenticated ? 'authenticated' : 'unauthenticated'
  };
}