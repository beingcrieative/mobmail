'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

export default function MobileForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = getSupabase();
      if (!supabase) {
        toast.error('Authentication service is currently unavailable');
        setLoading(false);
        return;
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/mobile-v3/auth/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error.message);
        toast.error(error.message);
        setLoading(false);
        return;
      }

      toast.success('Controleer je e-mail voor instructies om je wachtwoord te resetten.');
      setSubmitted(true);
    } catch (error) {
      console.error('Unexpected error during password reset:', error);
      toast.error('Er is een fout opgetreden. Probeer het later opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pt-16">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </motion.button>
        </div>

        {/* Success Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle size={40} className="text-green-600" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-gray-900 mb-4"
            >
              E-mail verstuurd!
            </motion.h2>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <p className="text-gray-600 leading-relaxed">
                We hebben een e-mail gestuurd naar
              </p>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="font-medium text-blue-900">{email}</p>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Controleer je inbox en volg de link in de e-mail om je wachtwoord te wijzigen.
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/mobile-v3/auth/login')}
              className="w-full mt-8 py-4 bg-blue-600 text-white font-semibold rounded-2xl shadow-lg"
            >
              Terug naar inloggen
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-16">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </motion.button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <Mail size={32} className="text-blue-600" />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Wachtwoord vergeten?
            </h1>
            <p className="text-gray-600">
              Geen probleem! Voer je e-mailadres in en we sturen je instructies om je wachtwoord te resetten.
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onSubmit={handlePasswordReset}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-mailadres
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                  placeholder="naam@voorbeeld.nl"
                />
                <Mail size={20} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Versturen...</span>
                </div>
              ) : (
                'Reset wachtwoord'
              )}
            </motion.button>
          </motion.form>

          {/* Back to Login */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-6"
          >
            <button
              onClick={() => router.push('/mobile-v3/auth/login')}
              className="text-blue-600 font-medium"
            >
              Terug naar inloggen
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}