'use client';

import { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import Header from '@/components/mobile-v3/Header';
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

  useEffect(() => {
    fetchAgentData();
  }, []);

  const fetchAgentData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data voor development
      setActions([
        {
          id: '1',
          type: 'callback',
          title: 'Terugbellen voor project details',
          description: 'Klant wil offerte voor webshop ontwikkeling',
          customerName: 'Jan Bakker',
          customerPhone: '+31 6 12345678',
          priority: 'high',
          createdAt: Date.now() - 300000, // 5 min ago
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
          createdAt: Date.now() - 900000, // 15 min ago
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
          createdAt: Date.now() - 1800000, // 30 min ago
          status: 'pending',
          context: 'Restaurant wil beter vindbaar worden online'
        }
      ]);

      setChatMessages([
        {
          id: '1',
          type: 'agent',
          message: 'Hoi! Ik ben je AI business assistant. Ik heb 3 nieuwe acties voor je gegenereerd op basis van recente gesprekken. Je kunt me nieuwe instructies geven, vragen stellen over je business, of me vragen om acties uit te voeren. Hoe kan ik je helpen?',
          timestamp: Date.now() - 600000
        }
      ]);

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
    
    // Haptic feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleVoiceStart = () => {
    setIsRecording(true);
    // In real app: start voice recording
  };

  const handleVoiceStop = () => {
    setIsRecording(false);
    // In real app: stop recording and process speech-to-text
    // For demo, simulate voice input with realistic commands
    const voiceCommands = [
      "Bel Jan Bakker terug voor de webshop details",
      "Stuur portfolio naar Sarah de Vries", 
      "Maak een offerte voor Tom Williams voor SEO",
      "Plan een afspraak met de nieuwe klant volgende week",
      "Stuur een reminder voor de deadline van project X"
    ];
    
    const randomCommand = voiceCommands[Math.floor(Math.random() * voiceCommands.length)];
    
    setTimeout(() => {
      handleSendMessage(randomCommand);
    }, 500);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    setSendingMessage(true);
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message,
      timestamp: Date.now()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setTextInput('');
    
    try {
      // Get business context
      const businessContext = {
        business: {
          name: "Mijn ZZP Bedrijf",
          services: ["Webdevelopment", "Consultancy", "Design"],
          pricing: {
            "webdevelopment": 75,
            "consultancy": 85,
            "design": 65
          },
          availability: "Ma-Vr 9:00-17:00",
          contact: "info@mijnbedrijf.nl"
        },
        recentTranscriptions: actions.slice(0, 3).map(action => ({
          customerName: action.customerName,
          transcriptSummary: action.description
        })),
        activeActions: actions.filter(a => a.status === 'pending')
      };

      // Call AI agent
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId: 'session-' + Date.now(),
          context: businessContext
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get agent response');
      }

      const aiResponse = await response.json();
      
      // Add agent response
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        message: aiResponse.message,
        timestamp: Date.now()
      };
      
      setChatMessages(prev => [...prev, agentMessage]);
      
      // Add any new actions generated by the agent
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
        
        // Haptic feedback for new actions
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
        
        // Add a system message about new actions
        const systemMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          type: 'agent',
          message: `✅ Ik heb ${newActions.length} nieuwe actie${newActions.length > 1 ? 's' : ''} toegevoegd aan je lijst.`,
          timestamp: Date.now() + 100
        };
        
        setTimeout(() => {
          setChatMessages(prev => [...prev, systemMessage]);
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error sending message to agent:', error);
      
      // Fallback response
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        message: 'Sorry, ik kan je bericht momenteel niet verwerken. Probeer het over een moment opnieuw.',
        timestamp: Date.now()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
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
      case 'high': return 'border-l-red-400 bg-red-50';
      case 'medium': return 'border-l-yellow-400 bg-yellow-50';
      case 'low': return 'border-l-blue-400 bg-blue-50';
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}u geleden`;
    return `${minutes}m geleden`;
  };

  if (loading) {
    return (
      <div className="min-h-screen clean-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Assistant laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--va-bg-assistant)' }}>
      <Header title="ZZP Business Assistant" showBack />

      <div className="px-4 py-4">
        {/* AI Assistant Status - VoicemailAI Success Partner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div
            className="p-4 rounded-xl"
            style={{
              background: '#ebf7e8',
              border: '2px solid var(--va-light-green-2)'
            }}
          >
            <div className="flex justify-between items-center">
              <div>
                <div
                  className="font-bold"
                  style={{ color: 'var(--va-indigo-dye)' }}
                >
                  🟢 AI Assistant Actief
                </div>
                <div
                  className="text-sm"
                  style={{ color: 'var(--va-lapis-lazuli)' }}
                >
                  Helpt je business groeien • 24/7 beschikbaar
                </div>
              </div>
              <div
                className="w-12 h-6 rounded-full relative"
                style={{ background: 'var(--va-emerald)' }}
              >
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Business Insights - VoicemailAI Intelligence */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <div
            className="p-3 rounded-xl"
            style={{
              background: '#dcf1eb',
              border: '2px solid var(--va-verdigris)'
            }}
          >
            <div
              className="font-bold mb-2 text-sm"
              style={{ color: 'var(--va-indigo-dye)' }}
            >
              💡 Business Inzichten
            </div>
            <div
              className="text-sm"
              style={{ color: 'var(--va-lapis-lazuli)' }}
            >
              "Je hebt vandaag {actions.length} warme leads binnen. Plan follow-ups voor optimale conversie!"
            </div>
          </div>
        </motion.div>

        {/* Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acties van Assistant</h3>
          <div className="space-y-3">
            <AnimatePresence>
              {actions.filter(action => action.status === 'pending').map((action) => (
                <ActionCard
                  key={action.id}
                  action={action}
                  onSwipe={handleActionSwipe}
                  formatTimeAgo={formatTimeAgo}
                  getActionIcon={getActionIcon}
                  getPriorityColor={getPriorityColor}
                />
              ))}
            </AnimatePresence>
            
            {actions.filter(action => action.status === 'pending').length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-gray-600">Alle acties afgehandeld!</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* VoicemailAI Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div
            className="font-bold mb-3"
            style={{ color: 'var(--va-indigo-dye)' }}
          >
            💬 Chat met je Business AI
          </div>
          
          {/* Chat Messages Container */}
          <div
            className="p-4 rounded-xl flex-1"
            style={{
              background: 'white',
              border: '2px solid var(--va-keppel)'
            }}
          >
            <div
              className="h-32 overflow-y-auto p-3 mb-3 space-y-3 rounded-lg"
              style={{
                border: '2px solid var(--va-light-green-2)',
                background: '#f7fbe9'
              }}
            >
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-3 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className="p-3 rounded-lg text-sm"
                    style={{
                      background: message.type === 'user' ? 'var(--va-bondi-blue)' : 'var(--va-emerald)',
                      color: 'white'
                    }}
                  >
                    <strong>{message.type === 'user' ? 'Jij:' : 'Business AI:'}</strong> {message.message}
                  </div>
                </div>
              ))}
              {sendingMessage && (
                <div className="flex justify-start mb-3">
                  <div 
                    className="px-3 py-2 rounded-lg"
                    style={{ background: 'var(--va-emerald)', color: 'white' }}
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* VoicemailAI Input Interface */}
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Vraag je business AI om hulp..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(textInput)}
                className="flex-1 px-3 py-2 rounded-lg focus:outline-none"
                style={{
                  border: '2px solid var(--va-keppel)',
                  color: 'var(--va-indigo-dye)',
                  background: 'white'
                }}
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSendMessage(textInput)}
                disabled={!textInput.trim() || sendingMessage}
                className="px-4 py-2 rounded-lg text-white disabled:opacity-50"
                style={{ background: 'var(--va-emerald)' }}
              >
                📤
              </motion.button>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            Houd microfoon ingedrukt om te spreken
          </p>
        </motion.div>

        {/* Quick Commands */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Snelle Commando's</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Bel laatste klant', action: () => handleSendMessage('Bel de laatste klant terug die contact heeft gehad') },
              { label: 'Stuur portfolio', action: () => handleSendMessage('Stuur mijn portfolio en voorbeelden naar de laatste geïnteresseerde klant') },
              { label: 'Plan afspraak', action: () => handleSendMessage('Plan een kennismakingsafspraak met de laatste prospect') },
              { label: 'Maak offerte', action: () => handleSendMessage('Maak een offerte op basis van het laatste gesprek') }
            ].map((command, index) => (
              <motion.button
                key={index}
                whileTap={{ scale: 0.95 }}
                onClick={command.action}
                className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {command.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      <BottomNavigation />
    </div>
  );
}

interface ActionCardProps {
  action: AssistantAction;
  onSwipe: (id: string, direction: 'approve' | 'reject') => void;
  formatTimeAgo: (timestamp: number) => string;
  getActionIcon: (type: AssistantAction['type']) => any;
  getPriorityColor: (priority: AssistantAction['priority']) => string;
}

function ActionCard({ action, onSwipe, formatTimeAgo, getActionIcon, getPriorityColor }: ActionCardProps) {
  const x = useMotionValue(0);
  const backgroundColor = useTransform(
    x,
    [-150, 0, 150],
    ['#ef4444', '#ffffff', '#10b981']
  );

  const Icon = getActionIcon(action.type);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      style={{ x, backgroundColor }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) {
          onSwipe(action.id, 'approve');
        } else if (info.offset.x < -100) {
          onSwipe(action.id, 'reject');
        }
      }}
      whileDrag={{ scale: 1.05 }}
      className={`blabla-card border-l-4 cursor-grab active:cursor-grabbing ${getPriorityColor(action.priority)}`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(0, 188, 212, 0.1)',
              color: 'var(--color-primary)'
            }}
          >
            <Icon size={20} />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-gray-900 truncate">{action.title}</h4>
            <span className="text-xs text-gray-500 ml-2">{formatTimeAgo(action.createdAt)}</span>
          </div>
          
          <p className="text-sm text-gray-600 mb-1">{action.description}</p>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">{action.customerName}</span>
            {action.customerPhone && (
              <span className="text-xs text-gray-500">{action.customerPhone}</span>
            )}
          </div>
          
          {action.context && (
            <p className="text-xs text-gray-500 mt-2 italic">{action.context}</p>
          )}
        </div>
      </div>
      
      {/* Swipe indicators */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-4">
        <X className="w-6 h-6 text-red-600 opacity-0" />
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center pr-4">
        <CheckCircle className="w-6 h-6 text-green-600 opacity-0" />
      </div>
    </motion.div>
  );
}