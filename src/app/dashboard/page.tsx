"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Calendar from '@/components/calendar/Calendar';

// Define subscription interface
interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  interval: string;
  current_period_end: string;
}

interface SubscriptionResponse {
  has_subscription: boolean;
  subscription: Subscription | null;
}

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        console.log('Dashboard: Checking authentication status');
        
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
            toast.error('Je moet ingelogd zijn om het dashboard te bekijken.');
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

  // Fetch subscription status
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!userId) return;
      
      setSubscriptionLoading(true);
      try {
        const response = await fetch(`/api/subscriptions/status?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch subscription');
        }
        const data = await response.json();
        setSubscription(data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
        // Don't show error toast to avoid disrupting the user experience
      } finally {
        setSubscriptionLoading(false);
      }
    };

    if (userId) {
      fetchSubscription();
    }
  }, [userId]);

  // Get plan name in Dutch
  const getPlanNameDutch = (planId: string | undefined) => {
    if (!planId) return 'Onbekend';
    
    if (planId.includes('basic')) return 'Basis';
    if (planId.includes('pro')) return 'Pro';
    if (planId.includes('enterprise')) return 'Enterprise';
    
    return 'Abonnement';
  };

  // Format subscription status
  const formatSubscriptionStatus = () => {
    if (subscriptionLoading) {
      return 'Laden...';
    }
    
    if (!subscription || !subscription.has_subscription) {
      return 'Geen actief abonnement';
    }
    
    const planName = getPlanNameDutch(subscription.subscription?.plan_id);
    const isYearly = subscription.subscription?.plan_id?.includes('yearly');
    const interval = isYearly ? 'jaarlijks' : 'maandelijks';
    
    return `${planName} (${interval})`;
  };

  // Determine button text and href based on subscription status
  const getSubscriptionButton = () => {
    if (subscriptionLoading) {
      return { text: 'Laden...', href: '#' };
    }
    
    if (!subscription || !subscription.has_subscription) {
      return { text: 'Abonnement afsluiten', href: '/dashboard/order' };
    }
    
    return { text: 'Beheer abonnement', href: '/dashboard/subscription' };
  };

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
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Welkom bij je VoicemailAI Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Je bent ingelogd als: <span className="font-medium">{userEmail}</span>
            </p>
            
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-100 dark:border-blue-800">
                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Abonnement Status</h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium">
                  {formatSubscriptionStatus()}
                </p>
                {subscription && subscription.has_subscription && subscription.subscription && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Actief tot: {new Date(subscription.subscription.current_period_end).toLocaleDateString('nl-NL')}
                  </div>
                )}
                <a 
                  href={getSubscriptionButton().href} 
                  className={`mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 ${subscriptionLoading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {getSubscriptionButton().text}
                  <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-100 dark:border-green-800">
                <h3 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">Voicemail Instellingen</h3>
                <p className="text-green-600 dark:text-green-400">Configureer je voicemail instellingen</p>
                <a href="/dashboard/settings" className="mt-4 inline-flex items-center text-sm font-medium text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">
                  Ga naar instellingen
                  <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-100 dark:border-purple-800">
                <h3 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-2">Statistieken</h3>
                <p className="text-purple-600 dark:text-purple-400">Bekijk je voicemail statistieken</p>
                <a href="/dashboard/statistics" className="mt-4 inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300">
                  Bekijk statistieken
                  <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Calendar Component */}
        {userId && userEmail && (
          <Calendar userId={userId} userEmail={userEmail} />
        )}
      </div>
    </div>
  );
} 