"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCookieConsent, setCookieConsent } from '@/lib/cookieConsent';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = getCookieConsent();
    if (cookieConsent === null) {
      // Only show banner if no choice has been made
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    setCookieConsent('accepted');
    setIsVisible(false);
  };

  const declineCookies = () => {
    setCookieConsent('declined');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg p-4 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0 md:mr-8">
          <p className="text-gray-700 dark:text-gray-300">
            We gebruiken cookies om je ervaring te verbeteren. Door gebruik te maken van deze website ga je akkoord met ons{' '}
            <Link href="/cookies" className="text-blue-600 dark:text-blue-400 hover:underline">
              cookiebeleid
            </Link>.
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={declineCookies}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Alleen essentiële cookies
          </button>
          <button
            onClick={acceptCookies}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Alle cookies accepteren
          </button>
        </div>
      </div>
    </div>
  );
} 