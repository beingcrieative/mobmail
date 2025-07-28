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
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--va-bg-login)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-16">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="p-2 rounded-full backdrop-blur-sm shadow-sm"
          style={{ background: 'rgba(255, 255, 255, 0.9)', color: 'var(--va-indigo-dye)' }}
        >
          <ArrowLeft size={20} />
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
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(22, 138, 173, 0.1)' }}
            >
              <Mail size={32} style={{ color: 'var(--va-bondi-blue)' }} />
            </div>
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ color: 'var(--va-indigo-dye)' }}
            >
              Welkom terug bij VoicemailAI
            </h1>
            <p style={{ color: 'var(--va-lapis-lazuli)' }}>
              Jouw ZZP business assistent wacht op je 💼
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
              <label 
                htmlFor="email" 
                className="block text-sm font-medium"
                style={{ color: 'var(--va-indigo-dye)' }}
              >
                E-mailadres
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-4 bg-white rounded-2xl focus:outline-none transition-all duration-200 text-lg"
                  style={{
                    border: '2px solid var(--va-keppel)',
                    color: 'var(--va-indigo-dye)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--va-bondi-blue)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22, 138, 173, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--va-keppel)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="naam@voorbeeld.nl"
                />
                <Mail size={20} className="absolute right-4 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--va-verdigris)' }} />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="block text-sm font-medium"
                style={{ color: 'var(--va-indigo-dye)' }}
              >
                Wachtwoord
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-4 bg-white rounded-2xl focus:outline-none transition-all duration-200 text-lg pr-12"
                  style={{
                    border: '2px solid var(--va-keppel)',
                    color: 'var(--va-indigo-dye)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--va-bondi-blue)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22, 138, 173, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--va-keppel)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="Je wachtwoord"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  style={{ color: 'var(--va-verdigris)' }}
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
                className="text-sm font-medium"
                style={{ color: 'var(--va-bondi-blue)' }}
              >
                Wachtwoord vergeten?
              </button>
            </div>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full py-4 text-white font-semibold rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center"
              style={{
                background: loading || !email.trim() || !password.trim() 
                  ? '#D1D5DB' 
                  : 'var(--va-gradient-professional)',
                cursor: loading || !email.trim() || !password.trim() ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!loading && email.trim() && password.trim()) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(22, 138, 173, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              }}
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
            <p style={{ color: 'var(--va-lapis-lazuli)' }}>
              Nog geen account?{' '}
              <button
                onClick={() => router.push('/register')}
                className="font-medium"
                style={{ color: 'var(--va-bondi-blue)' }}
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