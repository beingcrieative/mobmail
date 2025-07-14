/**
 * Enhanced PWA Authentication System for VoicemailAI
 * Handles secure authentication with offline support and biometric integration
 */

import { offlineStorage } from '../storage/offlineStorage';
import { syncManager } from '../sync/syncManager';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  sessionToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  lastActivity: number;
  biometricEnabled: boolean;
  offlineMode: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: 'basic' | 'pro' | 'enterprise';
  preferences: UserPreferences;
}

interface UserPreferences {
  language: 'nl' | 'en';
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  biometric: boolean;
  offlineSync: boolean;
  autoLogout: number; // minutes
}

interface BiometricOptions {
  allowFallback?: boolean;
  localizedFallbackTitle?: string;
  disableDeviceFallback?: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  biometric?: boolean;
}

interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  requiresMFA?: boolean;
  biometricAvailable?: boolean;
}

class PWAAuthManager {
  private state: AuthState = {
    isAuthenticated: false,
    user: null,
    sessionToken: null,
    refreshToken: null,
    expiresAt: null,
    lastActivity: Date.now(),
    biometricEnabled: false,
    offlineMode: false
  };

  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private refreshTimer: NodeJS.Timeout | null = null;
  private activityTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;

  /**
   * Initialize PWA authentication system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize dependencies
      await offlineStorage.initialize();
      await syncManager.initialize();

      // Load stored authentication state
      await this.loadAuthState();

      // Setup activity monitoring
      this.setupActivityMonitoring();

      // Check biometric availability
      await this.checkBiometricSupport();

      // Setup automatic token refresh
      this.setupTokenRefresh();

      // Validate current session
      await this.validateSession();

      this.isInitialized = true;
      console.log('🔐 PWA Auth Manager initialized');
    } catch (error) {
      console.error('❌ Failed to initialize PWA auth:', error);
      throw error;
    }
  }

  /**
   * Load authentication state from secure storage
   */
  private async loadAuthState(): Promise<void> {
    try {
      const storedState = await offlineStorage.getData('auth_state');
      
      if (storedState) {
        this.state = {
          ...this.state,
          ...storedState,
          lastActivity: Date.now()
        };

        // Check if session is still valid
        if (this.state.expiresAt && Date.now() > this.state.expiresAt) {
          console.log('🔓 Session expired, clearing auth state');
          await this.clearAuthState();
        } else {
          console.log('🔐 Restored authentication state');
          this.emit('auth-restored', { user: this.state.user });
        }
      }
    } catch (error) {
      console.error('❌ Failed to load auth state:', error);
    }
  }

  /**
   * Save authentication state to secure storage
   */
  private async saveAuthState(): Promise<void> {
    try {
      await offlineStorage.storeData(
        'auth_state',
        'settings',
        {
          isAuthenticated: this.state.isAuthenticated,
          user: this.state.user,
          sessionToken: this.state.sessionToken,
          refreshToken: this.state.refreshToken,
          expiresAt: this.state.expiresAt,
          biometricEnabled: this.state.biometricEnabled
        },
        { encrypt: true, expiresIn: 30 * 24 * 60 * 60 } // 30 days
      );
    } catch (error) {
      console.error('❌ Failed to save auth state:', error);
    }
  }

  /**
   * Check biometric authentication support
   */
  private async checkBiometricSupport(): Promise<boolean> {
    try {
      // Check if Web Authentication API is supported
      if (!window.PublicKeyCredential) {
        return false;
      }

      // Check if platform authenticator is available
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      
      if (available) {
        console.log('🔒 Biometric authentication available');
      }
      
      return available;
    } catch (error) {
      console.warn('⚠️ Biometric check failed:', error);
      return false;
    }
  }

  /**
   * Setup activity monitoring for auto-logout
   */
  private setupActivityMonitoring(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const updateActivity = () => {
      this.state.lastActivity = Date.now();
      this.resetActivityTimer();
    };

    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    this.resetActivityTimer();
  }

