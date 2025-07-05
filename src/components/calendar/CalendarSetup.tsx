"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";

interface CalendarSetupProps {
  userId: string;
  onSetupComplete: (username: string, apiKey: string | null) => void;
}

export default function CalendarSetup({ userId, onSetupComplete }: CalendarSetupProps) {
  const [calUsername, setCalUsername] = useState("");
  const [calApiKey, setCalApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [showApiKeyField, setShowApiKeyField] = useState(false);

  const validateUsername = (username: string) => {
    // Clear previous errors
    setValidationError("");
    
    // Basic validation
    if (!username.trim()) {
      setValidationError("Please enter your Cal.com username");
      return false;
    }
    
    // Check for spaces and special characters
    if (/\s/.test(username) || /[^a-zA-Z0-9_-]/.test(username)) {
      setValidationError("Username should not contain spaces or special characters");
      return false;
    }
    
    return true;
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUsername(calUsername)) {
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real implementation, we would store this in the database
      // For now, we'll just simulate success and store in localStorage
      localStorage.setItem(`cal_username_${userId}`, calUsername);
      
      // Store API key if provided
      if (calApiKey.trim()) {
        localStorage.setItem(`cal_api_key_${userId}`, calApiKey);
      } else {
        localStorage.removeItem(`cal_api_key_${userId}`);
      }
      
      toast.success("Calendar settings saved successfully!");
      onSetupComplete(calUsername, calApiKey.trim() ? calApiKey : null);
    } catch (error) {
      console.error("Error saving calendar settings:", error);
      toast.error("Failed to save calendar settings");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Connect Your Cal.com Account
      </h2>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Connect your Cal.com account to manage your appointments and schedule meetings directly from your dashboard.
      </p>
      
      <form onSubmit={handleSaveSettings} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cal.com Username
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
              cal.com/
            </span>
            <input
              type="text"
              value={calUsername}
              onChange={(e) => {
                setCalUsername(e.target.value);
                if (validationError) validateUsername(e.target.value);
              }}
              className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white border ${
                validationError 
                  ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="your-username"
            />
          </div>
          {validationError && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-500">{validationError}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enter your Cal.com username (e.g., "johndoe" if your Cal.com URL is cal.com/johndoe)
          </p>
        </div>
        
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setShowApiKeyField(!showApiKeyField)}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
          >
            {showApiKeyField ? 'Hide API Key Field' : 'Show API Key Field (Optional)'}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 ml-1 transform ${showApiKeyField ? 'rotate-180' : ''} transition-transform`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {showApiKeyField && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cal.com API Key (Optional)
            </label>
            <input
              type="password"
              value={calApiKey}
              onChange={(e) => setCalApiKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="cal_live_..."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Provide your Cal.com API key to fetch real appointments. You can find this in your Cal.com dashboard under Developer Settings.
            </p>
            <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-md">
              <p className="text-xs text-yellow-800 dark:text-yellow-300">
                <strong>Note:</strong> Your API key is stored locally in your browser and is never sent to our servers. 
                It's used only to fetch your appointments directly from Cal.com.
              </p>
            </div>
          </div>
        )}
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Connecting..." : "Connect Calendar"}
          </button>
        </div>
      </form>
      
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Don't have a Cal.com account?</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Cal.com is a scheduling infrastructure for absolutely everyone. Create your free account to get started.
        </p>
        <a 
          href="https://cal.com/signup" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
        >
          Sign up for Cal.com →
        </a>
      </div>
    </div>
  );
} 