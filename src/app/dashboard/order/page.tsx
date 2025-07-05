"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: string;
    yearly: string;
  };
  features: string[];
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basis',
    description: 'Perfect voor individuele gebruikers en kleine bedrijven',
    price: {
      monthly: '€19',
      yearly: '€199,99',
    },
    features: [
      'Tot 50 voicemails per maand (fair use policy)',
      'Tekst transcriptie',
      'E-mail notificaties',
      '7 dagen opslag',
      'AI-samenvatting',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Ideaal voor groeiende bedrijven en teams',
    price: {
      monthly: '€29',
      yearly: '€299,99',
    },
    features: [
      'Tot 100 voicemails per maand (fair use policy)',
      'Tekst transcriptie',
      'E-mail notificaties',
      '30 dagen opslag',
      'AI-samenvatting',
      'Agendabeheer',
    ],
  },
  {
    id: 'enterprise',
    name: 'Custom',
    description: 'Voor grote organisaties met specifieke behoeften',
    price: {
      monthly: 'Op maat',
      yearly: 'Op maat',
    },
    features: [
      'Alles in Pro',
      'Onbeperkte opslag',
      'Geavanceerde integraties',
      'Aangepaste AI-training',
      'Meertalige ondersteuning',
    ],
  },
];

const OrderPage: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get user info from localStorage
    const storedUserId = localStorage.getItem('userId');
    
    if (!storedUserId) {
      toast.error('Je moet ingelogd zijn om een abonnement af te sluiten');
      window.location.href = '/login';
      return;
    }
    
    setUserId(storedUserId);
  }, []);

  const handleSubscribe = async () => {
    if (!selectedPlan || !userId) {
      toast.error('Selecteer eerst een abonnement');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check for existing subscription
      const statusResponse = await fetch(`/api/subscriptions/status?userId=${userId}`);
      const statusData = await statusResponse.json();

      if (statusData.has_subscription) {
        const currentPlan = statusData.subscription.plan_id;
        if (currentPlan === selectedPlan) {
          toast.error('Je hebt al een actief abonnement op dit plan');
          return;
        }
        toast.error('Je hebt al een actief abonnement. Upgrade of downgrade via het dashboard.');
        return;
      }

      // If we get here, user has no active subscription, proceed with checkout
      const userEmail = localStorage.getItem('userEmail');
      // Construct the plan ID in the correct format
      const planId = `${selectedPlan}-${billingInterval}` as const;
      
      console.log('Sending checkout request:', { planId, userId, email: userEmail });
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId,
          email: userEmail
        }),
      });

      const data = await response.json().catch((e) => {
        console.error('Failed to parse response:', e);
        return null;
      });
      
      console.log('Checkout response:', { 
        status: response.status, 
        statusText: response.statusText,
        data,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        let errorMessage = 'Kon geen checkout sessie aanmaken';
        
        if (data) {
          if (typeof data === 'string') {
            errorMessage = data;
          } else if (typeof data === 'object') {
            errorMessage = data.error || data.message || errorMessage;
          }
        }
        
        console.error('Checkout error details:', {
          status: response.status,
          statusText: response.statusText,
          data,
          errorMessage
        });
        
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }
      
      // Handle development mode bypass
      if (data?.dev_mode) {
        window.location.href = data.url;
        return;
      }

      // Handle Stripe checkout
      if (data?.url) {
        console.log('Redirecting to Stripe checkout:', data.url);
        window.location.href = data.url;
      } else {
        setError('Geen checkout URL ontvangen');
        toast.error('Kon het checkout proces niet starten');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Kon geen checkout sessie aanmaken';
      setError(errorMessage);
      toast.error('Kon het checkout proces niet starten');
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Kies Je Abonnement
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Selecteer het perfecte abonnement voor jouw behoeften
          </p>
        </div>

        {/* Billing Interval Toggle */}
        <div className="flex justify-center mb-8">
          <div className="relative self-center bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`${
                billingInterval === 'monthly'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400'
              } relative w-32 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              Maandelijks
            </button>
            <button
              onClick={() => setBillingInterval('monthly')} // Temporarily force monthly
              className={`${
                billingInterval === 'yearly'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400'
              } relative w-32 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 opacity-50 cursor-not-allowed`}
            >
              Jaarlijks
              <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                Binnenkort
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-6 shadow-sm transition-all duration-200 ${
                selectedPlan === plan.id
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {plan.description}
                </p>
                <p className="mt-4">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {plan.price[billingInterval]}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    /{billingInterval === 'monthly' ? 'maand' : 'jaar'}
                  </span>
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setSelectedPlan(plan.id)}
                className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                  selectedPlan === plan.id
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {selectedPlan === plan.id ? 'Geselecteerd' : `Kies ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        {/* Subscribe Button */}
        <div className="mt-12 text-center">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <div className="flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700 dark:text-red-400">{error}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleSubscribe}
            disabled={!selectedPlan || loading}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
              loading || !selectedPlan
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Verwerken...
              </>
            ) : (
              'Nu Abonneren'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;