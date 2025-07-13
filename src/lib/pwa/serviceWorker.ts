/**
 * Service Worker registration and management for VoicemailAI PWA
 * Handles secure registration, updates, and error recovery
 */

interface ServiceWorkerStatus {
  supported: boolean;
  registered: boolean;
  installing: boolean;
  waiting: boolean;
  active: boolean;
  error?: string;
}

interface ServiceWorkerStats {
  cacheSize: number;
  cacheName: string;
  version: string;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  /**
   * Check if service worker is supported
   */
  isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  /**
   * Register service worker with security checks
   */
  async register(): Promise<ServiceWorkerStatus> {
    if (!this.isSupported()) {
      return {
        supported: false,
        registered: false,
        installing: false,
        waiting: false,
        active: false,
        error: 'Service Workers not supported'
      };
    }

    try {
      console.log('SW Manager: Registering service worker...');

      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        type: 'classic',
        updateViaCache: 'none' // Always check for updates
      });

      console.log('SW Manager: Service worker registered:', this.registration.scope);

      // Set up event listeners
      this.setupEventListeners();

      // Check for immediate updates
      await this.checkForUpdates();

      return this.getStatus();

    } catch (error) {
      console.error('SW Manager: Registration failed:', error);
      return {
        supported: true,
        registered: false,
        installing: false,
        waiting: false,
        active: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  /**
   * Setup service worker event listeners
   */
  private setupEventListeners(): void {
    if (!this.registration) return;

    // Listen for installation
    this.registration.addEventListener('updatefound', () => {
      console.log('SW Manager: Update found');
      const newWorker = this.registration!.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          console.log('SW Manager: State changed to:', newWorker.state);
          
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New version available
              this.updateAvailable = true;
              this.emit('update-available', { newWorker });
            } else {
              // First time installation
              this.emit('installed', { newWorker });
            }
          }
        });
      }
    });

    // Listen for controller changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('SW Manager: Controller changed');
      this.emit('controller-changed', {});
      // Reload page to use new service worker
      window.location.reload();
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('SW Manager: Message from service worker:', event.data);
      this.emit('message', event.data);
    });
  }

  /**
   * Check for service worker updates
   */
  async checkForUpdates(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      await this.registration.update();
      return true;
    } catch (error) {
      console.error('SW Manager: Update check failed:', error);
      return false;
    }
  }

  /**
   * Activate waiting service worker
   */
  async activateWaiting(): Promise<boolean> {
    if (!this.registration?.waiting) return false;

    try {
      // Send skip waiting message
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      return true;
    } catch (error) {
      console.error('SW Manager: Failed to activate waiting worker:', error);
      return false;
    }
  }

  /**
   * Get current service worker status
   */
  getStatus(): ServiceWorkerStatus {
    if (!this.isSupported()) {
      return {
        supported: false,
        registered: false,
        installing: false,
        waiting: false,
        active: false
      };
    }

    if (!this.registration) {
      return {
        supported: true,
        registered: false,
        installing: false,
        waiting: false,
        active: false
      };
    }

    return {
      supported: true,
      registered: true,
      installing: !!this.registration.installing,
      waiting: !!this.registration.waiting,
      active: !!this.registration.active
    };
  }

  /**
   * Get service worker cache statistics
   */
  async getCacheStats(): Promise<ServiceWorkerStats | null> {
    if (!navigator.serviceWorker.controller) return null;

    try {
      return new Promise((resolve) => {
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data);
        };

        navigator.serviceWorker.controller.postMessage(
          { type: 'CACHE_STATS' },
          [messageChannel.port2]
        );

        // Timeout after 5 seconds
        setTimeout(() => resolve(null), 5000);
      });
    } catch (error) {
      console.error('SW Manager: Failed to get cache stats:', error);
      return null;
    }
  }

  /**
   * Clear service worker cache
   */
  async clearCache(): Promise<boolean> {
    if (!navigator.serviceWorker.controller) return false;

    try {
      return new Promise((resolve) => {
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.success || false);
        };

        navigator.serviceWorker.controller.postMessage(
          { type: 'CLEAR_CACHE' },
          [messageChannel.port2]
        );

        // Timeout after 10 seconds
        setTimeout(() => resolve(false), 10000);
      });
    } catch (error) {
      console.error('SW Manager: Failed to clear cache:', error);
      return false;
    }
  }

  /**
   * Unregister service worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      const result = await this.registration.unregister();
      if (result) {
        this.registration = null;
        console.log('SW Manager: Service worker unregistered');
      }
      return result;
    } catch (error) {
      console.error('SW Manager: Failed to unregister service worker:', error);
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
          console.error(`SW Manager: Error in ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * Get update availability
   */
  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  /**
   * Force reload to apply updates
   */
  reloadForUpdate(): void {
    window.location.reload();
  }
}

// Export singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();

// Helper hook for React components
export function useServiceWorker() {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    supported: false,
    registered: false,
    installing: false,
    waiting: false,
    active: false
  });

  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Initialize service worker
    const initSW = async () => {
      const initialStatus = await serviceWorkerManager.register();
      setStatus(initialStatus);
    };

    initSW();

    // Set up event listeners
    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    const handleInstalled = () => {
      setStatus(serviceWorkerManager.getStatus());
    };

    serviceWorkerManager.on('update-available', handleUpdateAvailable);
    serviceWorkerManager.on('installed', handleInstalled);

    // Cleanup
    return () => {
      serviceWorkerManager.off('update-available', handleUpdateAvailable);
      serviceWorkerManager.off('installed', handleInstalled);
    };
  }, []);

  const activateUpdate = useCallback(async () => {
    await serviceWorkerManager.activateWaiting();
  }, []);

  const clearCache = useCallback(async () => {
    return await serviceWorkerManager.clearCache();
  }, []);

  return {
    status,
    updateAvailable,
    activateUpdate,
    clearCache,
    isSupported: serviceWorkerManager.isSupported(),
    checkForUpdates: serviceWorkerManager.checkForUpdates.bind(serviceWorkerManager)
  };
}

// React imports for the hook
import { useState, useEffect, useCallback } from 'react';