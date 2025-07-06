import { createClient } from '@supabase/supabase-js';

let supabaseInstance: any = null;
let supabaseAdminInstance: any = null;

// Get Supabase client with lazy loading (for browser/client-side)
export function getSupabase() {
  // Return cached instance if available
  if (supabaseInstance) {
    return supabaseInstance;
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables for client:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      url: supabaseUrl?.substring(0, 30) + '...',
      keyStart: supabaseAnonKey?.substring(0, 10) + '...'
    });
    return null;
  }

  // Validate that the key is not a placeholder
  if (supabaseAnonKey === 'your_supabase_anon_key_here' || supabaseAnonKey.includes('your_')) {
    console.error('Supabase anon key appears to be a placeholder value');
    return null;
  }

  // Log Supabase configuration for debugging (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Key:', supabaseAnonKey.substring(0, 10) + '...');
  }

  // Create and cache the Supabase instance
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
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
  
  return supabaseInstance;
}

// Get Supabase admin client with service role key (for server-side/API routes)
export function getSupabaseAdmin() {
  // Return cached instance if available
  if (supabaseAdminInstance) {
    return supabaseAdminInstance;
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables for admin client:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey
    });
    return null;
  }

  // Validate that the service key is not a placeholder
  if (supabaseServiceKey === 'your_supabase_service_role_key_here' || supabaseServiceKey.includes('your_')) {
    console.error('Supabase service role key appears to be a placeholder value');
    return null;
  }

  // Create and cache the Supabase admin instance
  supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey);
  
  return supabaseAdminInstance;
}

// For backwards compatibility, export default as getSupabase
export const supabase = getSupabase; 