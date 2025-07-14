"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { getSupabase } from '@/lib/supabase';

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasValidSession, setHasValidSession] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user has valid reset session
    const checkSession = async () => {
      const supabase = getSupabase();
      if (!supabase) return;
      
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setHasValidSession(true);
      }
    };
    
    checkSession();
  }, []);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Wachtwoorden komen niet overeen');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Wachtwoord moet minimaal 6 karakters lang zijn');
      return;
    }
    
    setLoading(true);

    try {
      const supabase = getSupabase();
      if (!supabase) {
        toast.error('Authentication service is currently unavailable');
        setLoading(false);
        return;
      }
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Password update error:', error.message);
        toast.error(error.message);
        setLoading(false);
        return;
      }

      toast.success('Je wachtwoord is succesvol bijgewerkt!');
      
      // Redirect to login page
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Unexpected error during password reset:', error);
      toast.error('Er is een fout opgetreden. Probeer het later opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  if (!hasValidSession) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Ongeldige of verlopen link</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            De link om je wachtwoord te resetten is ongeldig of verlopen. 
            Vraag een nieuwe wachtwoord reset aan.
          </p>
          <div className="space-x-4">
            <Link
              href="/forgot-password"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Nieuwe link aanvragen
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Terug naar inloggen
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Nieuw wachtwoord instellen</h2>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
        Voer je nieuwe wachtwoord in om je account toegang te herstellen.
      </p>
      
      <form onSubmit={handlePasswordReset} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nieuw wachtwoord
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Voer je nieuwe wachtwoord in"
          />
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bevestig wachtwoord
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Herhaal je nieuwe wachtwoord"
          />
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>Je wachtwoord moet minimaal 6 karakters lang zijn.</p>
        </div>
        
        <button
          type="submit"
          disabled={loading || !password.trim() || !confirmPassword.trim()}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          {loading ? 'Bezig met bijwerken...' : 'Wachtwoord bijwerken'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <Link href="/login" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
            Terug naar inloggen
          </Link>
        </p>
      </div>
    </div>
  );
}