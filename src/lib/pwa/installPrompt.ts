/**
 * Secure PWA Install Prompt Manager for VoicemailAI - 2025 Enhanced
 * Handles secure install prompts with browser-specific optimizations
 */

import { browserDetection, type BrowserInfo } from './browserDetection';
import { engagementTracker } from './engagementTracker';

interface InstallPromptState {
  isInstallable: boolean;
  isInstalled: boolean;
  canPrompt: boolean;
  isStandalone: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
  browserEngine: 'webkit' | 'blink' | 'gecko' | 'unknown';
  browserInfo: BrowserInfo;
  isEngagementEligible: boolean;
  installStrategy: 'automatic' | 'manual' | 'ambient' | 'unsupported';
}

interface InstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface InstallMetrics {
  promptShown: number;
  promptAccepted: number;
  promptDismissed: number;
  installCompleted: number;
  lastPromptTime: number;
  installMethod: 'prompt' | 'manual' | 'unknown';
}

class InstallPromptManager {
  private deferredPrompt: InstallPromptEvent | null = null;
  private state: InstallPromptState;
  private metrics: InstallMetrics;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private promptCooldownMs = 24 * 60 * 60 * 1000; // 24 hours
  private maxPromptsPerWeek = 2;

  constructor() {
    this.state = this.detectPlatformState();
    this.metrics = this.loadMetrics();
    this.setupEventListeners();
  }

  /**
   * Detect platform and browser capabilities with 2025 enhancements
   */
  private detectPlatformState(): InstallPromptState {
    const isStandalone = this.isRunningStandalone();
    const browserInfo = browserDetection.getBrowserInfo();
    const deviceInfo = browserDetection.getDeviceInfo();
    
    // Map browser detection to legacy platform format
    let platform: InstallPromptState['platform'] = 'unknown';
    if (browserInfo.platform === 'ios') platform = 'ios';
    else if (browserInfo.platform === 'android') platform = 'android';
    else if (['windows', 'mac', 'linux'].includes(browserInfo.platform)) platform = 'desktop';

    // Map browser engine
    let browserEngine: InstallPromptState['browserEngine'] = browserInfo.engine;

    return {
      isInstallable: false,
      isInstalled: isStandalone,
      canPrompt: false,
      isStandalone,
      platform,
      browserEngine,
      browserInfo,
      isEngagementEligible: false,
      installStrategy: browserInfo.installStrategy
    };
  }

  /**
   * Check if app is running in standalone mode
   */
  private isRunningStandalone(): boolean {
    // Only check on client-side
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return false;
    }

    // Check for various standalone indicators
    const standaloneChecks = [
      window.matchMedia('(display-mode: standalone)').matches,
      (window.navigator as any).standalone === true, // iOS Safari
      document.referrer.includes('android-app://'), // Android TWA
      window.location.search.includes('utm_source=web_app_manifest')
    ];

