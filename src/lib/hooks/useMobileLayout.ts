// Custom hook for mobile layout management
import { useEffect, useState, useCallback } from 'react';
import { MobileService } from '@/lib/services/mobileService';
import type { MobileConfig, PWAConfig, MobileServiceResult } from '@/lib/services/mobileService';

interface UseMobileLayoutState {
  isActive: boolean;
  isMobileDevice: boolean;
  orientation: 'portrait' | 'landscape';
  safeAreaInsets: { top: number; bottom: number; left: number; right: number };
  error: string | null;
}

/**
 * Custom hook for mobile layout management
 * Replaces direct mobile configuration in components
 */
export function useMobileLayout(autoDetect: boolean = true) {
  const [state, setState] = useState<UseMobileLayoutState>({
    isActive: false,
    isMobileDevice: false,
    orientation: 'portrait',
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
    error: null,
  });

  /**
   * Apply mobile configuration
   */
  const applyMobileConfig = useCallback(async (config?: Partial<MobileConfig>): Promise<boolean> => {
    const result = MobileService.applyMobileConfiguration(config);
    
    if (result.success) {
      setState(prev => ({
        ...prev,
        isActive: true,
        error: null,
      }));
      return true;
    } else {
      setState(prev => ({
        ...prev,
        error: result.error || 'Failed to apply mobile configuration',
      }));
      console.error('Mobile configuration failed:', result.error);
      return false;
    }
  }, []);

  /**
   * Remove mobile configuration
   */
  const removeMobileConfig = useCallback(async (): Promise<boolean> => {
    const result = MobileService.removeMobileConfiguration();
    
    if (result.success) {
      setState(prev => ({
        ...prev,
        isActive: false,
        error: null,
      }));
      return true;
    } else {
      setState(prev => ({
        ...prev,
        error: result.error || 'Failed to remove mobile configuration',
      }));
      console.error('Mobile configuration removal failed:', result.error);
      return false;
    }
  }, []);

  /**
   * Update meta tags
   */
  const updateMetaTags = useCallback(async (config: Partial<MobileConfig>): Promise<boolean> => {
    const result = MobileService.updateMetaTags(config);
    
    if (result.success) {
      setState(prev => ({ ...prev, error: null }));
      return true;
    } else {
      setState(prev => ({
        ...prev,
        error: result.error || 'Failed to update meta tags',
      }));
      console.error('Meta tags update failed:', result.error);
      return false;
    }
  }, []);

  /**
   * Setup PWA
   */
  const setupPWA = useCallback(async (config: PWAConfig): Promise<boolean> => {
    const result = MobileService.setupPWA(config);
    
    if (result.success) {
      setState(prev => ({ ...prev, error: null }));
      return true;
    } else {
      setState(prev => ({
        ...prev,
        error: result.error || 'Failed to setup PWA',
      }));
      console.error('PWA setup failed:', result.error);
      return false;
    }
  }, []);

  /**
   * Get current mobile configuration
   */
  const getCurrentConfig = useCallback((): MobileConfig | null => {
    return MobileService.getCurrentConfig();
  }, []);

  /**
   * Update device information
   */
  const updateDeviceInfo = useCallback(() => {
    setState(prev => ({
      ...prev,
      isMobileDevice: MobileService.isMobileDevice(),
      orientation: MobileService.getOrientation(),
      safeAreaInsets: MobileService.getSafeAreaInsets(),
      isActive: MobileService.isActive(),
    }));
  }, []);

  // Initialize device information
  useEffect(() => {
    updateDeviceInfo();
  }, [updateDeviceInfo]);

  // Auto-detect mobile device and apply configuration
  useEffect(() => {
    if (autoDetect && typeof window !== 'undefined') {
      const isMobile = MobileService.isMobileDevice();
      
      if (isMobile && !MobileService.isActive()) {
        // Apply default mobile configuration for mobile devices
        applyMobileConfig();
      }
    }
  }, [autoDetect, applyMobileConfig]);

  // Listen for orientation changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOrientationChange = () => {
      updateDeviceInfo();
    };

    const handleResize = () => {
      updateDeviceInfo();
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateDeviceInfo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.isActive) {
        MobileService.removeMobileConfiguration();
      }
    };
  }, []);

  return {
    // State
    isActive: state.isActive,
    isMobileDevice: state.isMobileDevice,
    orientation: state.orientation,
    safeAreaInsets: state.safeAreaInsets,
    error: state.error,
    
    // Actions
    applyMobileConfig,
    removeMobileConfig,
    updateMetaTags,
    setupPWA,
    getCurrentConfig,
    updateDeviceInfo,
  };
}