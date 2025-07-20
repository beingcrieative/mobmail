'use client';

import { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { engagementTracker } from '@/lib/pwa/engagementTracker';
import { InstallPrompt } from '@/components/mobile/InstallPrompt';
// Minimal service worker voor PWA compliance

interface MobileLayoutProps {
  children: ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [isEligibleForInstall, setIsEligibleForInstall] = useState(false);
  const [engagementSummary, setEngagementSummary] = useState('');
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  
  // Simplified service worker status (no complex PWA features during transition)
  const status = { active: false };
  const updateAvailable = false;
  const activateUpdate = async () => {};
  const isSupported = false;

  // Handle service worker update notifications
  useEffect(() => {
    if (updateAvailable) {
      setShowUpdateNotification(true);
    }
  }, [updateAvailable]);

  const handleInstallUpdate = async () => {
    setShowUpdateNotification(false);
    await activateUpdate();
  };

  const dismissUpdate = () => {
    setShowUpdateNotification(false);
  };

  useEffect(() => {
    // Register minimal service worker for PWA compliance
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })
      .then(registration => {
        console.log('✅ Minimal SW registered for PWA compliance:', registration.scope);
      })
      .catch(error => {
        console.warn('⚠️ SW registration failed (non-critical):', error);
      });
    }

    // Setup engagement tracking for PWA install prompt eligibility
    const handleEligibilityChange = () => {
      const isEligible = engagementTracker.isEligibleForInstallPrompt();
      const summary = engagementTracker.getSummary();
      
      setIsEligibleForInstall(isEligible);
      setEngagementSummary(summary);
      
      if (isEligible) {
        console.log('🎉 User became eligible for PWA install prompt');
        // Show install prompt when user becomes eligible
        setTimeout(() => setShowInstallPrompt(true), 1000);
      }
    };

    // Force show install prompt for testing
    const forceShowPrompt = () => {
      console.log('🔧 Development: Force showing install prompt for testing');
      setTimeout(() => setShowInstallPrompt(true), 3000);
    };

    const handleMetricsUpdate = () => {
      setEngagementSummary(engagementTracker.getSummary());
    };

    // Listen for engagement events
    engagementTracker.on('became-eligible', handleEligibilityChange);
    engagementTracker.on('metrics-updated', handleMetricsUpdate);

    // Initial check
    handleEligibilityChange();

    // Force show install prompt in development for testing
    if (process.env.NODE_ENV === 'development') {
      forceShowPrompt();
    }

    // Cleanup
    return () => {
      engagementTracker.off('became-eligible', handleEligibilityChange);
      engagementTracker.off('metrics-updated', handleMetricsUpdate);
    };
  }, []);

  useEffect(() => {
    // Apply mobile-specific meta tags and configuration
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }

    // Add mobile app meta tags
    const head = document.head;
    const mobileMetaTags = [
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'theme-color', content: '#00BCD4' },
      { name: 'msapplication-navbutton-color', content: '#00BCD4' },
      { name: 'apple-mobile-web-app-title', content: 'VoicemailAI' }
    ];

    mobileMetaTags.forEach(tag => {
      const existingTag = document.querySelector(`meta[name="${tag.name}"]`);
      if (!existingTag) {
        const meta = document.createElement('meta');
        meta.name = tag.name;
        meta.content = tag.content;
        head.appendChild(meta);
      }
    });

    // Add PWA manifest link
    if (!document.querySelector('link[rel="manifest"]')) {
      const manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = '/manifest.json';
      head.appendChild(manifestLink);
    }

    // Add apple touch icon
    if (!document.querySelector('link[rel="apple-touch-icon"]')) {
      const iconLink = document.createElement('link');
      iconLink.rel = 'apple-touch-icon';
      iconLink.href = '/icon-192x192.png';
      head.appendChild(iconLink);
    }

    // Apply mobile-native styles
    const style = document.createElement('style');
    style.textContent = `
      /* Mobile-native styles for /mobile-v3 routes */
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
      }
      
      /* Hide root layout elements for mobile */
      body.mobile-native header,
      body.mobile-native nav,
      body.mobile-native footer,
      body.mobile-native .navbar,
      body.mobile-native .footer {
        display: none !important;
      }
      
      /* Mobile app container - Clean Professional */
      .mobile-app-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        height: 100vh;
        height: 100dvh;
        background: var(--background-subtle);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        z-index: 1000;
      }
      
      /* Status bar safe area - BlaBlaCar Style */
      .mobile-status-bar {
        height: env(safe-area-inset-top, 44px);
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 env(safe-area-inset-left, 16px) 0 env(safe-area-inset-right, 16px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      /* Main content area - BlaBlaCar Style */
      .mobile-content {
        flex: 1;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        padding-bottom: env(safe-area-inset-bottom, 80px);
        background: transparent;
        position: relative;
      }
      
      /* Bottom navigation safe area */
      .mobile-bottom-nav {
        padding-bottom: env(safe-area-inset-bottom, 0);
      }
      
      /* Disable zoom on inputs */
      body.mobile-native input,
      body.mobile-native textarea,
      body.mobile-native select {
        font-size: 16px !important;
      }
      
      /* Native-feeling buttons */
      body.mobile-native button {
        -webkit-appearance: none;
        appearance: none;
        cursor: pointer;
        outline: none;
      }
      
      /* Smooth scrolling */
      body.mobile-native * {
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
      }
    `;
    head.appendChild(style);

    // Add mobile-native class to body
    document.body.classList.add('mobile-native');

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('mobile-native');
      head.removeChild(style);
    };
  }, []);

  return (
    <div className="mobile-app-container">
      {/* Status Bar Simulation */}
      <div className="mobile-status-bar text-white text-sm font-medium">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full opacity-60"></div>
          </div>
          <span>Proximus</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>100%</span>
          <div className="w-6 h-3 border border-white rounded-sm">
            <div className="w-full h-full bg-white rounded-sm"></div>
          </div>
          {/* Service Worker Status Indicator */}
          {isSupported && status.active && (
            <div className="w-2 h-2 bg-green-400 rounded-full" title="PWA Active" />
          )}
        </div>
      </div>
      
      {/* Update Notification */}
      <AnimatePresence>
        {showUpdateNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-16 left-4 right-4 z-50 glass-card text-white p-4"
            style={{
              background: 'var(--accent-gradient)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--card-shadow-hover)'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-sm">App Update Beschikbaar</h4>
                <p className="text-xs opacity-90">Nieuwe versie met verbeteringen klaar om te installeren</p>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={dismissUpdate}
                  className="px-3 py-1 text-xs rounded transition-colors"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  Later
                </button>
                <button
                  onClick={handleInstallUpdate}
                  className="px-3 py-1 text-xs rounded transition-colors font-medium"
                  style={{
                    background: 'white',
                    color: 'var(--color-primary)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  Update
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mobile-content"
      >
        {children}
      </motion.div>
      
      {/* PWA Install Prompt */}
      {showInstallPrompt && (
        <InstallPrompt
          variant="banner"
          autoShow={true}
          onInstallAttempt={(success) => {
            if (success) {
              setShowInstallPrompt(false);
            }
          }}
          onDismiss={() => setShowInstallPrompt(false)}
        />
      )}
    </div>
  );
}
