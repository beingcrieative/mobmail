/**
 * Enhanced Browser Detection voor PWA Installatie Optimalisatie 2025
 * Detecteert specifieke browsers en hun PWA capabilities
 */

interface BrowserInfo {
  name: 'chrome' | 'samsung-internet' | 'brave' | 'firefox' | 'safari' | 'edge' | 'unknown';
  version: string;
  platform: 'android' | 'ios' | 'windows' | 'mac' | 'linux' | 'unknown';
  engine: 'blink' | 'webkit' | 'gecko' | 'unknown';
  supports: {
    beforeInstallPrompt: boolean;
    webAPK: boolean;
    ambientBadging: boolean;
    serviceWorker: boolean;
    pushNotifications: boolean;
    standalone: boolean;
  };
  installStrategy: 'automatic' | 'manual' | 'ambient' | 'unsupported';
  quirks: string[];
}

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isSamsung: boolean;
  manufacturer: string;
  model: string;
}

class BrowserDetection {
  private userAgent: string;
  private browserInfo: BrowserInfo | null = null;
  private deviceInfo: DeviceInfo | null = null;

  constructor() {
    this.userAgent = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
    this.detectBrowser();
    this.detectDevice();
  }

  /**
   * Detect browser en zijn PWA capabilities
   */
  private detectBrowser(): void {
    const ua = this.userAgent;
    
    // Samsung Internet detection (meest specifiek eerst)
    if (ua.includes('samsungbrowser')) {
      this.browserInfo = {
        name: 'samsung-internet',
        version: this.extractVersion(ua, /samsungbrowser\/([\d.]+)/),
        platform: this.detectPlatform(),
        engine: 'blink',
        supports: {
          beforeInstallPrompt: false, // Samsung gebruikt ambient badging
          webAPK: this.isSamsungDevice(), // Alleen op Samsung devices
          ambientBadging: true,
          serviceWorker: true,
          pushNotifications: true,
          standalone: this.isSamsungDevice()
        },
        installStrategy: this.isSamsungDevice() ? 'ambient' : 'manual',
        quirks: [
          'Uses ambient badging instead of install prompts',
          'WebAPK only on Samsung Galaxy devices',
          'Different install criteria than Chrome'
        ]
      };
    }
    // Brave browser detection
    else if (ua.includes('brave') || (typeof navigator !== 'undefined' && (navigator as any).brave)) {
      this.browserInfo = {
        name: 'brave',
        version: this.extractVersion(ua, /brave\/([\d.]+)/) || this.extractVersion(ua, /chrome\/([\d.]+)/),
        platform: this.detectPlatform(),
        engine: 'blink',
        supports: {
          beforeInstallPrompt: true,
          webAPK: this.detectPlatform() === 'android',
          ambientBadging: false,
          serviceWorker: true,
          pushNotifications: true,
          standalone: true
        },
        installStrategy: 'automatic',
        quirks: [
          'Similar to Chrome but may have slight timing differences',
          'Privacy-focused, may block some tracking metrics'
        ]
      };
    }
    // Chrome detection (na Brave check omdat Brave ook Chrome in UA heeft)
    else if (ua.includes('chrome') && !ua.includes('edg')) {
      this.browserInfo = {
        name: 'chrome',
        version: this.extractVersion(ua, /chrome\/([\d.]+)/),
        platform: this.detectPlatform(),
        engine: 'blink',
        supports: {
          beforeInstallPrompt: true,
          webAPK: this.detectPlatform() === 'android',
          ambientBadging: false,
          serviceWorker: true,
          pushNotifications: true,
          standalone: true
        },
        installStrategy: 'automatic',
        quirks: [
          'Requires 30 seconds engagement + user interaction',
          'Install prompt can be deferred',
          '90-day cooldown after dismissal'
        ]
      };
    }
    // Edge detection
    else if (ua.includes('edg')) {
      this.browserInfo = {
        name: 'edge',
        version: this.extractVersion(ua, /edg\/([\d.]+)/),
        platform: this.detectPlatform(),
        engine: 'blink',
        supports: {
          beforeInstallPrompt: true,
          webAPK: false,
          ambientBadging: false,
          serviceWorker: true,
          pushNotifications: true,
          standalone: true
        },
        installStrategy: 'automatic',
        quirks: [
          'Similar to Chrome but desktop-focused',
          'May have different install UI'
        ]
      };
    }
    // Safari detection
    else if (ua.includes('safari') && !ua.includes('chrome')) {
      this.browserInfo = {
        name: 'safari',
        version: this.extractVersion(ua, /version\/([\d.]+)/),
        platform: this.detectPlatform(),
        engine: 'webkit',
        supports: {
          beforeInstallPrompt: false,
          webAPK: false,
          ambientBadging: false,
          serviceWorker: true,
          pushNotifications: this.detectPlatform() === 'ios',
          standalone: this.detectPlatform() === 'ios'
        },
        installStrategy: 'manual',
        quirks: [
          'No automatic install prompts',
          'Manual installation via Share > Add to Home Screen',
          'PWA only works in Safari browser on iOS'
        ]
      };
    }
    // Firefox detection
    else if (ua.includes('firefox')) {
      this.browserInfo = {
        name: 'firefox',
        version: this.extractVersion(ua, /firefox\/([\d.]+)/),
        platform: this.detectPlatform(),
        engine: 'gecko',
        supports: {
          beforeInstallPrompt: false,
          webAPK: false,
          ambientBadging: false,
          serviceWorker: true,
          pushNotifications: true,
          standalone: false
        },
        installStrategy: 'unsupported',
        quirks: [
          'Limited PWA support',
          'No install prompts available',
          'Service worker supported but no standalone mode'
        ]
      };
    }
    // Unknown browser
    else {
      this.browserInfo = {
        name: 'unknown',
        version: 'unknown',
        platform: this.detectPlatform(),
        engine: 'unknown',
        supports: {
          beforeInstallPrompt: false,
          webAPK: false,
          ambientBadging: false,
          serviceWorker: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
          pushNotifications: typeof window !== 'undefined' && 'Notification' in window,
          standalone: false
        },
        installStrategy: 'unsupported',
        quirks: [
          'Unknown browser capabilities',
          'Fallback to basic web app experience'
        ]
      };
    }
  }

