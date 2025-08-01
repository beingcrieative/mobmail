import RegisterForm from '@/components/auth/RegisterForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registreren | VoicemailAI',
  description: 'Maak een nieuw VoicemailAI account aan',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">VoicemailAI</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Maak een account aan om toegang te krijgen tot alle functies
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}