    return standaloneChecks.some(check => check);
  }

  /**
   * Load install metrics from localStorage
   */
  private loadMetrics(): InstallMetrics {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('vmai_install_metrics');
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } catch (error) {
      console.warn('Failed to load install metrics:', error);
    }

    return {
      promptShown: 0,
      promptAccepted: 0,
      promptDismissed: 0,
      installCompleted: 0,
      lastPromptTime: 0,
      installMethod: 'unknown'
    };
  }

  /**
   * Save install metrics to localStorage
   */
  private saveMetrics(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('vmai_install_metrics', JSON.stringify(this.metrics));
      }
    } catch (error) {
      console.warn('Failed to save install metrics:', error);
    }
  }

  /**
   * Setup event listeners for install events
   */
  private setupEventListeners(): void {
    // Only setup listeners on client-side
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    // Listen for beforeinstallprompt event (Chrome/Edge)
    window.addEventListener('beforeinstallprompt', (event) => {
      console.log('📱 Install prompt available');
      
      // Prevent the mini-infobar from appearing
      event.preventDefault();
      
      this.deferredPrompt = event as InstallPromptEvent;
      this.state.isInstallable = true;
      this.state.canPrompt = this.canShowPrompt();
      
      this.emit('prompt-available', { state: this.state });
    });

    // Force trigger availability check after DOM load
    const checkForPWASupport = () => {
      // If we haven't received beforeinstallprompt but we're on a PWA-capable browser
      if (!this.deferredPrompt && this.state.browserInfo.supports.webAppManifest) {
        console.log('🔄 Forcing PWA prompt availability check...');
        
        // Simulate prompt availability for testing
        if (process.env.NODE_ENV === 'development') {
          setTimeout(() => {
            if (!this.deferredPrompt) {
              console.log('⚡ Development: Simulating install prompt availability');
              this.state.isInstallable = true;
              this.state.canPrompt = this.canShowPrompt();
              this.emit('prompt-available', { state: this.state });
            }
          }, 2000);
        }
      }
    };

    // Check support after page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkForPWASupport);
    } else {
      setTimeout(checkForPWASupport, 1000);
    }

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA installed successfully');
      
      this.state.isInstalled = true;
      this.state.canPrompt = false;
      this.metrics.installCompleted++;
      this.metrics.installMethod = this.deferredPrompt ? 'prompt' : 'manual';
      
      this.saveMetrics();
      this.emit('app-installed', { 
        state: this.state,
        method: this.metrics.installMethod
      });
      
      // Clear the deferred prompt
      this.deferredPrompt = null;
    });

    // Listen for display mode changes
    const displayModeQuery = window.matchMedia('(display-mode: standalone)');
    displayModeQuery.addListener((e) => {
      this.state.isStandalone = e.matches;
      this.state.isInstalled = e.matches;
      
      this.emit('display-mode-changed', { 
        standalone: e.matches,
        state: this.state
      });
    });

    // Listen for visibility changes to detect manual installs
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isRunningStandalone() && !this.state.isInstalled) {
        this.state.isInstalled = true;
        this.state.isStandalone = true;
        this.metrics.installCompleted++;
        this.metrics.installMethod = 'manual';
        
        this.saveMetrics();
        this.emit('app-installed', { 
          state: this.state,
          method: 'manual'
        });
      }
    });
  }

  /**
   * Check if we can show install prompt based on rate limiting and engagement
   */
  private canShowPrompt(): boolean {
    const now = Date.now();
    const timeSinceLastPrompt = now - this.metrics.lastPromptTime;
    
    // Check cooldown period
    if (timeSinceLastPrompt < this.promptCooldownMs) {
      return false;
    }

    // Check weekly limit
    const recentPrompts = this.metrics.promptShown;
    if (recentPrompts >= this.maxPromptsPerWeek) {
      return false;
    }

    // Check browser-specific requirements
    const browserInfo = this.state.browserInfo;
    
    // Voor Chrome/Brave: check engagement requirements
    if (['chrome', 'brave'].includes(browserInfo.name)) {
      const isEngagementEligible = engagementTracker.isEligibleForInstallPrompt();
      this.state.isEngagementEligible = isEngagementEligible;
      
      if (!isEngagementEligible) {
        console.log('⏰ Chrome/Brave: Waiting for 30s engagement + interaction');
        return false;
      }
    }

    // Voor Samsung Internet: check voor ambient badging conditions
    if (browserInfo.name === 'samsung-internet') {
      // Samsung heeft andere criteria - minder strikt dan Chrome
      const deviceInfo = browserDetection.getDeviceInfo();
      if (!deviceInfo.isSamsung) {
        console.log('⚠️ Samsung Internet: WebAPK not available on non-Samsung devices');
        return false;
      }
    }

    return true;
  }

  /**
   * Show install prompt with security validation
   */
  async showInstallPrompt(): Promise<{
    success: boolean;
    outcome?: 'accepted' | 'dismissed';
    error?: string;
  }> {
    try {
      // Security checks
      if (!this.state.isInstallable) {
        return {
          success: false,
          error: 'App is not installable'
        };
      }

      if (!this.state.canPrompt) {
        return {
          success: false,
          error: 'Cannot show prompt due to rate limiting'
        };
      }

      // Update metrics before showing prompt
      this.metrics.promptShown++;
      this.metrics.lastPromptTime = Date.now();
      this.state.canPrompt = false;
      
      this.emit('prompt-shown', { state: this.state });

      // If we have native prompt, use it
      if (this.deferredPrompt) {
        // Show the prompt
        await this.deferredPrompt.prompt();
        
        // Wait for user choice
        const choiceResult = await this.deferredPrompt.userChoice;
        
        // Update metrics based on choice
        if (choiceResult.outcome === 'accepted') {
          this.metrics.promptAccepted++;
          console.log('✅ User accepted install prompt');
        } else {
          this.metrics.promptDismissed++;
          console.log('❌ User dismissed install prompt');
        }
        
        this.saveMetrics();
        this.emit('prompt-result', { 
          outcome: choiceResult.outcome,
          platform: choiceResult.platform,
          state: this.state
        });
        
        // Clear the deferred prompt
        this.deferredPrompt = null;
        this.state.isInstallable = false;
        
        return {
          success: true,
          outcome: choiceResult.outcome
        };
      } else {
        // Fallback for browsers without native prompt
        console.log('🔄 No native prompt available, using fallback installation');
        
        // Simulate user acceptance for manual installation
        this.metrics.promptAccepted++;
        this.saveMetrics();
        
        // Show manual installation instructions
        this.emit('prompt-result', { 
          outcome: 'accepted' as const,
          platform: this.state.platform,
          state: this.state,
          manual: true
        });
        
        return {
          success: true,
          outcome: 'accepted'
        };
      }
      
    } catch (error) {
      console.error('❌ Failed to show install prompt:', error);
      
      this.emit('prompt-error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        state: this.state
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get browser-specific install instructions with 2025 optimizations
   */
  getInstallInstructions(): {
    platform: string;
    canUsePrompt: boolean;
    instructions: string[];
    iconName?: string;
    browserSpecific: boolean;
    quirks: string[];
  } {
    const { browserInfo, canPrompt, isInstallable, isEngagementEligible } = this.state;
    const canUsePrompt = canPrompt && isInstallable;
    const browserInstructions = browserDetection.getInstallInstructions();

    // Return enhanced instructions based on detected browser
    return {
      platform: `${browserInfo.name} (${browserInfo.platform})`,
      canUsePrompt: browserInfo.supports.beforeInstallPrompt && canUsePrompt,
      instructions: browserInstructions.steps,
      iconName: this.getIconForBrowser(browserInfo.name),
      browserSpecific: true,
      quirks: [
        ...browserInstructions.notes,
        ...browserDetection.getQuirks(),
        ...(isEngagementEligible ? [] : ['⏰ Wacht op 30 seconden engagement + interactie'])
      ]
    };
  }

  /**
   * Get appropriate icon for browser
   */
  private getIconForBrowser(browserName: string): string {
    switch (browserName) {
      case 'samsung-internet': return 'samsung';
      case 'brave': return 'shield';
      case 'chrome': return 'chrome';
      case 'safari': return 'share';
      case 'firefox': return 'firefox';
      case 'edge': return 'edge';
      default: return 'more_vert';
    }
  }

  /**
   * Check if user should be shown install hint
   */
  shouldShowInstallHint(): boolean {
    // Don't show if already installed
    if (this.state.isInstalled || this.state.isStandalone) {
      return false;
    }

    // Show hint if installable but can't prompt due to rate limiting
    if (this.state.isInstallable && !this.state.canPrompt) {
      return true;
    }

    // Show hint on mobile platforms that don't support prompt API
    if (this.state.platform === 'ios' || 
        (this.state.platform === 'android' && !this.state.isInstallable)) {
      return true;
    }

    return false;
  }

  /**
   * Get current state
   */
  getState(): InstallPromptState {
    return { ...this.state };
  }

  /**
   * Get install metrics
   */
  getMetrics(): InstallMetrics {
    return { ...this.metrics };
  }

  /**
   * Get install conversion rate
   */
  getConversionRate(): number {
    if (this.metrics.promptShown === 0) return 0;
    return (this.metrics.promptAccepted / this.metrics.promptShown) * 100;
  }

  /**
   * Reset install metrics (for testing)
   */
  resetMetrics(): void {
    this.metrics = {
      promptShown: 0,
      promptAccepted: 0,
      promptDismissed: 0,
      installCompleted: 0,
      lastPromptTime: 0,
      installMethod: 'unknown'
    };
    this.saveMetrics();
    console.log('🔄 Install metrics reset');
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
          console.error(`Install Prompt: Error in ${event} listener:`, error);
        }
      });
    }
  }
}

// Export singleton instance
export const installPromptManager = new InstallPromptManager();

// Export types
export type { InstallPromptState, InstallPromptEvent, InstallMetrics };