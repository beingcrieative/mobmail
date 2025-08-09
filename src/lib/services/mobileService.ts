// Mobile service for managing mobile-specific configuration
import type { ApiResponse } from './types/api';

// Mobile configuration types
export interface MobileConfig {
  statusBarStyle: 'light' | 'dark' | 'transparent';
  hideNavigation: boolean;
  enableSafeArea: boolean;
  orientationLock: 'portrait' | 'landscape' | 'auto';
  fullscreen: boolean;
  disableZoom: boolean;
  enablePullToRefresh: boolean;
  customMetaTags: Record<string, string>;
}

// PWA configuration
export interface PWAConfig {
  enabled: boolean;
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  orientation: 'portrait' | 'landscape' | 'any';
  scope: string;
  startUrl: string;
}

// Mobile service result
export interface MobileServiceResult {
  success: boolean;
  error?: string;
  applied?: string[];
}

/**
 * Mobile service class
 * Handles mobile-specific layout and PWA configuration
 */
export class MobileService {
  private static isConfigured = false;
  private static currentConfig: MobileConfig | null = null;
  private static appliedStyles: HTMLStyleElement | null = null;

  // Default mobile configuration
  private static readonly DEFAULT_CONFIG: MobileConfig = {
    statusBarStyle: 'light',
    hideNavigation: true,
    enableSafeArea: true,
    orientationLock: 'portrait',
    fullscreen: false,
    disableZoom: true,
    enablePullToRefresh: false,
    customMetaTags: {},
  };

  /**
   * Apply mobile configuration with safe CSS generation
   */
  static applyMobileConfiguration(config?: Partial<MobileConfig>): MobileServiceResult {
    if (typeof document === 'undefined') {
      return { success: false, error: 'Document not available (SSR environment)' };
    }

    try {
      const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
      this.currentConfig = finalConfig;

      // Remove any existing mobile styles
      this.removeMobileConfiguration();

      // Apply meta tags
      this.applyMetaTags(finalConfig);

      // Apply CSS styles
      this.applyCSSStyles(finalConfig);

      // Apply body classes
      this.applyBodyClasses(finalConfig);

      this.isConfigured = true;

      return {
        success: true,
        applied: [
          'meta-tags',
          'css-styles',
          'body-classes',
          'safe-area-insets',
        ],
      };
    } catch (error) {
      console.error('Mobile configuration failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Configuration failed',
      };
    }
  }

  /**
   * Remove mobile configuration and restore defaults
   */
  static removeMobileConfiguration(): MobileServiceResult {
    if (typeof document === 'undefined') {
      return { success: false, error: 'Document not available (SSR environment)' };
    }

    try {
      // Remove custom styles
      if (this.appliedStyles && this.appliedStyles.parentNode) {
        this.appliedStyles.parentNode.removeChild(this.appliedStyles);
        this.appliedStyles = null;
      }

      // Remove body classes
      document.body.classList.remove('mobile-native');

      // Remove custom meta tags (keep original ones)
      const metaTags = [
        'viewport',
        'apple-mobile-web-app-capable',
        'apple-mobile-web-app-status-bar-style',
        'mobile-web-app-capable',
        'theme-color',
      ];

      metaTags.forEach(name => {
        const existingTag = document.querySelector(`meta[name="${name}"]`);
        if (existingTag && existingTag.hasAttribute('data-mobile-service')) {
          existingTag.remove();
        }
      });

      this.isConfigured = false;
      this.currentConfig = null;

      return { success: true };
    } catch (error) {
      console.error('Mobile configuration removal failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Removal failed',
      };
    }
  }

  /**
   * Update meta tags for mobile optimization
   */
  static updateMetaTags(config: Partial<MobileConfig>): MobileServiceResult {
    if (typeof document === 'undefined') {
      return { success: false, error: 'Document not available (SSR environment)' };
    }

    try {
      const finalConfig = { ...this.DEFAULT_CONFIG, ...this.currentConfig, ...config };
      this.applyMetaTags(finalConfig);
      
      return { success: true };
    } catch (error) {
      console.error('Meta tags update failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Meta tags update failed',
      };
    }
  }

