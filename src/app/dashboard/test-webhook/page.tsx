"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const TestWebhookPage: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('pro-monthly');
  
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);
  
  const handleTestWebhook = async () => {
    if (!userId) {
      toast.error('User not found. Please log in again.');
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/dev/test-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          planId: selectedPlan
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Webhook test completed!');
        setMessage(`Success: ${JSON.stringify(data, null, 2)}`);
      } else {
        toast.error('Error testing webhook');
        setMessage(`Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error('An error occurred');
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Test Webhook</h1>
            <p className="text-red-600 dark:text-red-400">You must be logged in to use this page.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Test Webhook</h1>
          
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Test Stripe Webhook</h2>
            <div className="mb-4">
              <label htmlFor="plan" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Plan
              </label>
              <select
                id="plan"
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="basic-monthly">Basic (Monthly)</option>
                <option value="pro-monthly">Pro (Monthly)</option>
                <option value="enterprise-monthly">Enterprise (Monthly)</option>
                <option value="basic-yearly">Basic (Yearly)</option>
                <option value="pro-yearly">Pro (Yearly)</option>
                <option value="enterprise-yearly">Enterprise (Yearly)</option>
              </select>
            </div>
            <button
              onClick={handleTestWebhook}
              disabled={loading}
              className={`px-4 py-2 rounded-md font-medium ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Testing...' : 'Test Webhook'}
            </button>
          </div>
          
          {message && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Result:</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto">
                {message}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestWebhookPage; 