'use client';

// Disable pre-rendering to avoid CSR bailout errors with useSearchParams during static export
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  CheckCircle, 
  X, 
  Clock, 
  MessageSquare,
  Power,
  Send,
  Loader2,
  Users,
  TrendingUp,
  Zap,
  ChevronRight
} from 'lucide-react';
import Header from '@/components/mobile-v3/Header';
import { useSearchParams } from 'next/navigation';
import BottomNavigation from '@/components/mobile-v3/BottomNavigation';

interface AssistantAction {
  id: string;
  type: 'callback' | 'email' | 'meeting' | 'quote' | 'reminder' | 'follow-up';
  title: string;
  description: string;
  customerName: string;
  customerPhone?: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: number;
  status: 'pending' | 'completed' | 'rejected';
  context?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  message: string;
  timestamp: number;
}

export default function AgentAssistantPage() {
  const [assistantActive, setAgentActive] = useState(true);
  const [actions, setActions] = useState<AssistantAction[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedAction, setSelectedAction] = useState<AssistantAction | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'actions'>('overview');
  const searchParams = useSearchParams();
  const isOnboarding = searchParams?.get('source') === 'onboarding';
  const onboardingTargetFields = ['name','mobileNumber','companyName','companyEmail','companyOpeningHours','companyInfo','information','calUsername','calApiKey','calEventTypeId'];
  const [onboardingProgress, setOnboardingProgress] = useState<{collected: number; missing: number; missingKeys: string[]}>({ collected: 0, missing: onboardingTargetFields.length, missingKeys: onboardingTargetFields });
  const [onboardingSaved, setOnboardingSaved] = useState(false);

  useEffect(() => {
    fetchAgentData();
    if (isOnboarding) {
      setActiveTab('chat');
      // Toon direct een onboarding-intro bericht voor duidelijke affordance
      setChatMessages([
        {
          id: 'intro',
          type: 'agent',
          message: 'Ik help je snel door de setup. We verzamelen alleen het nodige. Mag ik beginnen met je naam en mobiele nummer?',
          timestamp: Date.now()
        }
      ]);
      setTimeout(() => handleSendMessage('Start onboarding.'), 300);
    }
  }, [isOnboarding]);

  const fetchAgentData = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setActions([
        {
          id: '1',
          type: 'callback',
          title: 'Terugbellen voor project details',
          description: 'Klant wil offerte voor webshop ontwikkeling',
          customerName: 'Jan Bakker',
          customerPhone: '+31 6 12345678',
          priority: 'high',
          createdAt: Date.now() - 300000,
          status: 'pending',
          context: 'Gesprek over e-commerce oplossing voor lokale bakkerij'
        },
        {
          id: '2',
          type: 'email',
          title: 'Portfolio versturen',
          description: 'Klant vroeg om voorbeelden van eerder werk',
          customerName: 'Sarah de Vries',
          priority: 'medium',
          createdAt: Date.now() - 900000,
          status: 'pending',
          context: 'Interesse in branding en logo design'
        },
        {
          id: '3',
          type: 'quote',
          title: 'Offerte SEO pakket',
          description: 'Concept offerte voor 6 maanden SEO begeleiding',
          customerName: 'Tom Williams',
          priority: 'medium',
          createdAt: Date.now() - 1800000,
          status: 'pending',
          context: 'Restaurant wil beter vindbaar worden online'
        }
      ]);

      // Alleen standaard welkomstbericht als we NIET in onboarding zijn
      if (!isOnboarding) {
      setChatMessages([
        {
          id: '1',
          type: 'agent',
          message: 'Hoi! Ik ben je AI business assistant. Ik heb 3 nieuwe acties voor je gegenereerd op basis van recente gesprekken. Stel me vragen over klanten of afspraken, of laat me acties uitvoeren. Waarmee kan ik helpen?',
          timestamp: Date.now() - 600000
        }
      ]);
      }

    } catch (error) {
      console.error('Error fetching agent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionSwipe = (actionId: string, direction: 'approve' | 'reject') => {
    setActions(prev => prev.map(action => 
      action.id === actionId 
        ? { ...action, status: direction === 'approve' ? 'completed' : 'rejected' }
        : action
    ));
    
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleVoiceStart = () => {
    setIsRecording(true);
  };

  const handleVoiceStop = () => {
    setIsRecording(false);
    const voiceCommands = [
      'Bel Jan Bakker terug voor de webshop details',
      'Stuur portfolio naar Sarah de Vries',
      'Maak een offerte voor Tom Williams voor SEO',
      'Plan een afspraak met de nieuwe klant volgende week',
      'Stuur een reminder voor de deadline van project X'
    ];
    const randomCommand = voiceCommands[Math.floor(Math.random() * voiceCommands.length)];
    setTimeout(() => handleSendMessage(randomCommand), 500);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    setSendingMessage(true);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message,
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setTextInput('');
    // Auto-scroll to bottom after sending
    setTimeout(() => {
      const el = document.getElementById('chat-scroll-container');
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
    
    try {
      const businessContext = {
        business: {
          name: 'Mijn ZZP Bedrijf',
          services: ['Webdevelopment', 'Consultancy', 'Design'],
          pricing: { webdevelopment: 75, consultancy: 85, design: 65 },
          availability: 'Ma-Vr 9:00-17:00',
          contact: 'info@mijnbedrijf.nl'
        },
        recentTranscriptions: actions.slice(0, 3).map(a => ({
          customerName: a.customerName,
          transcriptSummary: a.description
        })),
        activeActions: actions.filter(a => a.status === 'pending')
      };

      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          sessionId: 'session-' + Date.now(),
          context: {
            ...businessContext,
            // Houd onboarding-spec actief voor elke beurt tijdens onboarding
            onboardingSpec: isOnboarding ? {
              enabled: true,
              targetFields: onboardingTargetFields,
              current: {}
            } : undefined,
            history: [...chatMessages.slice(-20)].map(m => ({ role: m.type === 'user' ? 'user' : 'agent', message: m.message }))
          }
        })
      });

      if (!response.ok) throw new Error('Failed to get agent response');

      const aiResponse = await response.json();

      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        message: aiResponse.message,
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, agentMessage]);
      setTimeout(() => {
        const el = document.getElementById('chat-scroll-container');
        if (el) el.scrollTop = el.scrollHeight;
      }, 50);

      // Update onboarding progress if present
      if (aiResponse.onboarding) {
        const fields = aiResponse.onboarding.fields || {};
        const missing = aiResponse.onboarding.missing || [];
        setOnboardingProgress({ collected: Object.keys(fields).length, missing: missing.length, missingKeys: missing });
      }

      // Persist at the end only (when no fields missing and not saved yet)
      if (
        aiResponse.onboarding &&
        Array.isArray(aiResponse.onboarding.missing) &&
        aiResponse.onboarding.missing.length === 0 &&
        aiResponse.onboarding.fields &&
        !onboardingSaved
      ) {
        try {
          await fetch('/api/user/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(aiResponse.onboarding.fields)
          });
          const savedMsg: ChatMessage = {
            id: (Date.now() + 2).toString(),
            type: 'agent',
            message: '✅ Alle gegevens compleet. Ik heb je profiel opgeslagen.',
            timestamp: Date.now()
          };
          setChatMessages(prev => [...prev, savedMsg]);
          setOnboardingSaved(true);
          setTimeout(() => {
            const el = document.getElementById('chat-scroll-container');
            if (el) el.scrollTop = el.scrollHeight;
          }, 50);
        } catch (e) {
          const failMsg: ChatMessage = {
            id: (Date.now() + 2).toString(),
            type: 'agent',
            message: '⚠️ Opslaan is niet gelukt. Probeer het zo nog eens of gebruik de Setup Wizard.',
            timestamp: Date.now()
          };
          setChatMessages(prev => [...prev, failMsg]);
          setTimeout(() => {
            const el = document.getElementById('chat-scroll-container');
            if (el) el.scrollTop = el.scrollHeight;
          }, 50);
        }
      }

      if (aiResponse.actions && aiResponse.actions.length > 0) {
        const newActions = aiResponse.actions.map((action: any) => ({
          id: Date.now().toString() + Math.random(),
          type: action.type,
          title: action.title,
          description: action.description,
          customerName: action.customerName || 'Onbekend',
          priority: action.priority || 'medium',
          createdAt: Date.now(),
          status: 'pending',
          context: action.content || action.suggestedTiming
        }));
        setActions(prev => [...newActions, ...prev]);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        const systemMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          type: 'agent',
          message: `✅ Ik heb ${newActions.length} nieuwe actie${newActions.length > 1 ? 's' : ''} toegevoegd aan je lijst.`,
          timestamp: Date.now() + 100
        };
        setTimeout(() => {
          setChatMessages(prev => [...prev, systemMessage]);
          setTimeout(() => {
            const el = document.getElementById('chat-scroll-container');
            if (el) el.scrollTop = el.scrollHeight;
          }, 50);
        }, 1000);
      }

    } catch (error) {
      console.error('Error sending message to agent:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        message: 'Sorry, ik kan je bericht momenteel niet verwerken. Probeer het over een moment opnieuw.',
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, errorMessage]);
      setTimeout(() => {
        const el = document.getElementById('chat-scroll-container');
        if (el) el.scrollTop = el.scrollHeight;
      }, 50);
    } finally {
      setSendingMessage(false);
    }
  };

  const getActionIcon = (type: AssistantAction['type']) => {
    switch (type) {
      case 'callback': return Phone;
      case 'email': return Mail;
      case 'meeting': return Calendar;
      case 'quote': return FileText;
      case 'reminder': return Clock;
      default: return MessageSquare;
    }
  };

  const getPriorityColor = (priority: AssistantAction['priority']) => {
    switch (priority) {
      case 'high': return 'var(--color-error)';
      case 'medium': return 'var(--color-warning)';
      case 'low': return 'var(--color-primary)';
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}u geleden`;
    return `${minutes}m geleden`;
  };

  const metrics = (() => {
    const pending = actions.filter(a => a.status === 'pending').length;
    const highPriority = actions.filter(a => a.priority === 'high' && a.status === 'pending').length;
    const completed = actions.filter(a => a.status === 'completed').length;
    return { pending, highPriority, completed };
  })();

  const quickSuggestions = [
    'Overzicht van open acties',
    'Volgende afspraak plannen',
    'Laatste klantgesprekken samenvatten',
    'Maak follow-up email concept',
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--va-bg-home)' }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Assistant laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--va-bg-home)', paddingBottom: isOnboarding ? 0 : '5rem' }}>
      <Header title={isOnboarding ? 'Onboarding Agent' : 'Business Assistant'} showBack subtitle={isOnboarding ? 'Ik begeleid je stap voor stap door de setup' : undefined} />

      <div className="px-4 py-4">
        {/* Tab Navigation */}
        <div className="flex mb-6 rounded-lg p-1" style={{ background: 'var(--background-subtle)', border: '1px solid var(--card-border)' }}>
          {[
            { id: 'overview', label: 'Overzicht', icon: TrendingUp },
            { id: 'chat', label: 'Chat', icon: MessageSquare },
            { id: 'actions', label: 'Acties', icon: Zap }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all`}
                style={{
                  background: isActive ? 'var(--color-primary)' : 'transparent',
                  color: isActive ? 'white' : 'var(--color-text-muted)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={16} />
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* Overview Tab (verbergen in onboarding) */}
        {activeTab === 'overview' && !isOnboarding && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Assistant Status */}
            <div className="va-section-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: assistantActive ? 'var(--color-success)' : '#CBD5E1' }} />
                  <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {assistantActive ? 'AI Assistant Actief' : 'AI Assistant Uitgeschakeld'}
                  </span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAgentActive(v => !v)}
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    background: assistantActive ? 'rgba(37,99,232,0.10)' : 'transparent',
                    border: '1px solid var(--card-border)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  {assistantActive ? 'Aan' : 'Uit'}
                </motion.button>
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Je AI assistant helpt je met klantvragen, afspraken en business management
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Open Acties', value: metrics.pending, color: 'var(--color-primary)' },
                { label: 'Hoog Prioriteit', value: metrics.highPriority, color: 'var(--color-error)' },
                { label: 'Afgerond', value: metrics.completed, color: 'var(--color-success)' },
              ].map((metric, index) => (
                <div key={index} className="va-section-card p-3 text-center">
                  <div className="text-2xl font-bold mb-1" style={{ color: metric.color }}>
                    {metric.value}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="va-section-card p-4">
              <h3 className="font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
                Snelle Acties
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {quickSuggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setActiveTab('chat');
                      setTimeout(() => handleSendMessage(suggestion), 100);
                    }}
                    className="p-3 text-left rounded-lg text-sm"
                    style={{
                      border: '1px solid var(--card-border)',
                      background: 'var(--background-clean)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="va-section-card p-4">
              <h3 className="font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
                Recente Activiteit
              </h3>
              <div className="space-y-2">
                {actions.slice(0, 3).map((action) => (
                  <div key={action.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(37,99,232,0.10)' }}>
                      {React.createElement(getActionIcon(action.type), { size: 16, style: { color: 'var(--color-primary)' } })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {action.title}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {action.customerName} • {formatTimeAgo(action.createdAt)}
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Chat Messages */}
            <div className="va-section-card p-4">
              {/* Onboarding status chip */}
              {isOnboarding && (
                <div className="mb-3 flex items-center justify-between text-xs px-3 py-2 rounded-lg"
                     style={{ background: 'var(--background-subtle)', border: '1px solid var(--card-border)', color: 'var(--color-text-primary)' }}>
                  <span>Onboarding actief</span>
                  <span>{onboardingProgress.collected}/{onboardingTargetFields.length} verzameld</span>
                </div>
              )}

              <div
                className="overflow-y-auto mb-4 space-y-3"
                id="chat-scroll-container"
                style={{ maxHeight: isOnboarding ? '65dvh' : '16rem' }}
              >
                {chatMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className="px-3 py-2 rounded-lg max-w-[80%] text-sm"
                      style={{
                        background: message.type === 'user' ? 'var(--color-primary)' : 'var(--background-subtle)',
                        color: message.type === 'user' ? 'white' : 'var(--color-text-primary)'
                      }}
                    >
                      {message.message}
                    </div>
                  </div>
                ))}
                {sendingMessage && (
                  <div className="flex justify-start">
                    <div className="px-3 py-2 rounded-lg" style={{ background: 'var(--background-subtle)' }}>
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--color-text-muted)' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={isRecording ? handleVoiceStop : handleVoiceStart}
                  className="p-2 rounded-lg"
                  style={{
                    border: '1px solid var(--card-border)',
                    background: isRecording ? 'rgba(239,68,68,0.1)' : 'transparent'
                  }}
                >
                  {isRecording ? (
                    <MicOff size={18} style={{ color: '#EF4444' }} />
                  ) : (
                    <Mic size={18} style={{ color: 'var(--color-primary)' }} />
                  )}
                </motion.button>

                <input
                  type="text"
                  placeholder="Vraag je business AI om hulp..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(textInput)}
                  className="flex-1 px-3 py-2 rounded-lg focus:outline-none"
                  style={{
                    border: '1px solid var(--card-border)',
                    background: 'white',
                    color: 'var(--color-text-primary)'
                  }}
                />

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSendMessage(textInput)}
                  disabled={!textInput.trim() || sendingMessage}
                  className="p-2 rounded-lg disabled:opacity-50"
                  style={{ background: 'var(--color-primary)', color: 'white' }}
                >
                  <Send size={18} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions Tab */}
        {activeTab === 'actions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {actions.filter(a => a.status === 'pending').map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                onSwipe={handleActionSwipe}
                formatTimeAgo={formatTimeAgo}
                getActionIcon={getActionIcon}
                getPriorityColor={getPriorityColor}
                onOpen={() => setSelectedAction(action)}
              />
            ))}
            
            {actions.filter(a => a.status === 'pending').length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
                <p style={{ color: 'var(--color-text-secondary)' }}>Alle acties afgehandeld!</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Action Detail Bottom Sheet */}
      <AnimatePresence>
        {selectedAction && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-50"
          >
            <div className="va-section-card p-4 rounded-t-2xl" style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
                    {selectedAction.type.toUpperCase()}
                  </div>
                  <div className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedAction.title}
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedAction(null)}
                  className="p-2 rounded-lg"
                  style={{ background: 'var(--background-subtle)' }}
                >
                  <X size={18} style={{ color: 'var(--color-text-muted)' }} />
                </motion.button>
              </div>

              <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                {selectedAction.description}
              </p>

              <div className="flex items-center gap-2 mb-4">
                <Users size={16} style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {selectedAction.customerName}
                </span>
                {selectedAction.customerPhone && (
                  <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    • {selectedAction.customerPhone}
                  </span>
                )}
              </div>

              {selectedAction.context && (
                <div className="p-3 rounded-lg mb-4" style={{ background: 'var(--background-subtle)' }}>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                    Context
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedAction.context}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    handleActionSwipe(selectedAction.id, 'approve');
                    setSelectedAction(null);
                  }}
                  className="py-3 rounded-lg text-white font-medium"
                  style={{ background: 'var(--color-success)' }}
                >
                  Voltooien
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    handleActionSwipe(selectedAction.id, 'reject');
                    setSelectedAction(null);
                  }}
                  className="py-3 rounded-lg font-medium"
                  style={{ background: 'var(--background-subtle)', color: 'var(--color-error)' }}
                >
                  Afwijzen
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOnboarding && <BottomNavigation />}
    </div>
  );
}

