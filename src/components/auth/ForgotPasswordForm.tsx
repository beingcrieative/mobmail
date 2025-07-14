"use client";

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { getSupabase } from '@/lib/supabase';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = getSupabase();
      if (!supabase) {
        toast.error('Authentication service is currently unavailable');
        setLoading(false);
        return;
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error.message);
        toast.error(error.message);
        setLoading(false);
        return;
      }

      toast.success('Controleer je e-mail voor instructies om je wachtwoord te resetten.');
      setSubmitted(true);
    } catch (error) {
      console.error('Unexpected error during password reset:', error);
      toast.error('Er is een fout opgetreden. Probeer het later opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">E-mail verstuurd!</h2>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              We hebben een e-mail gestuurd naar:
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <p className="font-medium text-blue-900 dark:text-blue-300">{email}</p>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Controleer je inbox en volg de link in de e-mail om je wachtwoord te wijzigen.
            </p>
          </div>
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Wachtwoord vergeten?</h2>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
        Geen probleem! Voer je e-mailadres in en we sturen je instructies om je wachtwoord te resetten.
      </p>
      
      <form onSubmit={handlePasswordReset} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            E-mailadres
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Voer je e-mailadres in"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          {loading ? 'Bezig met verzenden...' : 'Reset wachtwoord'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Weet je je wachtwoord weer?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
            Terug naar inloggen
          </Link>
        </p>
      </div>
    </div>
  );
}