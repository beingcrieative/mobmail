"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const TestSubscriptionPage: React.FC = () => {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('pro-monthly');
  
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);
  
  const handleSetupTable = async () => {
    setSetupLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/dev/setup-subscriptions-table');
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Tabel succesvol aangemaakt!');
        setMessage(`Succes: ${data.message}`);
      } else {
        toast.error('Fout bij aanmaken tabel');
        setMessage(`Fout: ${data.error || 'Onbekende fout'}`);
      }
    } catch (error) {
      toast.error('Er is een fout opgetreden');
      setMessage(`Fout: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
    } finally {
      setSetupLoading(false);
    }
  };
  
  const handleCreateSubscription = async () => {
    if (!userId) {
      toast.error('Gebruiker niet gevonden. Log opnieuw in.');
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch(`/api/dev/create-test-subscription?userId=${userId}&planId=${selectedPlan}`);
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Test abonnement aangemaakt!');
        setMessage(`Succes: Abonnement "${selectedPlan}" aangemaakt voor gebruiker ${userId}`);
      } else {
        toast.error('Fout bij aanmaken abonnement');
        setMessage(`Fout: ${data.error || 'Onbekende fout'}`);
      }
    } catch (error) {
      toast.error('Er is een fout opgetreden');
      setMessage(`Fout: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
    } finally {
      setLoading(false);
    }
  };
  
  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Test Abonnement</h1>
            <p className="text-red-600 dark:text-red-400">Je moet ingelogd zijn om deze pagina te gebruiken.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Test Abonnement</h1>
          
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">1. Maak subscriptions tabel aan</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Eerst moet je de abonnementen tabel aanmaken in de database.
            </p>
            <button
              onClick={handleSetupTable}
              disabled={setupLoading}
              className={`px-4 py-2 rounded-md font-medium ${
                setupLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {setupLoading ? 'Bezig...' : 'Maak tabel aan'}
            </button>
          </div>
          
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">2. Maak test abonnement aan</h2>
            <div className="mb-4">
              <label htmlFor="plan" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selecteer abonnement
              </label>
              <select
                id="plan"
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="basic-monthly">Basis (maandelijks)</option>
                <option value="pro-monthly">Pro (maandelijks)</option>
                <option value="enterprise-monthly">Enterprise (maandelijks)</option>
                <option value="basic-yearly">Basis (jaarlijks)</option>
                <option value="pro-yearly">Pro (jaarlijks)</option>
                <option value="enterprise-yearly">Enterprise (jaarlijks)</option>
              </select>
            </div>
            <button
              onClick={handleCreateSubscription}
              disabled={loading}
              className={`px-4 py-2 rounded-md font-medium ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Bezig...' : 'Maak abonnement aan'}
            </button>
          </div>
          
          {message && (
            <div className={`p-4 rounded-md mb-6 ${message.startsWith('Fout') ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'}`}>
              <p>{message}</p>
            </div>
          )}
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">3. Bekijk resultaat</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700"
              >
                Ga naar dashboard
              </button>
              
              <button
                onClick={() => router.push('/dashboard/subscription')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700"
              >
                Bekijk abonnement details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSubscriptionPage; 