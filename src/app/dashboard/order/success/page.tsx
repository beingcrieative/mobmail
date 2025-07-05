"use client";

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const OrderSuccessContent: React.FC = () => {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const createSubscription = async () => {
      try {
        // Get the session from Stripe to get the user ID and customer ID
        const response = await fetch('/api/stripe/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const session = await response.json();
        
        if (!session?.client_reference_id) {
          console.error('No user ID found in session');
          return;
        }

        // Create subscription using our API endpoint
        const createResponse = await fetch('/api/subscriptions/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session.client_reference_id,
            planId: plan || 'basic-monthly',
            stripeCustomerId: session.customer
          }),
        });

        if (!createResponse.ok) {
          const error = await createResponse.json();
          console.error('Error creating subscription:', error);
        } else {
          console.log('Subscription created successfully');
        }
      } catch (error) {
        console.error('Error in createSubscription:', error);
      }
    };

    // Create subscription before redirecting
    createSubscription();

    // Show success message
    toast.success('Bedankt voor je abonnement! Je wordt doorgestuurd naar het dashboard...');

    // Redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      window.location.href = '/dashboard';
    }, 3000);

    return () => clearTimeout(timer);
  }, [sessionId, plan]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 animate-bounce" />
        </div>
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Abonnement Actief!
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Je abonnement is succesvol geactiveerd.
          </p>
          {plan && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Plan: {plan.split('-')[0].charAt(0).toUpperCase() + plan.split('-')[0].slice(1)}
            </p>
          )}
        </div>
        <div className="mt-8">
          <div className="inline-flex items-center">
            <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Je wordt doorgestuurd naar het dashboard...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderSuccessPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-gray-500 dark:text-gray-400" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
};

export default OrderSuccessPage; 