import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
    company_name?: string;
    mobile_number?: string;
    additional_info?: string;
  };
}

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      try {
        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error fetching user:', error);
          if (mounted) setUser(null);
        } else if (authUser) {
          if (mounted) setUser(authUser as UserProfile);
        } else {
          if (mounted) setUser(null);
        }
      } catch (error) {
        console.error('Error in useUser:', error);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (mounted) {
        setUser(session?.user as UserProfile || null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
} 