  /**
   * Reset activity timer based on user preferences
   */
  private resetActivityTimer(): void {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }

    if (!this.state.isAuthenticated || !this.state.user) return;

    const autoLogoutMinutes = this.state.user.preferences.autoLogout || 30;
    const timeoutMs = autoLogoutMinutes * 60 * 1000;

    this.activityTimer = setTimeout(() => {
      console.log('🔓 Auto-logout due to inactivity');
      this.logout('inactivity');
    }, timeoutMs);
  }

  /**
   * Setup automatic token refresh
   */
  private setupTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    if (!this.state.isAuthenticated || !this.state.expiresAt) return;

    // Refresh 5 minutes before expiry
    const refreshTime = this.state.expiresAt - Date.now() - (5 * 60 * 1000);
    
    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshToken();
      }, refreshTime);
    }
  }

  /**
   * Validate current session with server
   */
  private async validateSession(): Promise<boolean> {
    if (!this.state.sessionToken || !navigator.onLine) {
      return this.state.isAuthenticated;
    }

    try {
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.state.sessionToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update user data if changed
        if (data.user) {
          this.state.user = data.user;
          await this.saveAuthState();
          this.emit('user-updated', { user: data.user });
        }
        
        return true;
      } else {
        console.log('🔓 Session validation failed');
        await this.clearAuthState();
        return false;
      }
    } catch (error) {
      console.warn('⚠️ Session validation error:', error);
      // Allow offline mode if network fails
      return this.state.isAuthenticated;
    }
  }

  /**
   * Login with email/password
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      this.emit('login-started', {});

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          rememberMe: credentials.rememberMe,
          deviceInfo: this.getDeviceInfo()
        })
      });

      const data = await response.json();

      if (response.ok) {
        await this.setAuthenticatedState(data);
        
        // Setup biometric if requested and available
        if (credentials.biometric && await this.checkBiometricSupport()) {
          await this.setupBiometric();
        }

        this.emit('login-success', { user: this.state.user });
        
        return {
          success: true,
          user: this.state.user!,
          biometricAvailable: await this.checkBiometricSupport()
        };
      } else {
        this.emit('login-failed', { error: data.error });
        
        return {
          success: false,
          error: data.error || 'Login failed',
          requiresMFA: data.requiresMFA
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      this.emit('login-failed', { error: errorMessage });
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Setup biometric authentication
   */
  async setupBiometric(): Promise<boolean> {
    try {
      if (!await this.checkBiometricSupport()) {
        throw new Error('Biometric authentication not supported');
      }

      // Create credential for biometric authentication
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: {
            name: 'VoicemailAI',
            id: window.location.hostname
          },
          user: {
            id: new TextEncoder().encode(this.state.user!.id),
            name: this.state.user!.email,
            displayName: this.state.user!.name
          },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required'
          }
        }
      });

      if (credential) {
        this.state.biometricEnabled = true;
        await this.saveAuthState();
        
        console.log('🔒 Biometric authentication setup complete');
        this.emit('biometric-enabled', {});
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Biometric setup failed:', error);
      return false;
    }
  }

  /**
   * Login with biometric authentication
   */
  async loginWithBiometric(): Promise<AuthResult> {
    try {
      if (!this.state.biometricEnabled) {
        throw new Error('Biometric authentication not enabled');
      }

      this.emit('biometric-login-started', {});

      // Get credential using biometric
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          allowCredentials: [],
          userVerification: 'required'
        }
      });

      if (credential) {
        // Validate biometric credential with server
        const response = await fetch('/api/auth/biometric', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            credentialId: credential.id,
            deviceInfo: this.getDeviceInfo()
          })
        });

        const data = await response.json();

        if (response.ok) {
          await this.setAuthenticatedState(data);
          this.emit('login-success', { user: this.state.user, method: 'biometric' });
          
          return {
            success: true,
            user: this.state.user!
          };
        }
      }

      throw new Error('Biometric authentication failed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Biometric login failed';
      this.emit('biometric-login-failed', { error: errorMessage });
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<boolean> {
    if (!this.state.refreshToken) {
      console.warn('⚠️ No refresh token available');
      return false;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refreshToken: this.state.refreshToken
        })
      });

      const data = await response.json();

      if (response.ok) {
        this.state.sessionToken = data.sessionToken;
        this.state.expiresAt = Date.now() + (data.expiresIn * 1000);
        
        await this.saveAuthState();
        this.setupTokenRefresh();
        
        console.log('🔄 Token refreshed successfully');
        this.emit('token-refreshed', {});
        
        return true;
      } else {
        console.log('🔓 Token refresh failed, logging out');
        await this.logout('token_expired');
        return false;
      }
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      return false;
    }
  }

  /**
   * Logout user
   */
  async logout(reason: 'user' | 'inactivity' | 'token_expired' | 'security' = 'user'): Promise<void> {
    try {
      // Notify server of logout
      if (this.state.sessionToken && navigator.onLine) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.state.sessionToken}`
          },
          body: JSON.stringify({ reason })
        });
      }

      await this.clearAuthState();
      this.emit('logout', { reason });
      
      console.log(`🔓 User logged out (${reason})`);
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Still clear local state even if server logout fails
      await this.clearAuthState();
    }
  }

  /**
   * Set authenticated state
   */
  private async setAuthenticatedState(authData: any): Promise<void> {
    this.state.isAuthenticated = true;
    this.state.user = authData.user;
    this.state.sessionToken = authData.sessionToken;
    this.state.refreshToken = authData.refreshToken;
    this.state.expiresAt = Date.now() + (authData.expiresIn * 1000);
    this.state.lastActivity = Date.now();

    await this.saveAuthState();
    this.setupTokenRefresh();
    this.resetActivityTimer();
  }

  /**
   * Clear authentication state
   */
  private async clearAuthState(): Promise<void> {
    this.state = {
      isAuthenticated: false,
      user: null,
      sessionToken: null,
      refreshToken: null,
      expiresAt: null,
      lastActivity: Date.now(),
      biometricEnabled: false,
      offlineMode: false
    };

    await offlineStorage.deleteData('auth_state');
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
      this.activityTimer = null;
    }
  }

  /**
   * Get device information for security logging
   */
  private getDeviceInfo(): object {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: {
        width: screen.width,
        height: screen.height,
        pixelRatio: window.devicePixelRatio
      },
      standalone: window.matchMedia('(display-mode: standalone)').matches,
      timestamp: Date.now()
    };
  }

  /**
   * Get current authentication state
   */
  getAuthState(): AuthState {
    return { ...this.state };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.state.isAuthenticated && this.state.user !== null;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.state.user;
  }

  /**
   * Get session token for API calls
   */
  getSessionToken(): string | null {
    return this.state.sessionToken;
  }

  /**
   * Check if biometric is enabled
   */
  isBiometricEnabled(): boolean {
    return this.state.biometricEnabled;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<boolean> {
    if (!this.state.user) return false;

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.state.sessionToken}`
        },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        this.state.user.preferences = { ...this.state.user.preferences, ...preferences };
        await this.saveAuthState();
        this.emit('preferences-updated', { preferences: this.state.user.preferences });
        
        // Reset activity timer if auto-logout changed
        if (preferences.autoLogout !== undefined) {
          this.resetActivityTimer();
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Failed to update preferences:', error);
      return false;
    }
  }

  /**
   * Event listener management
   */
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`PWA Auth: Error in ${event} listener:`, error);
        }
      });
    }
  }
}

// Export singleton instance
export const pwaAuth = new PWAAuthManager();

// Export types
export type { AuthState, User, UserPreferences, LoginCredentials, AuthResult, BiometricOptions };