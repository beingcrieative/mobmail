"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import UserProfileForm from '@/components/settings/UserProfileForm';
import ForwardingSettings from '@/components/settings/ForwardingSettings';
import ErrorBoundary from '@/components/settings/ErrorBoundary';
import ManualTab from '@/components/settings/ManualTab';

export default function SettingsPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewProfile, setIsNewProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const router = useRouter();

  useEffect(() => {
    // Check if user was redirected here to complete profile
    const urlParams = new URLSearchParams(window.location.search);
    const newProfile = urlParams.get('newProfile') === 'true';
    setIsNewProfile(newProfile);

    // Check if tab is specified in URL
    const tab = urlParams.get('tab');
    if (tab === 'forwarding') {
      setActiveTab('forwarding');
    } else if (tab === 'handleiding') {
      setActiveTab('handleiding');
    }

    const getUserInfo = async () => {
      try {
        // Check if user is authenticated
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          console.log('No session found, redirecting to login');
          toast.error('Je moet ingelogd zijn om de instellingen te bekijken.');
          router.push('/login');
          return;
        }
        
        // Get user details
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error fetching user:', error.message);
          setUserEmail('Geen e-mail gevonden');
        } else {
          setUserEmail(data.user?.email || 'Geen e-mail gevonden');
          setUserId(data.user?.id || null);
        }
      } catch (error) {
        console.error('Unexpected error fetching user info:', error);
        setUserEmail('Geen e-mail gevonden');
      } finally {
        setLoading(false);
      }
    };

    getUserInfo();
  }, [router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Laden...</p>
        </div>
      </div>
    );
  }

  const switchTab = (tab: string) => {
    setActiveTab(tab);
    // Update URL without refreshing the page
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isNewProfile && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Voicemail instellingen nodig
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                  <p>Vul alsjeblieft je profielgegevens in om volledige functionaliteit van de voicemail service te kunnen gebruiken.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Instellingen</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Terug naar Dashboard
            </button>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex justify-center -mb-px mx-auto max-w-md">
              <button
                onClick={() => switchTab('profile')}
                className={`flex-1 text-center px-6 py-3 border-b-2 text-sm font-medium ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Profiel
              </button>
              <button
                onClick={() => switchTab('forwarding')}
                className={`flex-1 text-center px-6 py-3 border-b-2 text-sm font-medium ${
                  activeTab === 'forwarding'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Doorschakeling
              </button>
              <button
                onClick={() => switchTab('handleiding')}
                className={`flex-1 text-center px-6 py-3 border-b-2 text-sm font-medium ${
                  activeTab === 'handleiding'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Handleiding
              </button>
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <ErrorBoundary>
                {userId && userEmail && (
                  <UserProfileForm userId={userId} userEmail={userEmail} />
                )}
              </ErrorBoundary>
            )}
            
            {activeTab === 'forwarding' && (
              <ErrorBoundary>
                {userId && (
                  <ForwardingSettings userId={userId} />
                )}
              </ErrorBoundary>
            )}
            
            {activeTab === 'handleiding' && (
              <ErrorBoundary>
                <ManualTab />
              </ErrorBoundary>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 