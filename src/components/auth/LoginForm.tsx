"use client";

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { getSupabase } from '@/lib/supabase';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting to sign in with:', email);
      
      const supabase = getSupabase();
      if (!supabase) {
        toast.error('Authentication service is currently unavailable');
        setLoading(false);
        return;
      }
      
      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        toast.error(error.message);
        setLoading(false);
        return;
      }

      if (data?.session) {
        console.log('Login successful, session established:', data.session.user.email);
        
        // Store the session in localStorage as a backup
        localStorage.setItem('supabase.auth.token', JSON.stringify(data.session));
        
        // Store the user ID and email in localStorage for direct access
        localStorage.setItem('userId', data.session.user.id);
        localStorage.setItem('userEmail', data.session.user.email || '');
        
        // Set cookies for server-side access
        document.cookie = `userId=${data.session.user.id}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        document.cookie = `userEmail=${data.session.user.email || ''}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        document.cookie = `authToken=${data.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        
        // Check if user profile exists and has required fields
        try {
          const profileResponse = await fetch('/api/user/profile', {
            headers: {
              'Authorization': `Bearer ${data.session.access_token}`
            }
          });
          
          // If profile not found or incomplete, redirect to settings
          if (profileResponse.status === 404) {
            toast.success('Succesvol ingelogd! Vul alsjeblieft je voicemail instellingen in.');
            
            // Add a small delay to ensure cookies are set before navigation
            setTimeout(() => {
              window.location.href = '/dashboard/settings?newProfile=true';
            }, 500);
            return;
          }
          
          // If we can retrieve the profile but it's incomplete
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            
            // Check if essential profile fields are missing
            if (!profileData.name || !profileData.mobileNumber) {
              toast.success('Succesvol ingelogd! Vul alsjeblieft je voicemail instellingen in.');
              
              // Add a small delay to ensure cookies are set before navigation
              setTimeout(() => {
                window.location.href = '/dashboard/settings?newProfile=true';
              }, 500);
              return;
            }
          }
        } catch (error) {
          console.error('Error checking user profile:', error);
          // Continue with normal login flow despite profile check error
        }
        
        toast.success('Succesvol ingelogd!');
        
        // Add a small delay to ensure cookies are set before navigation
        setTimeout(() => {
          // Use a hard navigation to ensure the session is properly recognized
          window.location.href = '/dashboard';
        }, 500);
      } else {
        console.error('No session returned after login');
        toast.error('Inloggen mislukt. Probeer het opnieuw.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast.error('Er is een fout opgetreden tijdens het inloggen.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Inloggen</h2>
      <form onSubmit={handleLogin} className="space-y-4">
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
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Wachtwoord
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Voer je wachtwoord in"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link href="/forgot-password" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              Wachtwoord vergeten?
            </Link>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Bezig met inloggen...' : 'Inloggen'}
        </button>
      </form>
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Nog geen account?{' '}
          <Link href="/register" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
            Registreren
          </Link>
        </p>
      </div>
    </div>
  );
}