  /**
   * Get current mobile configuration
   */
  static getCurrentConfig(): MobileConfig | null {
    return this.currentConfig;
  }

  /**
   * Check if mobile configuration is active
   */
  static isActive(): boolean {
    return this.isConfigured;
  }

  /**
   * Private: Apply meta tags
   */
  private static applyMetaTags(config: MobileConfig): void {
    const head = document.head;

    // Viewport meta tag
    this.updateOrCreateMetaTag('viewport', 
      config.disableZoom 
        ? 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        : 'width=device-width, initial-scale=1.0'
    );

    // Apple mobile web app
    this.updateOrCreateMetaTag('apple-mobile-web-app-capable', 'yes');
    this.updateOrCreateMetaTag('apple-mobile-web-app-status-bar-style', config.statusBarStyle);

    // Mobile web app
    this.updateOrCreateMetaTag('mobile-web-app-capable', 'yes');

    // Theme color
    this.updateOrCreateMetaTag('theme-color', '#2563E8');

    // Custom meta tags
    Object.entries(config.customMetaTags).forEach(([name, content]) => {
      this.updateOrCreateMetaTag(name, content);
    });

    // Apple touch icon (if not exists)
    if (!document.querySelector('link[rel="apple-touch-icon"]')) {
      const iconLink = document.createElement('link');
      iconLink.rel = 'apple-touch-icon';
      iconLink.href = '/icon-192x192.png';
      iconLink.setAttribute('data-mobile-service', 'true');
      head.appendChild(iconLink);
    }
  }

  /**
   * Private: Apply CSS styles using theme variables
   */
  private static applyCSSStyles(config: MobileConfig): void {
    const style = document.createElement('style');
    style.setAttribute('data-mobile-service', 'true');
    style.textContent = this.generateMobileCSS(config);
    document.head.appendChild(style);
    this.appliedStyles = style;
  }

  /**
   * Private: Apply body classes
   */
  private static applyBodyClasses(config: MobileConfig): void {
    document.body.classList.add('mobile-native');
    
    if (config.fullscreen) {
      document.body.classList.add('mobile-fullscreen');
    }
    
    if (config.hideNavigation) {
      document.body.classList.add('mobile-hide-navigation');
    }
  }

  /**
   * Private: Generate mobile CSS using CSS custom properties
   */
  private static generateMobileCSS(config: MobileConfig): string {
    return `
      /* Mobile-native styles - Theme aware */
      body.mobile-native {
        height: 100dvh;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        -webkit-user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
        touch-action: manipulation;
        overscroll-behavior: none;
        -webkit-overscroll-behavior: none;
        background: var(--color-background, #F8FAFB);
        color: var(--color-text-primary, #004D40);
        font-family: var(--font-family-primary, 'Inter', -apple-system, sans-serif);
      }
      
      /* Hide root layout elements for mobile */
      ${config.hideNavigation ? `
      body.mobile-native header,
      body.mobile-native nav,
      body.mobile-native footer,
      body.mobile-native .navbar,
      body.mobile-native .footer {
        display: none !important;
      }` : ''}
      
      /* Mobile app container - Theme aware */
      .mobile-app-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        height: 100vh;
        height: 100dvh;
        background: var(--color-background, #F8FAFB);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        z-index: 1000;
      }
      
      /* Status bar safe area - Theme aware */
      .mobile-status-bar {
        ${config.enableSafeArea ? 'height: env(safe-area-inset-top, 44px);' : 'height: 44px;'}
        background: var(--color-surface, #FFFFFF);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 ${config.enableSafeArea ? 'env(safe-area-inset-left, 16px)' : '16px'} 0 ${config.enableSafeArea ? 'env(safe-area-inset-right, 16px)' : '16px'};
        border-bottom: 1px solid var(--card-border, rgba(0, 0, 0, 0.08));
        color: var(--color-text-primary, #004D40);
      }
      
      /* Main content area - Theme aware */
      .mobile-content {
        flex: 1;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        padding-bottom: ${config.enableSafeArea ? 'env(safe-area-inset-bottom, 80px)' : '80px'};
        background: transparent;
        position: relative;
      }
      
      /* Bottom navigation safe area - Theme aware */
      .mobile-bottom-nav {
        ${config.enableSafeArea ? 'padding-bottom: env(safe-area-inset-bottom, 0);' : ''}
        background: var(--color-surface, #FFFFFF);
        border-top: 1px solid var(--card-border, rgba(0, 0, 0, 0.08));
      }
      
      /* Disable zoom on inputs */
      ${config.disableZoom ? `
      body.mobile-native input,
      body.mobile-native textarea,
      body.mobile-native select {
        font-size: 16px !important;
      }` : ''}
      
      /* Native-feeling buttons - Theme aware */
      body.mobile-native button {
        -webkit-appearance: none;
        appearance: none;
        cursor: pointer;
        outline: none;
        color: inherit;
      }
      
      /* Smooth scrolling */
      body.mobile-native * {
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
      }
      
      /* Pull to refresh */
      ${config.enablePullToRefresh ? `
      body.mobile-native {
        overscroll-behavior-y: auto;
      }` : ''}
      
      /* Fullscreen mode */
      ${config.fullscreen ? `
      .mobile-status-bar {
        display: none;
      }
      
      .mobile-app-container {
        top: 0;
      }` : ''}
      
      /* Safe area CSS custom properties */
      :root {
        --mobile-safe-area-top: ${config.enableSafeArea ? 'env(safe-area-inset-top, 0px)' : '0px'};
        --mobile-safe-area-bottom: ${config.enableSafeArea ? 'env(safe-area-inset-bottom, 0px)' : '0px'};
        --mobile-safe-area-left: ${config.enableSafeArea ? 'env(safe-area-inset-left, 0px)' : '0px'};
        --mobile-safe-area-right: ${config.enableSafeArea ? 'env(safe-area-inset-right, 0px)' : '0px'};
        --mobile-nav-height: 80px;
        --mobile-touch-target: 48px;
      }
    `;
  }

