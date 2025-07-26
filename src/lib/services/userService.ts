// User service for profile and preference management
import { ApiService } from './apiService';
import type { 
  UserProfileData, 
  UserProfileUpdate, 
  CalCredentials, 
  CalValidation, 
  CalEventType,
  UserPreferences, 
  UserOperationResult 
} from './types/user';

// Re-export types for external use
export type {
  UserProfileData,
  UserProfileUpdate,
  CalCredentials,
  CalValidation,
  CalEventType,
  UserPreferences,
  UserOperationResult,
} from './types/user';
import { 
  UserProfileUpdateSchema, 
  CalCredentialsSchema 
} from './types/user';

/**
 * User service class
 * Handles user profile, preferences, and Cal.com integration
 */
export class UserService {
  private static readonly ENDPOINTS = {
    profile: '/api/user/profile',
    preferences: '/api/user/preferences',
    calValidation: '/api/user/cal-validation',
  };

  /**
   * Fetch user profile data
   */
  static async fetchProfile(): Promise<UserOperationResult> {
    try {
      // Add timestamp to prevent caching issues
      const timestamp = Date.now();
      const response = await ApiService.get<UserProfileData>(
        `${this.ENDPOINTS.profile}?t=${timestamp}`,
        undefined,
        { cache: false }
      );

      if (!response.success) {
        return {
          success: false,
          error: response.error || 'Failed to fetch profile',
        };
      }

      return {
        success: true,
        error: null,
        data: response.data,
      };
    } catch (error) {
      console.error('Profile fetch error:', error);
      return {
        success: false,
        error: 'Failed to fetch profile data',
      };
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(profileData: UserProfileUpdate): Promise<UserOperationResult> {
    try {
      // Validate input
      const validatedData = UserProfileUpdateSchema.parse(profileData);
      
      // Add timestamp to prevent caching issues
      const timestamp = Date.now();
      const response = await ApiService.put<UserProfileData>(
        `${this.ENDPOINTS.profile}?t=${timestamp}`,
        validatedData
      );

      if (!response.success) {
        return {
          success: false,
          error: response.error || 'Failed to update profile',
        };
      }

      // Store Cal.com credentials in localStorage if provided
      if (typeof window !== 'undefined' && validatedData.calUsername) {
        const userId = 'current'; // You might want to get actual user ID
        localStorage.setItem(`cal_username_${userId}`, validatedData.calUsername);
        
        if (validatedData.calApiKey) {
          localStorage.setItem(`cal_api_key_${userId}`, validatedData.calApiKey);
        }
        
        if (validatedData.calEventTypeId) {
          localStorage.setItem(`cal_event_type_id_${userId}`, validatedData.calEventTypeId);
        }
      }

      return {
        success: true,
        error: null,
        data: response.data,
      };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      };
    }
  }

  /**
   * Validate Cal.com credentials and fetch event types
   */
  static async validateCalCredentials(credentials: CalCredentials): Promise<CalValidation> {
    try {
      // Validate input
      const validatedCredentials = CalCredentialsSchema.parse(credentials);
      
      console.log('Validating Cal.com credentials:', {
        apiKey: validatedCredentials.apiKey.substring(0, 8) + '...',
        username: validatedCredentials.username,
      });

      // Make direct API call to Cal.com
      const calApiUrl = `https://api.cal.com/v1/event-types?apiKey=${validatedCredentials.apiKey}`;
      
      const response = await fetch(calApiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('Cal.com API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cal.com API error:', errorText);
        
        return {
          isValid: false,
          username: validatedCredentials.username,
          eventTypes: [],
          error: `Cal.com API error: ${response.status} ${response.statusText}`,
        };
      }

      const data = await response.json();
      console.log('Cal.com API response data:', data);

      if (data.event_types && Array.isArray(data.event_types)) {
        return {
          isValid: true,
          username: validatedCredentials.username,
          eventTypes: data.event_types,
          error: null,
        };
      } else {
        return {
          isValid: false,
          username: validatedCredentials.username,
          eventTypes: [],
          error: 'No event types found. Please create an event type in your Cal.com dashboard.',
        };
      }
    } catch (error) {
      console.error('Cal.com validation error:', error);
      return {
        isValid: false,
        username: credentials.username,
        eventTypes: [],
        error: error instanceof Error ? error.message : 'Failed to validate Cal.com credentials',
      };
    }
  }

  /**
   * Get specific Cal.com event type by slug
   */
  static async getCalEventType(
    credentials: CalCredentials, 
    slug: string = '30min'
  ): Promise<CalEventType | null> {
    try {
      const validation = await this.validateCalCredentials(credentials);
      
      if (!validation.isValid || !validation.eventTypes.length) {
        return null;
      }

      // Find event type by slug
      const eventType = validation.eventTypes.find(et => et.slug === slug);
      return eventType || validation.eventTypes[0]; // Return first if slug not found
    } catch (error) {
      console.error('Get Cal.com event type error:', error);
      return null;
    }
  }

  /**
   * Fetch user preferences
   */
  static async fetchPreferences(): Promise<UserOperationResult> {
    try {
      const response = await ApiService.get<UserPreferences>(
        this.ENDPOINTS.preferences,
        undefined,
        { cache: true }
      );

      if (!response.success) {
        // Return default preferences if none exist
        const defaultPreferences: UserPreferences = {
          theme: 'default',
          language: 'nl',
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          privacy: {
            profileVisible: false,
            dataSharing: false,
          },
        };

        return {
          success: true,
          error: null,
          data: defaultPreferences,
        };
      }

      return {
        success: true,
        error: null,
        data: response.data,
      };
    } catch (error) {
      console.error('Preferences fetch error:', error);
      return {
        success: false,
        error: 'Failed to fetch preferences',
      };
    }
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserOperationResult> {
    try {
      const response = await ApiService.put<UserPreferences>(
        this.ENDPOINTS.preferences,
        preferences
      );

      if (!response.success) {
        return {
          success: false,
          error: response.error || 'Failed to update preferences',
        };
      }

      // Clear relevant caches
      ApiService.clearCache('/api/user/preferences');

      return {
        success: true,
        error: null,
        data: response.data,
      };
    } catch (error) {
      console.error('Preferences update error:', error);
      return {
        success: false,
        error: 'Failed to update preferences',
      };
    }
  }

  /**
   * Get Cal.com credentials from localStorage
   */
  static getStoredCalCredentials(userId: string): Partial<CalCredentials> | null {
    if (typeof window === 'undefined') return null;

    try {
      const username = localStorage.getItem(`cal_username_${userId}`);
      const apiKey = localStorage.getItem(`cal_api_key_${userId}`);
      const eventTypeId = localStorage.getItem(`cal_event_type_id_${userId}`);

      if (!username) return null;

      return {
        username,
        apiKey: apiKey || undefined,
        eventTypeId: eventTypeId || undefined,
      };
    } catch (error) {
      console.error('Error reading Cal.com credentials from localStorage:', error);
      return null;
    }
  }

  /**
   * Clear stored Cal.com credentials
   */
  static clearStoredCalCredentials(userId: string): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(`cal_username_${userId}`);
      localStorage.removeItem(`cal_api_key_${userId}`);
      localStorage.removeItem(`cal_event_type_id_${userId}`);
    } catch (error) {
      console.error('Error clearing Cal.com credentials from localStorage:', error);
    }
  }

  /**
   * Delete user account
   */
  static async deleteAccount(): Promise<UserOperationResult> {
    try {
      const response = await ApiService.delete(this.ENDPOINTS.profile);

      if (!response.success) {
        return {
          success: false,
          error: response.error || 'Failed to delete account',
        };
      }

      // Clear all local data
      if (typeof window !== 'undefined') {
        localStorage.clear();
        // Clear cookies
        document.cookie.split(";").forEach(cookie => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });
      }

      return {
        success: true,
        error: null,
      };
    } catch (error) {
      console.error('Account deletion error:', error);
      return {
        success: false,
        error: 'Failed to delete account',
      };
    }
  }
}