interface ActionCardProps {
  action: AssistantAction;
  onSwipe: (id: string, direction: 'approve' | 'reject') => void;
  formatTimeAgo: (timestamp: number) => string;
  getActionIcon: (type: AssistantAction['type']) => any;
  getPriorityColor: (priority: AssistantAction['priority']) => string;
  onOpen: () => void;
}

function ActionCard({ action, onSwipe, formatTimeAgo, getActionIcon, getPriorityColor, onOpen }: ActionCardProps) {
  const x = useMotionValue(0);
  const backgroundColor = useTransform(x, [-150, 0, 150], ['#fee2e2', '#ffffff', '#dcfce7']);
  const Icon = getActionIcon(action.type);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) onSwipe(action.id, 'approve');
        else if (info.offset.x < -100) onSwipe(action.id, 'reject');
      }}
      whileDrag={{ scale: 1.02 }}
      className="va-section-card p-4 cursor-grab active:cursor-grabbing"
      style={{ x, backgroundColor, borderLeft: `4px solid ${getPriorityColor(action.priority)}` }}
      onClick={onOpen}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(37,99,232,0.10)' }}>
            <Icon size={20} style={{ color: 'var(--color-primary)' }} />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
              {action.title}
            </h4>
            <span className="text-xs ml-2" style={{ color: 'var(--color-text-muted)' }}>
              {formatTimeAgo(action.createdAt)}
            </span>
          </div>
          
          <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            {action.description}
          </p>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {action.customerName}
            </span>
            {action.customerPhone && (
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {action.customerPhone}
              </span>
            )}
          </div>
          
          {action.context && (
            <p className="text-xs mt-2 italic" style={{ color: 'var(--color-text-muted)' }}>
              {action.context}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}