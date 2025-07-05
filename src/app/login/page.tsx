import LoginForm from '@/components/auth/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inloggen | VoicemailAI',
  description: 'Log in op je VoicemailAI account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">VoicemailAI</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Log in op je account om toegang te krijgen tot je dashboard
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
} 