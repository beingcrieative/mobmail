"use client";

import { useState } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ErrorBoundary({ 
  children, 
  fallback = <DefaultErrorFallback /> 
}: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <>{fallback}</>;
  }

  return (
    <div
      onError={(e) => {
        e.preventDefault();
        setHasError(true);
        console.error('Error caught by ErrorBoundary:', e);
      }}
    >
      {children}
    </div>
  );
}

function DefaultErrorFallback() {
  return (
    <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center">
      <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Er is iets misgegaan</h3>
      <p className="text-red-600 dark:text-red-400 mb-4">
        Er is een fout opgetreden bij het laden van deze pagina. Probeer het later opnieuw.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md"
      >
        Pagina vernieuwen
      </button>
    </div>
  );
} 