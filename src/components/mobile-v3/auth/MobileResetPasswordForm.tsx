'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

export default function MobileResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if we have the access token in the URL (Supabase adds these params)
    const hasResetParams = window.location.hash.includes('access_token');
    
    if (!hasResetParams) {
      toast.error('Ongeldige of verlopen reset link. Vraag een nieuwe aan.');
      router.push('/mobile-v3/auth/forgot-password');
    }
  }, [router]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error('Wachtwoord moet minimaal 6 tekens bevatten');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Wachtwoorden komen niet overeen');
      return;
    }
    
    setLoading(true);
    
    try {
      const supabase = getSupabase();
      if (!supabase) {
        toast.error('Authentication service is currently unavailable');
        setLoading(false);
        return;
      }
      
      // Use Supabase's update password functionality
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        console.error('Password reset error:', error.message);
        toast.error(error.message);
        return;
      }

      // Success!
      toast.success('Je wachtwoord is succesvol gewijzigd.');
      setSuccess(true);
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/mobile-v3/auth/login');
      }, 3000);
    } catch (error) {
      console.error('Unexpected error during password reset:', error);
      toast.error('Er is een fout opgetreden bij het wijzigen van je wachtwoord.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pt-16">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/mobile-v3/auth/login')}
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
              Wachtwoord gewijzigd!
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 leading-relaxed mb-8"
            >
              Je wachtwoord is succesvol gewijzigd. Je wordt nu doorgestuurd naar de inlogpagina.
            </motion.p>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/mobile-v3/auth/login')}
              className="w-full py-4 bg-green-600 text-white font-semibold rounded-2xl shadow-lg"
            >
              Ga naar inloggen
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
            <Lock size={32} className="text-blue-600" />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Nieuw wachtwoord
            </h1>
            <p className="text-gray-600">
              Voer je nieuwe wachtwoord in om je account te beveiligen.
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleResetPassword}
            className="space-y-6"
          >
            {/* New Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Nieuw wachtwoord
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg pr-12"
                  placeholder="Minimaal 6 tekens"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Bevestig wachtwoord
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg pr-12"
                  placeholder="Herhaal je wachtwoord"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Vereisten:</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                <li className={password.length >= 6 ? 'text-green-700' : ''}>
                  • Minimaal 6 tekens {password.length >= 6 && '✓'}
                </li>
                <li className={password === confirmPassword && password.length > 0 ? 'text-green-700' : ''}>
                  • Wachtwoorden moeten overeenkomen {password === confirmPassword && password.length > 0 && '✓'}
                </li>
              </ul>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || password.length < 6 || password !== confirmPassword}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Wijzigen...</span>
                </div>
              ) : (
                'Wachtwoord wijzigen'
              )}
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}