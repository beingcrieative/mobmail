'use client';

import { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { engagementTracker } from '@/lib/pwa/engagementTracker';
import { InstallPrompt } from '@/components/mobile/InstallPrompt';
import { useMobileLayout } from '@/lib/hooks/useMobileLayout';

interface MobileLayoutProps {
  children: ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [isEligibleForInstall, setIsEligibleForInstall] = useState(false);
  const [engagementSummary, setEngagementSummary] = useState('');
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  
  // Use the new mobile layout hook
  const {
    isActive,
    isMobileDevice,
    orientation,
    error,
    applyMobileConfig,
    setupPWA,
  } = useMobileLayout(false); // Don't auto-detect, we'll manually configure
  
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

  // Apply mobile configuration using the service
  useEffect(() => {
    // Only run on client side after hydration
    if (typeof window === 'undefined') return;
    
    // Detect Samsung Fold or narrow devices
    const isNarrowDevice = window.innerWidth <= 320;
    const isFoldDevice = window.innerWidth <= 280;
    
    // Apply mobile configuration with fold-specific settings
    applyMobileConfig({
      statusBarStyle: 'transparent',
      hideNavigation: true,
      enableSafeArea: true,
      orientationLock: 'portrait',
      fullscreen: false,
      disableZoom: isFoldDevice ? false : true, // Allow zoom on fold devices for accessibility
      enablePullToRefresh: false,
      customMetaTags: {
        'apple-mobile-web-app-title': 'VoicemailAI',
        'application-name': 'VoicemailAI',
        'color-scheme': 'light dark',
        'viewport': isNarrowDevice 
          ? 'width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes, viewport-fit=cover'
          : 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover',
      },
    });

    // Setup PWA configuration
    setupPWA({
      enabled: true,
      name: 'VoicemailAI Mobile',
      shortName: 'VoicemailAI',
      description: 'AI-powered voicemail management',
      themeColor: '#2563E8',
      backgroundColor: '#0F172A',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/mobile-v3/',
      startUrl: '/mobile-v3/',
    });

    // Register minimal service worker only in production (avoid dev cache issues)
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })
      .then(registration => {
        console.log('✅ Minimal SW registered for PWA compliance:', registration.scope);
      })
      .catch(error => {
        console.log('❌ SW registration failed:', error);
      });
    }
  }, [applyMobileConfig, setupPWA]);

  // Engagement tracking setup (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const initializeEngagement = () => {
      try {
        // Check for install eligibility after some engagement
        setTimeout(() => {
          const isEligible = engagementTracker.isEligibleForInstallPrompt();
          setIsEligibleForInstall(isEligible);
          
          if (isEligible) {
            const summary = engagementTracker.getSummary();
            setEngagementSummary(summary);
            
            // Show install prompt after engagement threshold
            setTimeout(() => setShowInstallPrompt(true), 2000);
          }
        }, 5000);
      } catch (error) {
        console.error('Engagement tracking failed:', error);
      }
    };

    initializeEngagement();
  }, []);

  if (error) {
    console.error('Mobile layout error:', error);
  }

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
        </div>
      </div>

      {/* Main Content Area */}
      <main className="mobile-content">
        <AnimatePresence mode="wait">
          <motion.div
            key="mobile-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Update Notification */}
      <AnimatePresence>
        {showUpdateNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed top-4 left-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Update beschikbaar</h3>
                <p className="text-sm opacity-90">Een nieuwe versie is klaar om te installeren.</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={dismissUpdate}
                  className="px-3 py-1 text-sm bg-blue-700 rounded"
                >
                  Later
                </button>
                <button
                  onClick={handleInstallUpdate}
                  className="px-3 py-1 text-sm bg-white text-blue-600 rounded font-medium"
                >
                  Update
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install Prompt */}
      <AnimatePresence>
        {showInstallPrompt && isEligibleForInstall && (
          <InstallPrompt
            variant="modal"
            showMetrics={true}
            autoShow={showInstallPrompt}
            onInstallAttempt={(success) => {
              setShowInstallPrompt(false);
              if (success) {
                console.log('Install successful');
              } else {
                console.log('Install failed or cancelled');
              }
            }}
            onDismiss={() => setShowInstallPrompt(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}