  /**
   * Detect device information
   */
  private detectDevice(): void {
    const ua = this.userAgent;
    
    this.deviceInfo = {
      isMobile: /android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua),
      isTablet: /ipad|android(?!.*mobile)|tablet/i.test(ua),
      isDesktop: !/android|iphone|ipod|ipad|blackberry|iemobile|opera mini/i.test(ua),
      isSamsung: /samsung|sm-|gt-|sch-/i.test(ua),
      manufacturer: this.detectManufacturer(),
      model: this.detectModel()
    };
  }

  /**
   * Extract version from user agent
   */
  private extractVersion(ua: string, regex: RegExp): string {
    const match = ua.match(regex);
    return match ? match[1] : 'unknown';
  }

  /**
   * Detect platform
   */
  private detectPlatform(): BrowserInfo['platform'] {
    const ua = this.userAgent;
    
    if (/android/i.test(ua)) return 'android';
    if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
    if (/windows/i.test(ua)) return 'windows';
    if (/mac/i.test(ua)) return 'mac';
    if (/linux/i.test(ua)) return 'linux';
    
    return 'unknown';
  }

  /**
   * Check if device is Samsung
   */
  private isSamsungDevice(): boolean {
    const ua = this.userAgent;
    return /samsung|sm-|gt-|sch-/i.test(ua);
  }

  /**
   * Detect device manufacturer
   */
  private detectManufacturer(): string {
    const ua = this.userAgent;
    
    if (/samsung/i.test(ua)) return 'Samsung';
    if (/huawei/i.test(ua)) return 'Huawei';
    if (/xiaomi/i.test(ua)) return 'Xiaomi';
    if (/oppo/i.test(ua)) return 'Oppo';
    if (/vivo/i.test(ua)) return 'Vivo';
    if (/lg/i.test(ua)) return 'LG';
    if (/htc/i.test(ua)) return 'HTC';
    if (/sony/i.test(ua)) return 'Sony';
    if (/motorola|moto/i.test(ua)) return 'Motorola';
    if (/nokia/i.test(ua)) return 'Nokia';
    if (/oneplus/i.test(ua)) return 'OnePlus';
    
    return 'Unknown';
  }

  /**
   * Detect device model (simplified)
   */
  private detectModel(): string {
    const ua = this.userAgent;
    
    // Samsung models
    const samsungMatch = ua.match(/sm-([a-z0-9]+)/i);
    if (samsungMatch) return `SM-${samsungMatch[1].toUpperCase()}`;
    
    // iPhone models
    const iphoneMatch = ua.match(/iphone os ([\d_]+)/i);
    if (iphoneMatch) return `iPhone (iOS ${iphoneMatch[1].replace(/_/g, '.')})`;
    
    return 'Unknown';
  }

  /**
   * Get browser information
   */
  getBrowserInfo(): BrowserInfo {
    return this.browserInfo!;
  }

  /**
   * Get device information
   */
  getDeviceInfo(): DeviceInfo {
    return this.deviceInfo!;
  }

  /**
   * Check if browser supports PWA install prompts
   */
  supportsInstallPrompts(): boolean {
    return this.browserInfo?.supports.beforeInstallPrompt || 
           this.browserInfo?.supports.ambientBadging || false;
  }

  /**
   * Get recommended install strategy for current browser
   */
  getInstallStrategy(): string {
    return this.browserInfo?.installStrategy || 'unsupported';
  }

  /**
   * Get browser-specific installation instructions
   */
  getInstallInstructions(): {
    method: string;
    steps: string[];
    notes: string[];
  } {
    const browser = this.browserInfo!;
    
    switch (browser.name) {
      case 'chrome':
        return {
          method: 'Automatic prompt or manual',
          steps: [
            'Gebruik de app minimaal 30 seconden en klik ergens',
            'Klik op "Installeren" in de popup die verschijnt',
            'Of gebruik menu (⋮) → "App installeren"'
          ],
          notes: [
            'Na afwijzing verschijnt prompt pas na 90 dagen weer',
            'Vereist HTTPS en service worker'
          ]
        };

      case 'samsung-internet':
        return {
          method: 'Ambient badging of menu',
          steps: [
            'Zoek naar installatie-indicator in de adresbalk',
            'Of gebruik menu (⋮) → "Voeg toe aan startscherm"',
            'Volg de WebAPK installatie-instructies'
          ],
          notes: [
            'WebAPK alleen beschikbaar op Samsung Galaxy devices',
            'Gebruikt ambient badging in plaats van popups'
          ]
        };

      case 'brave':
        return {
          method: 'Vergelijkbaar met Chrome',
          steps: [
            'Gebruik de app actief voor minimaal 30 seconden',
            'Klik op "Installeren" in de popup',
            'Of gebruik menu → "App installeren"'
          ],
          notes: [
            'Privacy-instellingen kunnen installatie beïnvloeden',
            'Functioneert grotendeels zoals Chrome'
          ]
        };

      case 'safari':
        return {
          method: 'Handmatige installatie',
          steps: [
            'Tik op het deel-icoon (📤) onderaan',
            'Selecteer "Voeg toe aan beginscherm"',
            'Tik op "Toevoegen" om te bevestigen'
          ],
          notes: [
            'Alleen beschikbaar in Safari browser',
            'Geen automatische prompts beschikbaar'
          ]
        };

      default:
        return {
          method: 'Browser-specifiek',
          steps: [
            'Zoek naar "Installeren" optie in browser menu',
            'Of bookmark de pagina voor snelle toegang'
          ],
          notes: [
            'PWA ondersteuning kan beperkt zijn',
            'Controleer browser documentatie voor specifieke instructies'
          ]
        };
    }
  }

  /**
   * Check for browser-specific quirks that affect PWA behavior
   */
  getQuirks(): string[] {
    return this.browserInfo?.quirks || [];
  }

  /**
   * Get debugging information
   */
  getDebugInfo(): {
    userAgent: string;
    browser: BrowserInfo;
    device: DeviceInfo;
    capabilities: string[];
  } {
    const capabilities = [];
    if (this.browserInfo?.supports.beforeInstallPrompt) capabilities.push('beforeInstallPrompt');
    if (this.browserInfo?.supports.webAPK) capabilities.push('WebAPK');
    if (this.browserInfo?.supports.ambientBadging) capabilities.push('Ambient Badging');
    if (this.browserInfo?.supports.serviceWorker) capabilities.push('Service Worker');
    if (this.browserInfo?.supports.pushNotifications) capabilities.push('Push Notifications');
    if (this.browserInfo?.supports.standalone) capabilities.push('Standalone Mode');

    return {
      userAgent: this.userAgent,
      browser: this.browserInfo!,
      device: this.deviceInfo!,
      capabilities
    };
  }
}

// Export singleton instance
export const browserDetection = new BrowserDetection();

// Export types
export type { BrowserInfo, DeviceInfo };