/**
 * React Hook for PWA Install Prompt Management
 * Provides reactive state management for secure install prompts
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { installPromptManager, type InstallPromptState, type InstallMetrics } from '../pwa/installPrompt';

interface InstallPromptHookState extends InstallPromptState {
  isLoading: boolean;
  error: string | null;
  lastPromptResult: 'accepted' | 'dismissed' | null;
  metrics: InstallMetrics;
  conversionRate: number;
}

export function useInstallPrompt() {
  const [state, setState] = useState<InstallPromptHookState>({
    ...installPromptManager.getState(),
    isLoading: true,
    error: null,
    lastPromptResult: null,
    metrics: installPromptManager.getMetrics(),
    conversionRate: installPromptManager.getConversionRate()
  });

  /**
   * Update state from install prompt manager
   */
  const updateState = useCallback(() => {
    const currentState = installPromptManager.getState();
    const currentMetrics = installPromptManager.getMetrics();
    const currentConversionRate = installPromptManager.getConversionRate();

    setState(prev => ({
      ...prev,
      ...currentState,
      metrics: currentMetrics,
      conversionRate: currentConversionRate,
      isLoading: false
    }));
  }, []);

  /**
   * Setup event listeners
   */
  useEffect(() => {
    // Initialize state
    updateState();

    // Install prompt event handlers
    const handlePromptAvailable = () => {
      updateState();
      setState(prev => ({ ...prev, error: null }));
    };

    const handlePromptShown = () => {
      updateState();
    };

    const handlePromptResult = (data: { outcome: 'accepted' | 'dismissed' }) => {
      updateState();
      setState(prev => ({ 
        ...prev, 
        lastPromptResult: data.outcome,
        error: null
      }));
    };

    const handlePromptError = (data: { error: string }) => {
      updateState();
      setState(prev => ({ 
        ...prev, 
        error: `Install prompt failed: ${data.error}`
      }));
    };

    const handleAppInstalled = (data: { method: string }) => {
      updateState();
      setState(prev => ({ 
        ...prev, 
        error: null,
        lastPromptResult: null
      }));
      console.log(`✅ App installed via ${data.method}`);
    };

    const handleDisplayModeChanged = (data: { standalone: boolean }) => {
      updateState();
      if (data.standalone) {
        console.log('📱 App is now running in standalone mode');
      }
    };

    // Register event listeners
    installPromptManager.on('prompt-available', handlePromptAvailable);
    installPromptManager.on('prompt-shown', handlePromptShown);
    installPromptManager.on('prompt-result', handlePromptResult);
    installPromptManager.on('prompt-error', handlePromptError);
    installPromptManager.on('app-installed', handleAppInstalled);
    installPromptManager.on('display-mode-changed', handleDisplayModeChanged);

    // Cleanup listeners
    return () => {
      installPromptManager.off('prompt-available', handlePromptAvailable);
      installPromptManager.off('prompt-shown', handlePromptShown);
      installPromptManager.off('prompt-result', handlePromptResult);
      installPromptManager.off('prompt-error', handlePromptError);
      installPromptManager.off('app-installed', handleAppInstalled);
      installPromptManager.off('display-mode-changed', handleDisplayModeChanged);
    };
  }, [updateState]);

  /**
   * Show install prompt
   */
  const showInstallPrompt = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      const result = await installPromptManager.showInstallPrompt();
      
      if (!result.success) {
        setState(prev => ({ 
          ...prev, 
          error: result.error || 'Failed to show install prompt'
        }));
        return false;
      }

      return result.outcome === 'accepted';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ 
        ...prev, 
        error: `Install prompt error: ${errorMessage}`
      }));
      return false;
    }
  }, []);

  /**
   * Get platform-specific install instructions
   */
  const getInstallInstructions = useCallback(() => {
    return installPromptManager.getInstallInstructions();
  }, []);

  /**
   * Check if install hint should be shown
   */
  const shouldShowInstallHint = useCallback((): boolean => {
    return installPromptManager.shouldShowInstallHint();
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Clear last prompt result
   */
  const clearLastPromptResult = useCallback(() => {
    setState(prev => ({ ...prev, lastPromptResult: null }));
  }, []);

  /**
   * Reset metrics (for testing/admin use)
   */
  const resetMetrics = useCallback(() => {
    installPromptManager.resetMetrics();
    updateState();
  }, [updateState]);

  /**
   * Get formatted install status message
   */
  const getInstallStatusMessage = useCallback((): string => {
    if (state.isInstalled || state.isStandalone) {
      return 'VoicemailAI is geïnstalleerd als app';
    }
    
    if (state.isInstallable && state.canPrompt) {
      return 'VoicemailAI kan worden geïnstalleerd als app';
    }
    
    if (state.isInstallable && !state.canPrompt) {
      return 'Installatie beschikbaar (rate limited)';
    }
    
    if (shouldShowInstallHint()) {
      return 'Installeer VoicemailAI voor de beste ervaring';
    }
    
    return 'Browser ondersteunt geen app-installatie';
  }, [state, shouldShowInstallHint]);

  /**
   * Get install button text based on state
   */
  const getInstallButtonText = useCallback((): string => {
    if (state.isInstalled || state.isStandalone) {
      return 'App geïnstalleerd';
    }
    
    if (state.isInstallable && state.canPrompt) {
      return 'Installeer App';
    }
    
    return 'Installatie-instructies';
  }, [state]);

  /**
   * Check if install button should be shown
   */
  const shouldShowInstallButton = useCallback((): boolean => {
    return !state.isInstalled && 
           !state.isStandalone && 
           (state.isInstallable || shouldShowInstallHint());
  }, [state, shouldShowInstallHint]);

  /**
   * Get install progress percentage (for UI indicators)
   */
  const getInstallProgress = useCallback((): number => {
    if (state.isInstalled || state.isStandalone) return 100;
    if (state.isInstallable) return 75;
    if (shouldShowInstallHint()) return 50;
    return 0;
  }, [state, shouldShowInstallHint]);

  /**
   * Format time since timestamp
   */
  const formatTimeSince = useCallback((timestamp: number): string => {
    if (!timestamp) return 'Never';
    
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  }, []);

  /**
   * Format metrics for display
   */
  const getFormattedMetrics = useCallback(() => {
    const { metrics } = state;
    return {
      totalPrompts: metrics.promptShown,
      acceptanceRate: state.conversionRate.toFixed(1) + '%',
      installsCompleted: metrics.installCompleted,
      lastInstallMethod: metrics.installMethod === 'unknown' ? 'Not installed' : 
                         metrics.installMethod === 'prompt' ? 'Via prompt' : 'Manual',
      timeSinceLastPrompt: metrics.lastPromptTime ? 
        formatTimeSince(metrics.lastPromptTime) : 'Never'
    };
  }, [state, formatTimeSince]);

  return {
    // State
    ...state,
    
    // Actions
    showInstallPrompt,
    clearError,
    clearLastPromptResult,
    resetMetrics,
    
    // Utilities
    getInstallInstructions,
    shouldShowInstallHint,
    getInstallStatusMessage,
    getInstallButtonText,
    shouldShowInstallButton,
    getInstallProgress,
    getFormattedMetrics,
    
    // Computed values
    isInstallReady: state.isInstallable && state.canPrompt,
    isAppMode: state.isInstalled || state.isStandalone,
    needsManualInstall: shouldShowInstallHint() && !state.isInstallable,
    hasMetrics: state.metrics.promptShown > 0
  };
}