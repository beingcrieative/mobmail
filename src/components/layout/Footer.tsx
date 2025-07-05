"use client";

import Link from 'next/link';
import { useState } from 'react';
import CookieSettings from './CookieSettings';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [showCookieSettings, setShowCookieSettings] = useState(false);

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">VoicemailAI</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Transformeer je voicemail ervaring met AI-gestuurde oplossingen die tijd besparen en communicatie verbeteren.
            </p>
            {/* Social media icons removed */}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm">
                  Functies
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm">
                  Prijzen
                </Link>
              </li>
              <li>
                <Link href="/demo" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm">
                  Demo
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm">
                  Integraties
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bedrijf</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm">
                  Over ons
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Juridisch</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm">
                  Privacybeleid
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm">
                  Algemene voorwaarden
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm">
                  Cookiebeleid
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => setShowCookieSettings(true)}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm"
                >
                  Cookie instellingen
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
            &copy; {currentYear} VoicemailAI. Alle rechten voorbehouden.
          </p>
        </div>
      </div>
      
      {/* Cookie Settings Modal */}
      {showCookieSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <div className="relative">
              <button 
                onClick={() => setShowCookieSettings(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <CookieSettings onClose={() => setShowCookieSettings(false)} />
            </div>
          </div>
        </div>
      )}
    </footer>
  );
} 