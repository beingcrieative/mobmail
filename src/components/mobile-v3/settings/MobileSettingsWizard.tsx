'use client';

import { useState, useEffect } from 'react';
import { motion, PanInfo, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { ChevronLeft, ChevronRight, Check, ArrowRight, Phone, User, Building, Calendar, Settings, X } from 'lucide-react';

interface SettingsWizardProps {
  userId: string;
  userEmail: string;
  onComplete: () => void;
  onClose: () => void;
}

interface WizardData {
  // Profile fields
  name: string;
  companyName: string;
  mobileNumber: string;
  information: string;
  calUsername: string;
  calApiKey: string;
  calEventTypeId: string;
  // Company fields (matching UserProfileForm)
  companyEmail: string;
  companyInfo: string;
  companyOpeningHours: string;
}

const STEPS = [
  {
    id: 'welcome',
    title: 'Welkom bij VoicemailAI',
    description: 'Laten we je voicemail instellingen stap voor stap configureren',
    icon: Settings,
  },
  {
    id: 'profile',
    title: 'Profielgegevens',
    description: 'Vul je persoonlijke en bedrijfsgegevens in',
    icon: User,
  },
  {
    id: 'contact',
    title: 'Contactgegevens',
    description: 'Je telefoonnummer en emailadres voor klantcontact',
    icon: Phone,
  },
  {
    id: 'business',
    title: 'Zakelijke Informatie',
    description: 'Openingstijden voor je bedrijf',
    icon: Building,
  },
  {
    id: 'company',
    title: 'Bedrijfsinformatie',
    description: 'Vertel iets over je bedrijf',
    icon: Building,
  },
  {
    id: 'voicemail',
    title: 'Voicemail Informatie',
    description: 'Informatie voor voicemail berichten',
    icon: Phone,
  },
  {
    id: 'complete',
    title: 'Setup Voltooid',
    description: 'Je voicemail is klaar voor gebruik',
    icon: Check,
  },
];

export default function MobileSettingsWizard({ userId, userEmail, onComplete, onClose }: SettingsWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<WizardData>({
    name: '',
    companyName: '',
    mobileNumber: '',
    information: '',
    calUsername: '',
    calApiKey: '',
    calEventTypeId: '',
    companyEmail: '',
    companyInfo: '',
    companyOpeningHours: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);

  // Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const profileData = await response.json();
          setData({
            name: profileData.name || '',
            companyName: profileData.companyName || '',
            mobileNumber: profileData.mobileNumber || '',
            information: profileData.information || '',
            calUsername: profileData.calUsername || '',
            calApiKey: profileData.calApiKey || '',
            calEventTypeId: profileData.calEventTypeId || '',
            companyEmail: profileData.companyEmail || '',
            companyInfo: profileData.companyInfo || '',
            companyOpeningHours: profileData.companyOpeningHours || '',
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, []);

  const handleInputChange = (field: keyof WizardData, value: string) => {
    setData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSwipe = (event: any, info: PanInfo) => {
    const { offset } = info;
    const swipeThreshold = 50;

    if (Math.abs(offset.x) > swipeThreshold) {
      if (offset.x > 0 && currentStep > 0) {
        // Swipe right - go to previous step
        handlePrevious();
      } else if (offset.x < 0 && currentStep < STEPS.length - 1 && canProceed()) {
        // Swipe left - go to next step
        handleNext();
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Fout bij het opslaan van profiel');
      }

      // Store Cal.com credentials in localStorage
      if (data.calUsername) {
        localStorage.setItem(`cal_username_${userId}`, data.calUsername);
        if (data.calApiKey) {
          localStorage.setItem(`cal_api_key_${userId}`, data.calApiKey);
        }
        if (data.calEventTypeId) {
          localStorage.setItem(`cal_event_type_id_${userId}`, data.calEventTypeId);
        }
      }

      toast.success('Profiel succesvol opgeslagen!');
      onComplete();
    } catch (error: any) {
      toast.error(`Fout bij het opslaan: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    switch (STEPS[currentStep].id) {
      case 'profile':
        return data.name.trim().length > 0;
      case 'contact':
        return data.mobileNumber.trim().length > 0;
      case 'business':
        return true; // Optional step
      case 'company':
        return true; // Optional step
      case 'voicemail':
        return true; // Optional step
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    const step = STEPS[currentStep];

    switch (step.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6 px-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto"
            >
              <Settings className="w-10 h-10 text-blue-600" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welkom bij VoicemailAI
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Deze wizard helpt je om je voicemail instellingen stap voor stap te configureren. 
                Het duurt slechts een paar minuten om alles in te stellen.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Swipe naar links om verder te gaan, naar rechts om terug te gaan.
              </p>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6 px-4">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Profielgegevens
              </h3>
              <p className="text-gray-600">
                Vul je persoonlijke en bedrijfsgegevens in voor professionele voicemail berichten.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Volledige Naam *
                </label>
                <input
                  id="name"
                  type="text"
                  value={data.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                  placeholder="Bijv. Jan Jansen"
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  Je naam wordt gebruikt in de welkomstekst
                </p>
              </div>

              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrijfsnaam
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={data.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                  placeholder="Bijv. Mijn Bedrijf BV"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Optioneel: Voor professionele voicemail berichten
                </p>
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6 px-4">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Contactgegevens
              </h3>
              <p className="text-gray-600">
                Je telefoonnummer en emailadres voor klantcontact.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Mobiel Telefoonnummer *
                </label>
                <input
                  id="mobileNumber"
                  type="tel"
                  value={data.mobileNumber}
                  onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                  className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                  placeholder="+31 6 12345678"
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  Dit nummer wordt gebruikt voor doorschakeling (begin met landcode)
                </p>
              </div>

              <div>
                <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Emailadres
                </label>
                <input
                  id="companyEmail"
                  type="email"
                  value={data.companyEmail}
                  onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                  className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                  placeholder="info@mijnbedrijf.nl"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Optioneel: Voor klantvragen via email
                </p>
              </div>
            </div>
          </div>
        );

      case 'business':
        return (
          <div className="space-y-6 px-4">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Zakelijke Informatie
              </h3>
              <p className="text-gray-600">
                Optioneel: Openingstijden van je bedrijf.
              </p>
            </div>

            <div>
              <label htmlFor="companyOpeningHours" className="block text-sm font-medium text-gray-700 mb-2">
                Openingstijden
              </label>
              <textarea
                id="companyOpeningHours"
                value={data.companyOpeningHours}
                onChange={(e) => handleInputChange('companyOpeningHours', e.target.value)}
                rows={4}
                className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg resize-none"
                placeholder="Bijv. Maandag t/m vrijdag van 9:00 tot 17:00"
              />
              <p className="mt-2 text-sm text-gray-500">
                Deze informatie wordt gebruikt voor klantvragen over openingstijden
              </p>
            </div>
          </div>
        );

      case 'company':
        return (
          <div className="space-y-6 px-4">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Bedrijfsinformatie
              </h3>
              <p className="text-gray-600">
                Vertel iets over je bedrijf.
              </p>
            </div>
            
            <div>
              <label htmlFor="companyInfo" className="block text-sm font-medium text-gray-700 mb-2">
                Bedrijfsinformatie
              </label>
              <textarea
                id="companyInfo"
                value={data.companyInfo}
                onChange={(e) => handleInputChange('companyInfo', e.target.value)}
                rows={4}
                className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg resize-none"
                placeholder="Bijv. Mijn Bedrijf BV is een innovatief bedrijf dat zich richt op het leveren van hoogwaardige voicemail services."
              />
              <p className="mt-2 text-sm text-gray-500">
                Deze informatie wordt gebruikt voor persoonlijkere voicemail berichten
              </p>
            </div>
          </div>
        );

      case 'voicemail':
        return (
          <div className="space-y-6 px-4">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Extra Informatie
              </h3>
              <p className="text-gray-600">
                Informatie waarop je assistent je klanten kan helpen
              </p>
            </div>
            
            <div>
              <label htmlFor="information" className="block text-sm font-medium text-gray-700 mb-2">
                Extra Informatie
              </label>
              <textarea
                id="information"
                value={data.information}
                onChange={(e) => handleInputChange('information', e.target.value)}
                rows={4}
                className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg resize-none"
                placeholder="Bijv. Ik ben beschikbaar op werkdagen tussen 9:00 en 17:00 uur. Voor spoedgevallen kunt u mij bereiken op mijn mobiel."
              />
              <p className="mt-2 text-sm text-gray-500">
                Deze informatie wordt gebruikt voor persoonlijkere voicemail berichten
              </p>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6 px-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
            >
              <Check className="w-10 h-10 text-green-600" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Setup Voltooid!
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Je basis voicemail instellingen zijn succesvol geconfigureerd. Je kunt nu gebruik maken van VoicemailAI.
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <h4 className="font-medium text-green-800 mb-2">
                Volgende stappen:
              </h4>
              <ul className="text-sm text-green-700 space-y-1 text-left">
                <li>• Ga naar de "Instellingen" voor doorschakeling</li>
                <li>• Test je setup door je eigen nummer te bellen</li>
                <li>• Bekijk je voicemail berichten in het dashboard</li>
                <li>• Configureer optionele Cal.com integratie indien gewenst</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-16 bg-white border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            {(() => {
              const IconComponent = STEPS[currentStep].icon;
              return <IconComponent className="w-4 h-4 text-blue-600" />;
            })()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {STEPS[currentStep].title}
            </h2>
            <p className="text-sm text-gray-500">
              Stap {currentStep + 1} van {STEPS.length}
            </p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="p-2 rounded-full bg-gray-100"
        >
          <X className="w-5 h-5 text-gray-600" />
        </motion.button>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex space-x-1">
          {STEPS.map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                index <= currentStep
                  ? 'bg-blue-600'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <motion.div
          key={currentStep}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleSwipe}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="h-full flex items-center justify-center py-8"
        >
          <div className="w-full max-w-md">
            {renderStepContent()}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 bg-white border-t border-gray-100">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center space-x-2 px-4 py-3 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Vorige</span>
        </motion.button>

        <div className="flex space-x-3">
          {currentStep === STEPS.length - 1 ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-2xl disabled:opacity-50 shadow-lg"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Opslaan...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Setup Voltooien</span>
                </>
              )}
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <span>Volgende</span>
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}