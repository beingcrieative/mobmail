"use client";

import { useState, useEffect } from "react";
import CalendarEmbed from "./CalendarEmbed";
import CalendarSetup from "./CalendarSetup";

interface CalendarProps {
  userId: string;
  userEmail: string;
}

export default function Calendar({ userId, userEmail }: CalendarProps) {
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [calUsername, setCalUsername] = useState("");
  const [calApiKey, setCalApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    // Check if the user has connected their Cal.com account
    const storedUsername = localStorage.getItem(`cal_username_${userId}`);
    const storedApiKey = localStorage.getItem(`cal_api_key_${userId}`);
    
    if (storedUsername) {
      setCalUsername(storedUsername);
      setCalApiKey(storedApiKey);
      setCalendarConnected(true);
    }
    setLoading(false);
    
    // Listen for the custom event to edit calendar settings
    const handleEditCalendarSettings = () => {
      console.log("Edit calendar settings event received");
      setCalendarConnected(false); // This will show the setup screen
    };
    
    // Add event listener
    window.addEventListener('editCalendarSettings', handleEditCalendarSettings);
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('editCalendarSettings', handleEditCalendarSettings);
    };
  }, [userId]);

  const handleSetupComplete = (username: string, apiKey: string | null) => {
    setCalUsername(username);
    setCalApiKey(apiKey);
    setCalendarConnected(true);
    setShowOptions(false);
  };

  const handleDisconnect = () => {
    localStorage.removeItem(`cal_username_${userId}`);
    localStorage.removeItem(`cal_api_key_${userId}`);
    setCalUsername("");
    setCalApiKey(null);
    setCalendarConnected(false);
    setShowOptions(false);
  };

  const handleRetry = () => {
    // Force a re-render of the calendar embed
    setCalendarConnected(false);
    setTimeout(() => {
      setCalendarConnected(true);
    }, 100);
    setShowOptions(false);
  };

  const handleEditSettings = () => {
    setCalendarConnected(false);
    setShowOptions(false);
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mt-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Jouw Agenda</h2>
        
        <div className="flex space-x-4">
          {calendarConnected && (
            <>
              <button
                onClick={handleEditSettings}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Edit Settings
              </button>
              <button
                onClick={handleDisconnect}
                className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                Disconnect Calendar
              </button>
            </>
          )}
        </div>
      </div>
      
      {calendarConnected ? (
        <div>
          <CalendarEmbed 
            userId={userEmail} 
            calUsername={calUsername}
            calApiKey={calApiKey}
          />
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex justify-between items-center">
              <p>
                Having trouble? Make sure your Cal.com username is correct. 
                Current username: <span className="font-medium">{calUsername}</span>
                {calApiKey ? (
                  <span className="ml-2 text-green-600 dark:text-green-400">(API key provided)</span>
                ) : (
                  <span className="ml-2">(No API key provided)</span>
                )}
              </p>
              <button
                onClick={toggleOptions}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
              >
                {showOptions ? 'Hide options' : 'Show options'}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-4 w-4 ml-1 transform ${showOptions ? 'rotate-180' : ''} transition-transform`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            {showOptions && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Calendar Options</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleRetry}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Reload Calendar
                  </button>
                  <button
                    onClick={handleEditSettings}
                    className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    Edit Calendar Settings
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="w-full py-2 px-4 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  >
                    Disconnect Calendar
                  </button>
                </div>
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  If you're having issues with the calendar, try reloading it first. If problems persist, you can edit your settings or disconnect and reconnect your calendar.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <CalendarSetup userId={userId} onSetupComplete={handleSetupComplete} />
      )}
    </div>
  );
} 