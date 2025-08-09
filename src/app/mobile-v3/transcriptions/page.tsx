'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { 
  Phone, 
  Clock, 
  User, 
  FileText, 
  Play, 
  Pause, 
  ArrowLeft, 
  RefreshCw, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle, 
  Archive, 
  Trash2,
  Calendar,
  TrendingUp,
  Users,
  Zap,
  Star,
  MoreHorizontal,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import Header from '@/components/mobile-v3/Header';
import BottomNavigation from '@/components/mobile-v3/BottomNavigation';

// VoicemailAI Avatar Gradient System - from designer demo
const avatarColors = [
  'linear-gradient(135deg, #76c893 0%, #52b69a 100%)', // Emerald to Keppel
  'linear-gradient(135deg, #52b69a 0%, #34a0a4 100%)', // Keppel to Verdigris
  'linear-gradient(135deg, #168aad 0%, #1a759f 100%)', // Bondi to Cerulean
  'linear-gradient(135deg, #1a759f 0%, #1e6091 100%)', // Cerulean to Lapis
  'linear-gradient(135deg, #99d98c 0%, #76c893 100%)'  // Light green to Emerald
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(phoneNumber: string): string {
  const hash = phoneNumber
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

interface Transcription {
  id: string;
  eventType: string;
  eventTimestamp: number;
  agentId: string;
  conversationId: string;
  status: string;
  transcript: Array<{
    role: string;
    message: string;
    timeInCallSecs?: number;
  }>;
  startTime: number;
  callDuration: number;
  callDirection: string;
  agentNumber: string;
  externalNumber: string;
  transcriptSummary: string;
  customerName: string;
  customer_name: string; // Database field
  companyName: string;
  company_name: string; // Database field
  caller_phone: string; // Database field
  callSuccessful: string; // Database field for priority
  created_at: string;
  client_id?: string;
}

interface ConversationThread {
  customerName: string;
  phoneNumber: string;
  companyName?: string;
  transcriptions: Transcription[];
  lastCallTime: number;
  totalCalls: number;
  unreadCount?: number;
}

export default function TranscriptionsPage() {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [conversationThreads, setConversationThreads] = useState<ConversationThread[]>([]);
  const [filteredThreads, setFilteredThreads] = useState<ConversationThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedThread, setSelectedThread] = useState<ConversationThread | null>(null);
  const [selectedCall, setSelectedCall] = useState<Transcription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'leads' | 'followup'>('all');
  const router = useRouter();

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      console.log('Component mounted, fetching transcriptions');
      fetchTranscriptions();
    }
  }, [mounted]);

  useEffect(() => {
    groupTranscriptionsIntoThreads();
  }, [transcriptions]);

  useEffect(() => {
    filterThreads();
  }, [conversationThreads, searchTerm, dateFilter, activeTab]);

  const getCallType = (transcription: Transcription): 'short' | 'medium' | 'long' => {
    if (transcription.callDuration < 60) return 'short';
    if (transcription.callDuration < 180) return 'medium';
    return 'long';
  };

    const fetchTranscriptions = async () => {
    try {
      setLoading(true);
      
      // Get Supabase client
      const supabase = getSupabase();
      if (!supabase) {
        console.error('Supabase client not available');
        setTranscriptions([]);
        setLoading(false);
        return;
      }
      
      // Check authentication
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        console.log('No session found - user not authenticated');
        // Use mock data for development when not authenticated
        const mockTranscriptions = [
          {
            id: '1',
            eventType: 'call',
            eventTimestamp: Date.now() / 1000,
            agentId: 'agent-1',
            conversationId: 'conv-1',
            status: 'completed',
            transcript: [
              { role: 'agent', message: 'Hallo, hoe kan ik u helpen?' },
              { role: 'customer', message: 'Ik ben geïnteresseerd in een offerte voor een website' }
            ],
            startTime: Date.now() / 1000 - 3600,
            callDuration: 180,
            callDirection: 'inbound',
            agentNumber: '+31 6 12345678',
            externalNumber: '+31 6 87654321',
            transcriptSummary: 'Klant vraagt om offerte voor website ontwikkeling',
            customerName: 'Jan Bakker',
            customer_name: 'Jan Bakker',
            companyName: 'Bakkerij Bakker',
            company_name: 'Bakkerij Bakker',
            caller_phone: '+31 6 87654321',
            callSuccessful: 'yes',
            created_at: new Date().toISOString(),
            client_id: 'mock-client'
          },
          {
            id: '2',
            eventType: 'call',
            eventTimestamp: Date.now() / 1000,
            agentId: 'agent-1',
            conversationId: 'conv-2',
            status: 'completed',
            transcript: [
              { role: 'agent', message: 'Goedemiddag, wat kan ik voor u doen?' },
              { role: 'customer', message: 'Ik zoek een designer voor mijn logo' }
            ],
            startTime: Date.now() / 1000 - 7200,
            callDuration: 120,
            callDirection: 'inbound',
            agentNumber: '+31 6 12345678',
            externalNumber: '+31 6 11111111',
            transcriptSummary: 'Klant zoekt designer voor logo design',
            customerName: 'Sarah de Vries',
            customer_name: 'Sarah de Vries',
            companyName: 'Design Studio',
            company_name: 'Design Studio',
            caller_phone: '+31 6 11111111',
            callSuccessful: 'yes',
            created_at: new Date().toISOString(),
            client_id: 'mock-client'
          }
        ];
        setTranscriptions(mockTranscriptions);
        setLoading(false);
        return;
      }
      
      // Get user ID from session
      const userId = sessionData.session.user.id;
      console.log('Authenticated user ID:', userId);
      
      // Fetch transcriptions from API
      const response = await fetch(`/api/transcriptions?clientId=${userId}&t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched transcriptions:', data);
      
      if (data.transcriptions && Array.isArray(data.transcriptions)) {
        setTranscriptions(data.transcriptions);
      } else {
        console.error('Invalid transcriptions data:', data);
        setTranscriptions([]);
      }
    } catch (error) {
      console.error('Error fetching transcriptions:', error);
      // Use mock data as fallback
      const mockTranscriptions = [
        {
          id: '1',
          eventType: 'call',
          eventTimestamp: Date.now() / 1000,
          agentId: 'agent-1',
          conversationId: 'conv-1',
          status: 'completed',
          transcript: [
            { role: 'agent', message: 'Hallo, hoe kan ik u helpen?' },
            { role: 'customer', message: 'Ik ben geïnteresseerd in een offerte voor een website' }
          ],
          startTime: Date.now() / 1000 - 3600,
          callDuration: 180,
          callDirection: 'inbound',
          agentNumber: '+31 6 12345678',
          externalNumber: '+31 6 87654321',
          transcriptSummary: 'Klant vraagt om offerte voor website ontwikkeling',
          customerName: 'Jan Bakker',
          customer_name: 'Jan Bakker',
          companyName: 'Bakkerij Bakker',
          company_name: 'Bakkerij Bakker',
          caller_phone: '+31 6 87654321',
          callSuccessful: 'yes',
          created_at: new Date().toISOString(),
          client_id: 'mock-client'
        }
      ];
      setTranscriptions(mockTranscriptions);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTranscriptions();
    setRefreshing(false);
  };

  const groupTranscriptionsIntoThreads = () => {
    console.log('Grouping transcriptions:', transcriptions.length, 'transcriptions');
    const threadsMap = new Map<string, ConversationThread>();
    
    transcriptions.forEach(transcription => {
      const phoneNumber = transcription.externalNumber || transcription.caller_phone || '';
      const customerName = transcription.customerName || transcription.customer_name || phoneNumber || 'Onbekende beller';
      
      if (!threadsMap.has(phoneNumber)) {
        threadsMap.set(phoneNumber, {
          customerName,
          phoneNumber,
          companyName: transcription.companyName || transcription.company_name || '',
          transcriptions: [],
          lastCallTime: transcription.startTime,
          totalCalls: 0,
          unreadCount: 0
        });
      }
      
      const thread = threadsMap.get(phoneNumber)!;
      thread.transcriptions.push(transcription);
      thread.totalCalls++;
      
      if (transcription.startTime > thread.lastCallTime) {
        thread.lastCallTime = transcription.startTime;
      }
    });
    
    // Sort threads by last call time (newest first)
    const sortedThreads = Array.from(threadsMap.values()).sort((a, b) => b.lastCallTime - a.lastCallTime);
    console.log('Created threads:', sortedThreads.length, 'threads');
    setConversationThreads(sortedThreads);
  };

  const filterThreads = () => {
    console.log('Filtering threads:', conversationThreads.length, 'total threads');
    let filtered = [...conversationThreads];
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(thread => 
        thread.customerName.toLowerCase().includes(term) ||
        thread.phoneNumber.includes(term) ||
        thread.companyName?.toLowerCase().includes(term) ||
        thread.transcriptions.some(t => 
          t.transcriptSummary?.toLowerCase().includes(term)
        )
      );
      console.log('After search filter:', filtered.length, 'threads');
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const now = Date.now();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStart = today.getTime();
      
      filtered = filtered.filter(thread => {
        const lastCallDate = new Date(thread.lastCallTime * 1000);
        
        switch (dateFilter) {
          case 'today':
            return lastCallDate >= today;
          case 'week':
            const weekAgo = new Date(todayStart - 7 * 24 * 60 * 60 * 1000);
            return lastCallDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(todayStart - 30 * 24 * 60 * 60 * 1000);
            return lastCallDate >= monthAgo;
          default:
            return true;
        }
      });
      console.log('After date filter:', filtered.length, 'threads');
    }
    
    // Tab filter
    if (activeTab === 'leads') {
      filtered = filtered.filter(thread => 
        thread.transcriptions.some(t => t.transcriptSummary?.toLowerCase().includes('offerte') || t.transcriptSummary?.toLowerCase().includes('prijs'))
      );
    } else if (activeTab === 'followup') {
      filtered = filtered.filter(thread => 
        thread.totalCalls > 1 || thread.transcriptions.some(t => t.transcriptSummary?.toLowerCase().includes('terugbellen'))
      );
    }
    
    console.log('Final filtered threads:', filtered.length, 'threads');
    setFilteredThreads(filtered);
  };

  const openThreadDetail = (thread: ConversationThread) => {
    setSelectedThread(thread);
  };

  const closeThreadDetail = () => {
    setSelectedThread(null);
  };

  const openCallDetail = (call: Transcription) => {
    setSelectedCall(call);
  };

  const closeCallDetail = () => {
    setSelectedCall(null);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}u ${remainingMinutes}min`;
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffInSeconds = Math.floor((now - timestamp * 1000) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min geleden`;
    } else if (diffInHours < 24) {
      return `${diffInHours} uur geleden`;
    } else {
      return `${diffInDays} dag${diffInDays === 1 ? '' : 'en'} geleden`;
    }
  };

  const metrics = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = Math.floor(today.getTime() / 1000);
    
    const todayCalls = conversationThreads.filter(thread => thread.lastCallTime >= todayStart).length;
    const totalCalls = conversationThreads.length;
    const potentialRevenue = totalCalls * 150;
    
    return { todayCalls, totalCalls, potentialRevenue };
  })();

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--va-bg-home)' }}>
        <div className="text-center">
          <div 
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
          ></div>
          <p style={{ color: 'var(--color-text-secondary)' }}>Transcripties laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--va-bg-home)' }}>
      <Header title="Transcripties" showBack />

      <div className="px-4 py-2">
        {/* Compact Header with Metrics and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="va-section-card p-3">
            {/* Compact Metrics Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                    {metrics.todayCalls}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Vandaag
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold" style={{ color: 'var(--color-success)' }}>
                    {metrics.totalCalls}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Totaal
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold" style={{ color: 'var(--color-warning)' }}>
                    €{metrics.potentialRevenue}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Potentieel
                  </div>
                </div>
              </div>
              
              {/* Demo Mode Indicator */}
              {conversationThreads.length === 0 && transcriptions.length > 0 && (
                <div className="px-2 py-1 rounded-full text-xs" style={{ background: 'rgba(255, 193, 7, 0.1)', color: '#ffc107' }}>
                  Demo
                </div>
              )}
            </div>

            {/* Compact Search Bar */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Zoek klanten, bedrijven, nummers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg focus:outline-none text-sm"
                style={{
                  border: '1px solid var(--card-border)',
                  background: 'white',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Compact Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-3"
        >
          <div className="flex rounded-lg p-1" style={{ background: 'var(--background-subtle)', border: '1px solid var(--card-border)' }}>
            {[
              { id: 'all', label: 'Alle', icon: MessageCircle },
              { id: 'leads', label: 'Leads', icon: TrendingUp },
              { id: 'followup', label: 'Follow-up', icon: RefreshCw }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all`}
                  style={{
                    background: isActive ? 'var(--color-primary)' : 'transparent',
                    color: isActive ? 'white' : 'var(--color-text-muted)'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={14} />
                  {tab.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Compact Date Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-3"
        >
          <div className="flex gap-1">
            {[
              { key: 'all', label: 'Alle tijd' },
              { key: 'today', label: 'Vandaag' },
              { key: 'week', label: 'Deze week' },
            ].map((filter) => (
              <motion.button
                key={filter.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDateFilter(filter.key as any)}
                className="flex-1 py-1.5 px-2 rounded-lg text-xs font-medium"
                style={{
                  background: dateFilter === filter.key ? 'var(--color-primary)' : 'var(--background-subtle)',
                  color: dateFilter === filter.key ? 'white' : 'var(--color-text-primary)',
                  border: '1px solid var(--card-border)'
                }}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Conversaties
          </h3>
          <div className="px-2 py-1 rounded-full text-xs" style={{ background: 'var(--background-subtle)', color: 'var(--color-text-muted)' }}>
            {filteredThreads.length}
          </div>
        </div>

        {/* Conversation Threads with More Space */}
        <div className="space-y-2 pb-4">
          <AnimatePresence>
            {filteredThreads.map((thread, index) => (
              <ConversationThreadCard
                key={`${thread.phoneNumber}-${thread.customerName}`}
                thread={thread}
                onOpen={() => openThreadDetail(thread)}
                getTimeAgo={getTimeAgo}
                index={index}
              />
            ))}
          </AnimatePresence>

          {filteredThreads.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <MessageCircle size={32} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <h3 className="text-base font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Geen conversaties gevonden
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {searchTerm || dateFilter !== 'all' 
                  ? 'Probeer andere zoekfilters'
                  : conversationThreads.length === 0 
                    ? 'Er zijn nog geen voicemail gesprekken'
                    : 'Geen conversaties voldoen aan de huidige filters'
                }
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      {mounted && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-24 right-4 z-20"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white"
            style={{ background: 'var(--color-primary)' }}
            onClick={handleRefresh}
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </motion.button>
        </motion.div>
      )}

      {/* Thread Detail Modal */}
      <AnimatePresence>
        {selectedThread && mounted && (
          <ThreadDetailModal
            thread={selectedThread}
            onClose={closeThreadDetail}
            formatTimestamp={formatTimestamp}
            formatDuration={formatDuration}
            getTimeAgo={getTimeAgo}
            openCallDetail={openCallDetail}
          />
        )}
      </AnimatePresence>

      {/* Individual Call Detail Modal */}
      <AnimatePresence>
        {selectedCall && mounted && (
          <CallDetailModal
            call={selectedCall}
            onClose={closeCallDetail}
            formatTimestamp={formatTimestamp}
            formatDuration={formatDuration}
          />
        )}
      </AnimatePresence>

      <BottomNavigation />
    </div>
  );
}

// Helper function to normalize transcription data
const normalizeTranscriptionData = (transcription: Transcription) => {
  const customerName = transcription.customerName || transcription.customer_name || '';
  const phoneNumber = transcription.externalNumber || transcription.caller_phone || '';
  
  const displayName = phoneNumber || customerName || 'Onbekende beller';
  
  return {
    customerName: displayName,
    companyName: transcription.companyName || transcription.company_name || '',
    phoneNumber: phoneNumber,
    summary: transcription.transcriptSummary || '',
    callType: transcription.callDuration < 60 ? 'Kort' : transcription.callDuration < 180 ? 'Normaal' : 'Lang'
  };
};

// Conversation Thread Card Component
interface ConversationThreadCardProps {
  thread: ConversationThread;
  onOpen: () => void;
  getTimeAgo: (timestamp: number) => string;
  index: number;
}

function ConversationThreadCard({ thread, onOpen, getTimeAgo, index }: ConversationThreadCardProps) {
  if (!thread || !thread.transcriptions || thread.transcriptions.length === 0) {
    console.error('Invalid thread data in card:', thread);
    return null;
  }
  
  const lastCall = thread.transcriptions[0] || thread.transcriptions.find(t => t.startTime === thread.lastCallTime);
  const hasMultipleCalls = thread.totalCalls > 1;
  const isLead = lastCall?.transcriptSummary?.toLowerCase().includes('offerte') || 
                 lastCall?.transcriptSummary?.toLowerCase().includes('prijs');
  
  const handleClick = () => {
    console.log('Thread card clicked:', thread);
    onOpen();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={handleClick}
      className="va-section-card p-3 cursor-pointer"
    >
      <div className="flex items-start gap-2">
        {/* Avatar with Badge */}
        <div className="relative">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{
              background: getAvatarColor(thread.phoneNumber)
            }}
          >
            {getInitials(thread.customerName)}
          </div>
          {hasMultipleCalls && (
            <div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'var(--color-primary)' }}
            >
              {thread.totalCalls}
            </div>
          )}
          {isLead && (
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-xs"
              style={{ background: 'var(--color-warning)' }}
            >
              <Star size={8} />
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <div className="font-medium truncate text-sm" style={{ color: 'var(--color-text-primary)' }}>
              {thread.customerName}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {getTimeAgo(thread.lastCallTime)}
            </div>
          </div>
          
          <div className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
            {thread.companyName || 'Particulier'} • {thread.phoneNumber}
          </div>
          
          {/* Summary Preview */}
          <div
            className="text-xs leading-relaxed"
            style={{
              color: 'var(--color-text-secondary)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {lastCall?.transcriptSummary || 'Geen samenvatting beschikbaar'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Transcript Message Component for Modal Use
interface TranscriptMessageProps {
  message: {
    role: string;
    message: string;
    timeInCallSecs?: number;
  };
  formatDuration: (seconds: number) => string;
}

function TranscriptMessage({ message, formatDuration }: TranscriptMessageProps) {
  const isAgent = message.role === 'agent';
  
  return (
    <div className={`flex ${isAgent ? 'justify-start' : 'justify-end'} mb-2`}>
      <div
        className={`px-2 py-1.5 rounded-lg max-w-[80%] text-xs ${
          isAgent 
            ? 'bg-gray-100 text-gray-900' 
            : 'bg-blue-600 text-white'
        }`}
      >
        <div className="font-medium text-xs mb-1">
          {isAgent ? 'Agent' : 'Beller'}
          {message.timeInCallSecs && (
            <span className="ml-2 text-gray-500">
              {formatDuration(message.timeInCallSecs)}
            </span>
          )}
        </div>
        <div className="leading-relaxed">{message.message}</div>
      </div>
    </div>
  );
}

// Thread Detail Modal Component
interface ThreadDetailModalProps {
  thread: ConversationThread;
  onClose: () => void;
  formatTimestamp: (timestamp: number) => string;
  formatDuration: (seconds: number) => string;
  getTimeAgo: (timestamp: number) => string;
  openCallDetail: (call: Transcription) => void;
}

function ThreadDetailModal({ thread, onClose, formatTimestamp, formatDuration, getTimeAgo, openCallDetail }: ThreadDetailModalProps) {
  return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="va-section-card w-full max-h-[92vh] overflow-hidden rounded-t-2xl"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
            style={{
              background: getAvatarColor(thread.phoneNumber)
            }}
          >
            {getInitials(thread.customerName)}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {thread.customerName}
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {thread.companyName || 'Particulier'} • {thread.phoneNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg"
            style={{ background: 'var(--background-subtle)' }}
          >
            <X size={20} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>

          {/* Call History - give more vertical space */}
          <div className="space-y-3 max-h-[72vh] overflow-y-auto px-2 pb-3">
          {thread.transcriptions.map((call, index) => (
            <motion.div
              key={call.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
                className="p-3 rounded-lg cursor-pointer"
              style={{ 
                background: 'var(--background-subtle)',
                border: '1px solid var(--card-border)'
              }}
              onClick={() => openCallDetail(call)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Phone size={16} style={{ color: 'var(--color-primary)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {formatTimestamp(call.startTime)}
                  </span>
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {formatDuration(call.callDuration)}
                </div>
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {call.transcriptSummary || 'Geen samenvatting beschikbaar'}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Call Detail Modal Component
interface CallDetailModalProps {
  call: Transcription;
  onClose: () => void;
  formatTimestamp: (timestamp: number) => string;
  formatDuration: (seconds: number) => string;
}

function CallDetailModal({ call, onClose, formatTimestamp, formatDuration }: CallDetailModalProps) {
  const [showSummary, setShowSummary] = useState(false);
  return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="va-section-card w-full max-h-[92vh] overflow-hidden rounded-t-2xl"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-2 px-4">
          <div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
              Gesprek Details
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {formatTimestamp(call.startTime)} • {formatDuration(call.callDuration)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg"
            style={{ background: 'var(--background-subtle)' }}
          >
            <X size={14} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>

        {/* Summary - clearer affordance with preview + chevron */}
        {call.transcriptSummary && (
          <div className="mx-4 mb-2">
            <button
              onClick={() => setShowSummary((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg"
              style={{ background: 'var(--background-subtle)', border: '1px solid var(--card-border)' }}
            >
              <div className="flex items-center gap-2">
                <FileText size={14} style={{ color: 'var(--color-primary)' }} />
                <div className="text-left">
                  <div className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>Samenvatting</div>
                  {!showSummary && (
                    <div
                      className="text-[11px]"
                      style={{ color: 'var(--color-text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                    >
                      Tik om te bekijken · {call.transcriptSummary}
                    </div>
                  )}
                </div>
              </div>
              <div>
                {showSummary ? (
                  <ChevronUp size={16} style={{ color: 'var(--color-text-secondary)' }} />
                ) : (
                  <ChevronDown size={16} style={{ color: 'var(--color-text-secondary)' }} />
                )}
              </div>
            </button>

            <AnimatePresence initial={false}>
              {showSummary && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 p-2 rounded-lg" style={{ background: 'var(--background-subtle)', border: '1px solid var(--card-border)' }}>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      {call.transcriptSummary}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Transcript - taller scroll area */}
        <div className="max-h-[72vh] overflow-y-auto px-4 pb-6">
          <h4 className="font-medium mb-3 text-sm" style={{ color: 'var(--color-text-primary)' }}>
            Transcript
          </h4>
          <div className="space-y-2">
            {call.transcript.map((message, index) => (
              <TranscriptMessage
                key={index}
                message={message}
                formatDuration={formatDuration}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}