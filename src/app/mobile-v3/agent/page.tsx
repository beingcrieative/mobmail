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

interface AgentAction {
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
  const [agentActive, setAgentActive] = useState(true);
  const [actions, setActions] = useState<AgentAction[]>([]);
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

  const getActionIcon = (type: AgentAction['type']) => {
    switch (type) {
      case 'callback': return Phone;
      case 'email': return Mail;
      case 'meeting': return Calendar;
      case 'quote': return FileText;
      case 'reminder': return Clock;
      default: return MessageSquare;
    }
  };

  const getPriorityColor = (priority: AgentAction['priority']) => {
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Agent laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
    }}>
      <Header title="Agent Assistant" showBack />

      <div className="px-4 py-4">
        {/* Agent Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${agentActive ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <h2 className="font-semibold text-gray-900">
                    Agent {agentActive ? 'Actief' : 'Inactief'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {actions.filter(a => a.status === 'pending').length} nieuwe acties
                  </p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setAgentActive(!agentActive)}
                className={`p-3 rounded-full ${agentActive ? 'bg-green-100' : 'bg-red-100'}`}
              >
                <Power size={20} className={agentActive ? 'text-green-600' : 'text-red-600'} />
              </motion.button>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acties van Agent</h3>
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

        {/* Voice Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chat met Agent</h3>
          
          {/* Chat Messages */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
            <div className="p-4 max-h-64 overflow-y-auto">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-3 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.message}</p>
                  </div>
                </div>
              ))}
              {sendingMessage && (
                <div className="flex justify-start mb-3">
                  <div className="bg-gray-100 px-3 py-2 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Interface */}
          <div className="flex space-x-2">
            <div className="flex-1 flex rounded-xl border border-gray-200 bg-white">
              <input
                type="text"
                placeholder="Typ je instructie..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(textInput)}
                className="flex-1 px-4 py-3 rounded-l-xl focus:outline-none"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSendMessage(textInput)}
                disabled={!textInput.trim() || sendingMessage}
                className="px-4 py-3 bg-blue-500 text-white rounded-r-xl disabled:opacity-50"
              >
                <Send size={16} />
              </motion.button>
            </div>
            
            {/* Voice Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onTouchStart={handleVoiceStart}
              onTouchEnd={handleVoiceStop}
              onMouseDown={handleVoiceStart}
              onMouseUp={handleVoiceStop}
              className={`p-3 rounded-xl ${
                isRecording 
                  ? 'bg-red-500 text-white' 
                  : 'bg-blue-500 text-white'
              }`}
            >
              {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
            </motion.button>
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
  action: AgentAction;
  onSwipe: (id: string, direction: 'approve' | 'reject') => void;
  formatTimeAgo: (timestamp: number) => string;
  getActionIcon: (type: AgentAction['type']) => any;
  getPriorityColor: (priority: AgentAction['priority']) => string;
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
      className={`rounded-xl p-4 border-l-4 shadow-sm cursor-grab active:cursor-grabbing ${getPriorityColor(action.priority)}`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Icon size={20} className="text-blue-600" />
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