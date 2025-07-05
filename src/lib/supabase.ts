import { createClient } from '@supabase/supabase-js';

// Check if environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Log Supabase configuration for debugging
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey.substring(0, 10) + '...');

// Create a single supabase client for the browser
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Use cookies for session storage
    storageKey: 'sb-auth-token',
    // Use cookies instead of localStorage
    storage: {
      getItem: (key) => {
        if (typeof document === 'undefined') return null;
        const value = document.cookie
          .split('; ')
          .find((row) => row.startsWith(`${key}=`))
          ?.split('=')[1];
        return value ? value : null;
      },
      setItem: (key, value) => {
        if (typeof document === 'undefined') return;
        document.cookie = `${key}=${value}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      },
      removeItem: (key) => {
        if (typeof document === 'undefined') return;
        document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      },
    },
  },
}); 