'use client';

import { ReactNode, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MobileLayoutProps {
  children: ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
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
      { name: 'theme-color', content: '#000000' },
      { name: 'msapplication-navbutton-color', content: '#000000' },
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
      
      /* Mobile app container */
      .mobile-app-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        height: 100vh;
        height: 100dvh;
        background: #f9fafb;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        z-index: 1000;
      }
      
      /* Status bar safe area */
      .mobile-status-bar {
        height: env(safe-area-inset-top, 44px);
        background: #000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 env(safe-area-inset-left, 16px) 0 env(safe-area-inset-right, 16px);
      }
      
      /* Main content area */
      .mobile-content {
        flex: 1;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        padding-bottom: env(safe-area-inset-bottom, 80px);
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
        </div>
      </div>
      
      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mobile-content"
      >
        {children}
      </motion.div>
    </div>
  );
}
