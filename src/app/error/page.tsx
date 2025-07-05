import Link from 'next/link';

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          Configuration Error
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          There was a problem with the application configuration. The Supabase environment variables are missing or invalid.
        </p>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Please make sure your <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">.env.local</code> file 
          contains the required Supabase configuration.
        </p>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-6">
          <pre className="text-sm text-gray-800 dark:text-gray-300 whitespace-pre-wrap">
            NEXT_PUBLIC_SUPABASE_URL=your-supabase-url{'\n'}
            NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
          </pre>
        </div>
        <Link 
          href="/"
          className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md text-center transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
} 