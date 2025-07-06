'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface AuthStatusProps {
  showDetails?: boolean;
}

export default function AuthStatus({ showDetails = false }: AuthStatusProps) {
  const { isAuthenticated, user, loading, error } = useAuth();

  if (!showDetails && !loading && !error) {
    return null;
  }

  return (
    <div className="mb-4">
      {loading && (
        <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
          <Loader size={16} className="animate-spin" />
          <span className="text-sm">Authenticatie controleren...</span>
        </div>
      )}
      
      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
          <AlertCircle size={16} />
          <span className="text-sm">Fout: {error}</span>
        </div>
      )}
      
      {showDetails && isAuthenticated && user && (
        <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
          <CheckCircle size={16} />
          <span className="text-sm">Ingelogd als {user.email}</span>
        </div>
      )}
    </div>
  );
}