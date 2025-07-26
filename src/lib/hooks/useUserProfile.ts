// Custom hook for user profile management
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { UserService } from '@/lib/services/userService';
import type { 
  UserProfileData, 
  UserProfileUpdate, 
  CalCredentials,
  CalEventType 
} from '@/lib/services/types/user';

interface UseUserProfileState {
  profile: UserProfileData | null;
  loading: boolean;
  fetchingProfile: boolean;
  error: string | null;
  retryCount: number;
}

/**
 * Custom hook for user profile operations
 * Replaces direct API calls in components
 */
export function useUserProfile() {
  const [state, setState] = useState<UseUserProfileState>({
    profile: null,
    loading: false,
    fetchingProfile: true,
    error: null,
    retryCount: 0,
  });

  /**
   * Fetch user profile data
   */
  const fetchProfile = useCallback(async () => {
    setState(prev => ({ ...prev, fetchingProfile: true, error: null }));
    
    try {
      const result = await UserService.fetchProfile();
      
      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          profile: result.data,
          fetchingProfile: false,
          error: null,
        }));
      } else {
        // Handle 404 as empty profile for new users
        if (result.error?.includes('404')) {
          setState(prev => ({
            ...prev,
            profile: null,
            fetchingProfile: false,
            error: null,
          }));
        } else {
          setState(prev => ({
            ...prev,
            profile: null,
            fetchingProfile: false,
            error: result.error || 'Failed to fetch profile',
          }));
          toast.error('Kon profielgegevens niet ophalen. Probeer het later opnieuw.');
        }
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setState(prev => ({
        ...prev,
        profile: null,
        fetchingProfile: false,
        error: 'Failed to fetch profile data',
      }));
      toast.error('Kon profielgegevens niet ophalen. Probeer het later opnieuw.');
    }
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (profileData: UserProfileUpdate): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await UserService.updateProfile(profileData);
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          profile: result.data || prev.profile,
          loading: false,
          error: null,
        }));
        toast.success('Profiel succesvol bijgewerkt!');
        return true;
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Failed to update profile',
        }));
        toast.error(`Fout bij het bijwerken van profiel: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to update profile',
      }));
      toast.error('Fout bij het bijwerken van profiel. Probeer het opnieuw.');
      return false;
    }
  }, []);

  /**
   * Validate Cal.com credentials and get event type
   */
  const validateCalCredentials = useCallback(async (
    credentials: CalCredentials
  ): Promise<CalEventType | null> => {
    if (!credentials.apiKey || !credentials.username) {
      if (!credentials.apiKey) {
        toast.error('Voer eerst je Cal.com API sleutel in');
      }
      if (!credentials.username) {
        toast.error('Voer eerst je Cal.com gebruikersnaam in');
      }
      return null;
    }

    try {
      const validation = await UserService.validateCalCredentials(credentials);
      
      if (validation.isValid && validation.eventTypes.length > 0) {
        const eventType = validation.eventTypes[0];
        toast.success('Event Type ID succesvol opgehaald!');
        return eventType;
      } else {
        console.log('No event types found in response:', validation);
        toast.error(
          validation.error || 
          'Geen event types gevonden. Controleer of je een 30 minuten event type hebt aangemaakt in je Cal.com dashboard.'
        );
        return null;
      }
    } catch (error) {
      console.error('Cal.com validation error:', error);
      toast.error(`Fout bij het ophalen van event types: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }, []);

  /**
   * Retry profile fetch
   */
  const retryFetch = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      retryCount: prev.retryCount + 1,
      fetchingProfile: true,
      error: null,
    }));
    toast.info('Opnieuw proberen...');
    fetchProfile();
  }, [fetchProfile]);

  /**
   * Get Cal.com credentials for a user
   */
  const getStoredCalCredentials = useCallback((userId: string) => {
    return UserService.getStoredCalCredentials(userId);
  }, []);

  /**
   * Clear Cal.com credentials for a user
   */
  const clearStoredCalCredentials = useCallback((userId: string) => {
    UserService.clearStoredCalCredentials(userId);
  }, []);

  // Initial profile fetch
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile, state.retryCount]);

  return {
    // State
    profile: state.profile,
    loading: state.loading,
    fetchingProfile: state.fetchingProfile,
    error: state.error,
    
    // Actions
    updateProfile,
    validateCalCredentials,
    retryFetch,
    getStoredCalCredentials,
    clearStoredCalCredentials,
    refreshProfile: fetchProfile,
  };
}