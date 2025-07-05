"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import TranscriptionsTable from '@/components/statistics/TranscriptionsTable';
import StatsOverview from '@/components/statistics/StatsOverview';

export default function StatisticsPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();

  const handleRefresh = () => {
    toast.info('Gegevens worden vernieuwd...');
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    const checkAuth = () => {
      try {
        console.log('Statistics: Checking authentication status');
        
        // Get user info from localStorage
        const storedUserId = localStorage.getItem('userId');
        const storedUserEmail = localStorage.getItem('userEmail');
        
        if (!storedUserId || !storedUserEmail) {
          console.log('No user info found in localStorage, checking cookies');
          
          // Try to get from cookies
          const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
            return null;
          };
          
          const cookieUserId = getCookie('userId');
          const cookieUserEmail = getCookie('userEmail');
          
          if (!cookieUserId || !cookieUserEmail) {
            console.log('No user info found in cookies, redirecting to login');
            toast.error('Je moet ingelogd zijn om statistieken te bekijken.');
            router.push('/login');
            return;
          }
          
          console.log('User info found in cookies');
          setUserId(cookieUserId);
          setUserEmail(cookieUserEmail);
        } else {
          console.log('User info found in localStorage');
          setUserId(storedUserId);
          setUserEmail(storedUserEmail);
        }
      } catch (error) {
        console.error('Unexpected error checking auth:', error);
        toast.error('Er is een fout opgetreden bij het controleren van je inlogstatus.');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Voicemail Statistieken</h1>
            <button 
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Vernieuwen
            </button>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Op deze pagina vind je een overzicht van alle voicemail transcripties en de bijbehorende analyses.
          </p>
          
          <StatsOverview clientId={userId} key={`stats-${refreshKey}`} />
        </div>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Voicemail Transcripties
            </h2>
            <TranscriptionsTable clientId={userId} key={`table-${refreshKey}`} />
          </div>
        </div>
      </div>
    </div>
  );
} 