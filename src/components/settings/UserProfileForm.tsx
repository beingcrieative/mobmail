"use client";

import { useState, useEffect } from 'react';
import { useUserProfile } from '@/lib/hooks/useUserProfile';

interface UserProfileFormProps {
  userId: string;
  userEmail: string;
}

interface UserProfile {
  name: string;
  companyName: string;
  mobileNumber: string;
  information: string;
  calUsername: string;
  calApiKey: string;
  calEventTypeId: string;
}

export default function UserProfileForm({ userId, userEmail }: UserProfileFormProps) {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    companyName: '',
    mobileNumber: '',
    information: '',
    calUsername: '',
    calApiKey: '',
    calEventTypeId: '',
  });
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [showCalTooltip, setShowCalTooltip] = useState(false);

  // Use the new user profile hook
  const {
    profile: fetchedProfile,
    loading,
    fetchingProfile,
    error,
    updateProfile,
    validateCalCredentials,
    retryFetch,
  } = useUserProfile();

  // Update local state when fetched profile changes
  useEffect(() => {
    if (fetchedProfile) {
      setProfile({
        name: fetchedProfile.name || '',
        companyName: fetchedProfile.companyName || '',
        mobileNumber: fetchedProfile.mobileNumber || '',
        information: fetchedProfile.information || '',
        calUsername: fetchedProfile.calUsername || '',
        calApiKey: fetchedProfile.calApiKey || '',
        calEventTypeId: fetchedProfile.calEventTypeId || '',
      });
    }
  }, [fetchedProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await updateProfile({
      name: profile.name,
      companyName: profile.companyName,
      mobileNumber: profile.mobileNumber,
      information: profile.information,
      calUsername: profile.calUsername,
      calApiKey: profile.calApiKey,
      calEventTypeId: profile.calEventTypeId,
    });

    // The success/error handling is done in the hook
    // No need for additional logic here
  };

  const handleGetEventId = async () => {
    const eventType = await validateCalCredentials({
      username: profile.calUsername,
      apiKey: profile.calApiKey,
    });

    if (eventType) {
      setProfile(prev => ({
        ...prev,
        calEventTypeId: eventType.id.toString(),
      }));
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showInfoTooltip) {
        setShowInfoTooltip(false);
      }
      if (showCalTooltip) {
        setShowCalTooltip(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInfoTooltip, showCalTooltip]);

  if (fetchingProfile) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
          Voicemail Instellingen
        </h3>
        <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
          Vul alle velden in om optimaal gebruik te maken van de voicemail service. Je naam en telefoonnummer zijn noodzakelijk voor de correcte werking van je voicemail.
        </p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-700 dark:text-red-400">{error}</p>
          <button 
            onClick={retryFetch}
            className="mt-2 text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            Opnieuw proberen
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            E-mailadres
          </label>
          <input
            id="email"
            type="email"
            value={userEmail}
            disabled
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Je e-mailadres kan niet worden gewijzigd.
          </p>
        </div>
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Naam
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={profile.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Voer je naam in"
          />
        </div>
        
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bedrijfsnaam
          </label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            value={profile.companyName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Voer je bedrijfsnaam in"
          />
        </div>
        
        <div>
          <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mobiel nummer
          </label>
          <input
            id="mobileNumber"
            name="mobileNumber"
            type="tel"
            value={profile.mobileNumber}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Voer je mobiele nummer in"
          />
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <label htmlFor="information" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Aanvullende informatie
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowInfoTooltip(!showInfoTooltip)}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none"
                aria-label="Toon meer informatie"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              {showInfoTooltip && (
                <div className="absolute z-10 w-[300px] p-4 mt-2 -left-[150px] top-6 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-normal">
                    Geef informatie over het bedrijf zodat je digitale assistant deze informatie kan gebruiken om gebruikersvragen te beantwoorden
                  </p>
                  <div className="absolute -top-2 left-[150px] transform w-3 h-3 rotate-45 bg-white dark:bg-gray-800 border-t border-l border-gray-200 dark:border-gray-700"></div>
                </div>
              )}
            </div>
          </div>
          <textarea
            id="information"
            name="information"
            rows={4}
            value={profile.information}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Voer aanvullende informatie in"
          />
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Cal.com Integratie</h3>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCalTooltip(!showCalTooltip)}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none"
                aria-label="Toon meer informatie"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              {showCalTooltip && (
                <div className="absolute z-10 w-[300px] p-4 mt-2 -left-[150px] top-6 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-normal">
                    Volg de handleiding voor het aanmaken van een Cal.com account zodat je digitale assistent afspraken in je agenda kan inboeken
                  </p>
                  <div className="absolute -top-2 left-[150px] transform w-3 h-3 rotate-45 bg-white dark:bg-gray-800 border-t border-l border-gray-200 dark:border-gray-700"></div>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="calUsername" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cal.com Gebruikersnaam
              </label>
              <input
                id="calUsername"
                name="calUsername"
                type="text"
                value={profile.calUsername}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Voer je Cal.com gebruikersnaam in"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Bijvoorbeeld: "johndoe" als je Cal.com URL cal.com/johndoe is
              </p>
            </div>
            
            <div>
              <label htmlFor="calApiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cal.com API Sleutel
              </label>
              <input
                id="calApiKey"
                name="calApiKey"
                type="password"
                value={profile.calApiKey}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Voer je Cal.com API sleutel in"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Je kunt een API sleutel genereren in je Cal.com dashboard onder Instellingen &gt; Developer &gt; API Keys
              </p>
            </div>

            <div>
              <label htmlFor="calEventTypeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cal.com Event Type ID
              </label>
              <input
                id="calEventTypeId"
                name="calEventTypeId"
                type="text"
                value={profile.calEventTypeId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Voer je Cal.com Event Type ID in"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Je kunt je Event Type ID vinden in je Cal.com dashboard onder Event Types
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleGetEventId}
            disabled={loading || !profile.calApiKey || !profile.calUsername}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Get EventId
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Opslaan...' : 'Opslaan'}
          </button>
        </div>
      </form>
    </div>
  );
}