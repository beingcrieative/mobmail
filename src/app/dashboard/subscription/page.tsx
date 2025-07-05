"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

// Define subscription interface
interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  current_period_start: string;
  current_period_end: string;
}

interface SubscriptionResponse {
  has_subscription: boolean;
  subscription: Subscription | null;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);

  useEffect(() => {
    // Get user info from localStorage
    const storedUserId = localStorage.getItem('userId');
    
    if (!storedUserId) {
      toast.error('Je moet ingelogd zijn om je abonnement te bekijken.');
      router.push('/login');
      return;
    }
    
    setUserId(storedUserId);
    setLoading(false);
  }, [router]);

  // Fetch subscription status when userId is available
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/subscriptions/status?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch subscription');
        }
        const data = await response.json();
        setSubscription(data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
        toast.error('Er is een fout opgetreden bij het ophalen van je abonnement.');
      } finally {
        setLoading(false);
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
    if (planId.includes('enterprise')) return 'Custom';
    
    return 'Abonnement';
  };

  // Get plan details
  const getPlanDetails = (planId: string | undefined) => {
    if (!planId) return { price: '?', features: [] };
    
    if (planId.includes('basic')) {
      return { 
        price: planId.includes('yearly') ? '199,99/jaar' : '19/maand',
        features: ['Tot 50 voicemails per maand', 'Tekst transcriptie', 'E-mail notificaties', '7 dagen opslag', 'AI-samenvatting']
      };
    }
    
    if (planId.includes('pro')) {
      return { 
        price: planId.includes('yearly') ? '299,99/jaar' : '29/maand',
        features: ['Tot 100 voicemails per maand', 'Tekst transcriptie', 'E-mail notificaties', '30 dagen opslag', 'AI-samenvatting', 'Agendabeheer']
      };
    }
    
    if (planId.includes('enterprise')) {
      return { 
        price: 'Op maat',
        features: ['Alles in Pro', 'Onbeperkte opslag', 'Geavanceerde integraties', 'Aangepaste AI-training', 'Meertalige ondersteuning']
      };
    }
    
    return { price: '?', features: [] };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Abonnement laden...</p>
        </div>
      </div>
    );
  }

  if (!subscription || !subscription.has_subscription) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Je abonnement</h1>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-100 dark:border-yellow-800 mb-6">
              <div className="flex items-start">
                <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="ml-3">
                  <p className="text-yellow-700 dark:text-yellow-400 font-medium">
                    Je hebt momenteel geen actief abonnement.
                  </p>
                  <p className="text-yellow-600 dark:text-yellow-300 mt-1">
                    Kies een abonnement om alle voordelen van VoicemailAI te ervaren.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center mb-8">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Waarom een abonnement afsluiten?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Met een VoicemailAI abonnement krijg je toegang tot al onze AI-gestuurde voicemail functies, 
                van transcripties tot slimme samenvattingen.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
              <button
                onClick={() => window.location.href = '/pricing'}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Bekijk abonnementen
              </button>
              
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-md font-medium hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Terug naar dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const planName = getPlanNameDutch(subscription.subscription?.plan_id);
  const planDetails = getPlanDetails(subscription.subscription?.plan_id);
  const startDate = subscription.subscription ? new Date(subscription.subscription.current_period_start).toLocaleDateString('nl-NL') : '';
  const endDate = subscription.subscription ? new Date(subscription.subscription.current_period_end).toLocaleDateString('nl-NL') : '';
  const formattedStatus = subscription.subscription?.status === 'active' ? 'Actief' : 'Inactief';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Je abonnement</h1>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-100 dark:border-blue-800 mb-6">
            <p className="text-blue-700 dark:text-blue-400">
              Je hebt een actief <span className="font-medium">{planName}</span> abonnement.
            </p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Abonnement details</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Abonnement</p>
                <p className="mt-1 text-gray-900 dark:text-white">{planName}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Prijs</p>
                <p className="mt-1 text-gray-900 dark:text-white">€{planDetails.price}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                <p className="mt-1 text-gray-900 dark:text-white">{formattedStatus}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Startdatum</p>
                <p className="mt-1 text-gray-900 dark:text-white">{startDate}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Vervaldatum</p>
                <p className="mt-1 text-gray-900 dark:text-white">{endDate}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Inbegrepen functies</p>
              <ul className="space-y-4">
                {planDetails.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Abonnement beheren</h2>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/dashboard/order')}
                className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Upgrade abonnement
              </button>
              
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-md font-medium hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Terug naar dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 