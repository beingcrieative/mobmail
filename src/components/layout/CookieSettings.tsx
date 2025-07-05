"use client";

import { useState, useEffect } from 'react';
import { getCookieConsent, setCookieConsent } from '@/lib/cookieConsent';

interface CookieSettingsProps {
  onClose?: () => void;
}

export default function CookieSettings({ onClose }: CookieSettingsProps) {
  const [consent, setConsent] = useState<string | null>(null);
  
  useEffect(() => {
    setConsent(getCookieConsent());
  }, []);
  
  const handleSave = (newConsent: 'accepted' | 'declined') => {
    setCookieConsent(newConsent);
    setConsent(newConsent);
    if (onClose) onClose();
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Cookie Instellingen</h2>
      
      <div className="space-y-4 mb-6">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="essential"
              type="checkbox"
              checked
              disabled
              className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="essential" className="font-medium text-gray-900 dark:text-white">Essentiële cookies</label>
            <p className="text-gray-500 dark:text-gray-400 text-xs">Deze cookies zijn noodzakelijk voor het functioneren van de website en kunnen niet worden uitgeschakeld.</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="functional"
              type="checkbox"
              checked={consent === 'accepted'}
              onChange={() => setConsent(consent === 'accepted' ? 'declined' : 'accepted')}
              className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="functional" className="font-medium text-gray-900 dark:text-white">Functionele & analytische cookies</label>
            <p className="text-gray-500 dark:text-gray-400 text-xs">Deze cookies helpen ons om de website te verbeteren en je ervaring te personaliseren.</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => handleSave('declined')}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Alleen essentiële cookies
        </button>
        <button
          onClick={() => handleSave('accepted')}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Alle cookies accepteren
        </button>
      </div>
    </div>
  );
} 