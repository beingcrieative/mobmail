'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Calendar, Bell, Shield, LogOut, Edit, ChevronRight, Settings, X, MessageSquare } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/mobile-v3/Header';
import BottomNavigation from '@/components/mobile-v3/BottomNavigation';
import MobileSettingsWizard from '@/components/mobile-v3/settings/MobileSettingsWizard';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  subscription: {
    plan: string;
    status: string;
    expiresAt: string;
  };
}

function ProfilePageContent() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    phone: ''
  });

  useEffect(() => {
    const initializeProfile = async () => {
      // Get user ID from localStorage
      const storedUserId = localStorage.getItem('userId') || 'user-123';
      setUserId(storedUserId);

      // Check if wizard should be shown
      const wizardParam = searchParams.get('wizard');
      const isNewUser = searchParams.get('newProfile') === 'true';
      
      if (wizardParam === 'true' || isNewUser) {
        setShowWizard(true);
      }

      // Try to fetch real user profile first
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const profileData = await response.json();
          
          // Check if profile is incomplete and should trigger wizard
          if (!profileData.name || !profileData.mobileNumber) {
            setShowWizard(true);
          }
          
          const realProfile: UserProfile = {
            name: profileData.name || 'Gebruiker',
            email: profileData.email || localStorage.getItem('userEmail') || 'gebruiker@voicemailai.nl',
            phone: profileData.mobileNumber || '+31 6 0000 0000',
            joinDate: profileData.created_at ? new Date(profileData.created_at).toISOString().split('T')[0] : '2024-01-15',
            subscription: {
              plan: 'Pro',
              status: 'active',
              expiresAt: '2025-01-15'
            }
          };
          
          setProfile(realProfile);
        } else {
          throw new Error('Profile not found');
        }
      } catch (error) {
        // Fall back to mock data if profile fetch fails
        console.log('Using mock profile data');
        
        const mockProfile: UserProfile = {
          name: 'Alex van der Berg',
          email: localStorage.getItem('userEmail') || 'alex@voicemailai.nl',
          phone: '+31 6 1234 5678',
          joinDate: '2024-01-15',
          subscription: {
            plan: 'Pro',
            status: 'active',
            expiresAt: '2025-01-15'
          }
        };
        
        setProfile(mockProfile);
        
        // Show wizard for new users even with mock data
        if (wizardParam === 'true' || isNewUser) {
          setShowWizard(true);
        }
      }
      
      setLoading(false);
    };

    initializeProfile();
  }, [searchParams]);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    // Clear cookies
    document.cookie = 'userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login');
  };

  const handleWizardComplete = () => {
    setShowWizard(false);
    localStorage.setItem('wizardComplete', 'true');
    // Refresh profile data after wizard completion
    window.location.reload();
  };

  const handleWizardClose = () => {
    setShowWizard(false);
    // Remove wizard parameter from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('wizard');
    url.searchParams.delete('newProfile');
    window.history.replaceState({}, '', url.toString());
  };

  const launchWizard = () => {
    setShowWizard(true);
  };

  const handleEditProfile = () => {
    if (profile) {
      setEditForm({
        name: profile.name,
        phone: profile.phone
      });
      setShowEditModal(true);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          companyName: '', // Keep existing or empty
          mobileNumber: editForm.phone,
          information: '', // Keep existing or empty
          calUsername: '', // Keep existing or empty
          calApiKey: '', // Keep existing or empty
          calEventTypeId: '' // Keep existing or empty
        })
      });

      if (response.ok) {
        // Update the profile state with new data
        setProfile(prev => prev ? {
          ...prev,
          name: editForm.name,
          phone: editForm.phone
        } : null);
        
        setShowEditModal(false);
        console.log('Profile updated successfully');
      } else {
        console.error('Failed to update profile');
        alert('Er is een fout opgetreden bij het bijwerken van je profiel.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Er is een fout opgetreden bij het bijwerken van je profiel.');
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditForm({
      name: '',
      phone: ''
    });
  };

  const settingsItems = [
    { 
      icon: Settings, 
      label: 'Setup Wizard', 
      sublabel: 'Configureer je voicemail instellingen stap voor stap',
      action: launchWizard
    },
    {
      icon: MessageSquare,
      label: 'Onboarding met AI-assistent',
      sublabel: 'Laat de agent je door de setup vragen leiden',
      action: async () => {
        // Start direct de agent met onboarding modus; API call doet de pagina zelf
        router.push('/mobile-v3/agent?source=onboarding');
      }
    },
    { 
      icon: Bell, 
      label: 'Meldingen', 
      sublabel: 'Push notifications en alerts',
      action: () => router.push('/mobile-v3/settings/notifications')
    },
    { 
      icon: Phone, 
      label: 'Voicemail instellingen', 
      sublabel: 'Configureer je voicemail',
      action: () => router.push('/mobile-v3/settings/voicemail')
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen clean-background flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
          ></div>
          <p style={{ color: 'var(--color-text-secondary)' }}>Profiel laden...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen clean-background flex items-center justify-center">
        <div className="text-center">
          <p style={{ color: 'var(--color-text-secondary)' }}>Kan profiel niet laden</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen clean-background pb-20">
      <Header title="Profiel" showBack />

      <div className="px-4 py-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="blabla-card mb-6"
        >
          <div className="flex items-center mb-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mr-4"
              style={{ 
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-text-white)'
              }}
            >
              <User size={28} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
              <p className="text-gray-600">{profile.email}</p>
              <p className="text-sm text-gray-500">Lid sinds {formatDate(profile.joinDate)}</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleEditProfile}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
              title="Profiel bewerken"
            >
              <Edit size={18} className="text-gray-600" />
            </motion.button>
          </div>

          {/* Subscription Status */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">{profile.subscription.plan} Abonnement</p>
                <p className="text-sm text-blue-600">
                  {profile.subscription.status === 'active' ? 'Actief' : 'Inactief'} 
                  {' '}- verloopt {formatDate(profile.subscription.expiresAt)}
                </p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </motion.div>


        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Instellingen</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {settingsItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.98 }}
                  onClick={item.action}
                  className={`w-full flex items-center p-4 text-left hover:bg-gray-50 transition-colors ${
                    index < settingsItems.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    <Icon size={18} className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.sublabel}</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Account Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={async () => {
                try {
                  const response = await fetch('/api/subscriptions/create-portal-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      userId: userId, 
                      returnUrl: window.location.origin + '/mobile-v3/profile?source=stripe' 
                    })
                  });
                  
                  const { url } = await response.json();
                  window.location.href = url;
                } catch (error) {
                  console.error('Error creating Stripe portal:', error);
                  router.push('/mobile-v3/subscription');
                }
              }}
              className="w-full flex items-center p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Calendar size={18} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Abonnement beheren</p>
                <p className="text-sm text-gray-500">Bekijk en beheer je abonnement via Stripe</p>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full flex items-center p-4 text-left hover:bg-red-50 transition-colors"
            >
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <LogOut size={18} className="text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-red-900">Uitloggen</p>
                <p className="text-sm text-red-600">Uitloggen van je account</p>
              </div>
              <ChevronRight size={18} className="text-red-400" />
            </motion.button>
          </div>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center text-gray-500 text-sm"
        >
          <p>VoicemailAI v1.0.0</p>
          <p className="mt-1">
            <span className="hover:text-blue-600 cursor-pointer">Privacy</span>
            {' '} • {' '}
            <span className="hover:text-blue-600 cursor-pointer">Voorwaarden</span>
            {' '} • {' '}
            <span className="hover:text-blue-600 cursor-pointer">Support</span>
          </p>
        </motion.div>
      </div>

      <BottomNavigation />
      
      {/* Settings Wizard */}
      {showWizard && (
        <MobileSettingsWizard
          userId={userId}
          userEmail={profile?.email || ''}
          onComplete={handleWizardComplete}
          onClose={handleWizardClose}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="blabla-card w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Profiel bewerken</h3>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCancelEdit}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
              >
                <X size={18} className="text-gray-600" />
              </motion.button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Naam
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefoonnummer
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancelEdit}
                  className="px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Annuleren
                </motion.button>
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.95 }}
                  className="blabla-button-primary px-6 py-3 text-sm font-medium"
                >
                  Opslaan
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen clean-background flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
          ></div>
          <p style={{ color: 'var(--color-text-secondary)' }}>Laden...</p>
        </div>
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  );
}