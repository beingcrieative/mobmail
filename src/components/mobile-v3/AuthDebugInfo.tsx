'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function AuthDebugInfo() {
  const { isAuthenticated, user, loading, error } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [storageInfo, setStorageInfo] = useState<any>({});

  useEffect(() => {
    const checkStorage = () => {
      try {
        const info = {
          localStorage: {
            userId: localStorage.getItem('userId'),
            userEmail: localStorage.getItem('userEmail'),
            authToken: localStorage.getItem('authToken')?.substring(0, 20) + '...',
            supabaseSession: !!localStorage.getItem('supabase.auth.token')
          },
          cookies: {
            userId: getCookie('userId'),
            userEmail: getCookie('userEmail'),
            authToken: getCookie('authToken')?.substring(0, 20) + '...'
          }
        };
        setStorageInfo(info);
      } catch (err) {
        console.error('Error reading storage:', err);
      }
    };

    checkStorage();
    const interval = setInterval(checkStorage, 1000);
    return () => clearInterval(interval);
  }, []);

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue || null;
    }
    return null;
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-mono shadow-lg"
      >
        🔍 Auth Debug
      </button>
      
      {expanded && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-w-sm text-xs font-mono">
          <div className="space-y-2">
            <div>
              <strong>Auth State:</strong>
              <div className="ml-2">
                <div>Loading: {loading ? '✅' : '❌'}</div>
                <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
                <div>User ID: {user?.id || 'null'}</div>
                <div>Email: {user?.email || 'null'}</div>
                <div>Error: {error || 'null'}</div>
              </div>
            </div>
            
            <div>
              <strong>LocalStorage:</strong>
              <div className="ml-2">
                <div>UserId: {storageInfo.localStorage?.userId || 'null'}</div>
                <div>Email: {storageInfo.localStorage?.userEmail || 'null'}</div>
                <div>Token: {storageInfo.localStorage?.authToken || 'null'}</div>
                <div>Session: {storageInfo.localStorage?.supabaseSession ? '✅' : '❌'}</div>
              </div>
            </div>
            
            <div>
              <strong>Cookies:</strong>
              <div className="ml-2">
                <div>UserId: {storageInfo.cookies?.userId || 'null'}</div>
                <div>Email: {storageInfo.cookies?.userEmail || 'null'}</div>
                <div>Token: {storageInfo.cookies?.authToken || 'null'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}