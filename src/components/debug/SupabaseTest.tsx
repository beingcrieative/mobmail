'use client';

import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';

export default function SupabaseTest() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testSupabaseConnection = async () => {
    setLoading(true);
    try {
      const supabase = getSupabase();
      
      if (!supabase) {
        setTestResult({
          success: false,
          error: 'Supabase client could not be created',
          details: 'Check environment variables'
        });
        return;
      }

      // Test a simple auth call
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        setTestResult({
          success: false,
          error: error.message,
          details: 'Auth session test failed'
        });
      } else {
        setTestResult({
          success: true,
          message: 'Supabase connection working',
          hasSession: !!data.session
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message,
        details: 'Unexpected error during test'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testSupabaseConnection();
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="font-bold text-sm mb-2">Supabase Connection Test</h3>
      
      {loading ? (
        <div className="text-sm text-gray-600">Testing connection...</div>
      ) : testResult ? (
        <div className={`text-sm ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
          <div>{testResult.success ? '✅' : '❌'} {testResult.message || testResult.error}</div>
          {testResult.details && (
            <div className="text-xs text-gray-500 mt-1">{testResult.details}</div>
          )}
          {testResult.hasSession !== undefined && (
            <div className="text-xs text-gray-500 mt-1">
              Session: {testResult.hasSession ? 'Active' : 'None'}
            </div>
          )}
        </div>
      ) : null}
      
      <button
        onClick={testSupabaseConnection}
        disabled={loading}
        className="mt-2 px-2 py-1 bg-blue-600 text-white text-xs rounded disabled:opacity-50"
      >
        Test Again
      </button>
    </div>
  );
}