  /**
   * Private: Update or create meta tag
   */
  private static updateOrCreateMetaTag(name: string, content: string): void {
    let metaTag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
    
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = name;
      document.head.appendChild(metaTag);
    }
    
    metaTag.content = content;
    metaTag.setAttribute('data-mobile-service', 'true');
  }

  /**
   * Setup PWA configuration
   */
  static setupPWA(config: PWAConfig): MobileServiceResult {
    if (typeof document === 'undefined') {
      return { success: false, error: 'Document not available (SSR environment)' };
    }

    try {
      // Add PWA meta tags
      this.updateOrCreateMetaTag('application-name', config.shortName);
      this.updateOrCreateMetaTag('theme-color', config.themeColor);
      this.updateOrCreateMetaTag('background-color', config.backgroundColor);

      // Add manifest link if not exists
      if (!document.querySelector('link[rel="manifest"]')) {
        const manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        manifestLink.href = '/manifest.json';
        manifestLink.setAttribute('data-mobile-service', 'true');
        document.head.appendChild(manifestLink);
      }

      return { success: true };
    } catch (error) {
      console.error('PWA setup failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PWA setup failed',
      };
    }
  }

  /**
   * Detect if device is mobile
   */
  static isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false;
    
    const userAgent = window.navigator.userAgent;
    const mobileRegex = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    
    return mobileRegex.test(userAgent) || window.innerWidth <= 768;
  }

  /**
   * Get device orientation
   */
  static getOrientation(): 'portrait' | 'landscape' {
    if (typeof window === 'undefined') return 'portrait';
    
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }

  /**
   * Get safe area insets (if available)
   */
  static getSafeAreaInsets(): { top: number; bottom: number; left: number; right: number } {
    if (typeof window === 'undefined') {
      return { top: 0, bottom: 0, left: 0, right: 0 };
    }

    const computedStyle = getComputedStyle(document.documentElement);
    
    return {
      top: parseInt(computedStyle.getPropertyValue('--mobile-safe-area-top').replace('px', '')) || 0,
      bottom: parseInt(computedStyle.getPropertyValue('--mobile-safe-area-bottom').replace('px', '')) || 0,
      left: parseInt(computedStyle.getPropertyValue('--mobile-safe-area-left').replace('px', '')) || 0,
      right: parseInt(computedStyle.getPropertyValue('--mobile-safe-area-right').replace('px', '')) || 0,
    };
  }
}