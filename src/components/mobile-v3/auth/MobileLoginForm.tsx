'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

export default function MobileLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log('Attempting to sign in with:', email);
      
      const success = await login(email, password);
      
      if (success) {
        console.log('Login successful via useAuth hook');
        
        // Check if user profile exists and has required fields
        try {
          const profileResponse = await fetch('/api/user/profile');
          
          // If profile not found or incomplete, redirect to mobile settings wizard
          if (profileResponse.status === 404) {
            toast.success('Succesvol ingelogd! Vul alsjeblieft je voicemail instellingen in.');
            
            // Add a small delay to ensure authentication state is updated
            setTimeout(() => {
              router.push('/mobile-v3/profile?wizard=true');
            }, 500);
            return;
          }
          
          // If we can retrieve the profile but it's incomplete
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            
            // Check if essential profile fields are missing
            if (!profileData.name || !profileData.mobileNumber) {
              toast.success('Succesvol ingelogd! Vul alsjeblieft je voicemail instellingen in.');
              
              setTimeout(() => {
                router.push('/mobile-v3/profile?wizard=true');
              }, 500);
              return;
            }
          }
        } catch (error) {
          console.error('Error checking user profile:', error);
          // Continue with normal login flow despite profile check error
        }
        
        toast.success('Succesvol ingelogd!');
        
        // Navigate to mobile dashboard
        setTimeout(() => {
          router.push('/mobile-v3');
        }, 500);
      } else {
        // Error handling is done by the useAuth hook
        if (error) {
          toast.error(error);
        } else {
          toast.error('Inloggen mislukt. Probeer het opnieuw.');
        }
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast.error('Er is een fout opgetreden tijdens het inloggen.');
    }
  };

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
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={32} className="text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welkom terug
            </h1>
            <p className="text-gray-600">
              Log in om je voicemails te beheren
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleLogin}
            className="space-y-6"
          >
            {/* Email */}
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

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Wachtwoord
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg pr-12"
                  placeholder="Je wachtwoord"
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

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => router.push('/mobile-v3/auth/forgot-password')}
                className="text-sm text-blue-600 font-medium"
              >
                Wachtwoord vergeten?
              </button>
            </div>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Inloggen...</span>
                </div>
              ) : (
                'Inloggen'
              )}
            </motion.button>
          </motion.form>

          {/* Register Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-8"
          >
            <p className="text-gray-600">
              Nog geen account?{' '}
              <button
                onClick={() => router.push('/register')}
                className="text-blue-600 font-medium"
              >
                Registreren
              </button>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}