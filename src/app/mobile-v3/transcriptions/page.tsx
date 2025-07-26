'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Phone, Clock, User, FileText, Play, Pause, ArrowLeft, RefreshCw, Search, Filter, ChevronDown, ChevronUp, MessageCircle, Archive, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/mobile-v3/Header';
import BottomNavigation from '@/components/mobile-v3/BottomNavigation';

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
  }, [conversationThreads, searchTerm, dateFilter]);

  // Get call type based on duration
  const getCallType = (transcription: Transcription): 'short' | 'medium' | 'long' => {
    const duration = transcription.callDuration || 0;
    
    if (duration < 60) return 'short';
    if (duration < 180) return 'medium';
    return 'long';
  };

  const fetchTranscriptions = async () => {
    if (!mounted) return;
    
    try {
      setLoading(true);
      
      const getUserId = () => {
        if (typeof window === 'undefined') return null;
        
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) return storedUserId;
        
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
          return null;
        };
        
        return getCookie('userId');
      };
      
      const userId = getUserId();
      
      if (!userId) {
        setTranscriptions([]);
        setLoading(false);
        return;
      }
      
      const response = await fetch(`/api/transcriptions?clientId=${userId}&t=${Date.now()}`);
      if (!response.ok) throw new Error('Failed to fetch transcriptions');
      
      const data = await response.json();
      const rawTranscriptions = data.transcriptions || [];
      
      // Validate and process transcriptions
      const validatedTranscriptions = rawTranscriptions.map((item: any) => ({
        ...item,
        transcript: Array.isArray(item.transcript) ? item.transcript : []
      }));
      
      // Sort by newest first
      const sortedTranscriptions = validatedTranscriptions.sort((a: any, b: any) => b.startTime - a.startTime);
      
      setTranscriptions(sortedTranscriptions);
    } catch (error) {
      console.error('Error fetching transcriptions:', error);
      setTranscriptions([]);
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
    if (!transcriptions.length) {
      setConversationThreads([]);
      return;
    }
    
    const threadsMap = new Map<string, ConversationThread>();
    
    transcriptions.forEach(transcription => {
      const normalizedData = normalizeTranscriptionData(transcription);
      const key = normalizedData.phoneNumber || 'unknown';
      
      if (!threadsMap.has(key)) {
        threadsMap.set(key, {
          customerName: normalizedData.customerName,
          phoneNumber: normalizedData.phoneNumber,
          companyName: normalizedData.companyName,
          transcriptions: [],
          lastCallTime: transcription.startTime,
          totalCalls: 0
        });
      }
      
      const thread = threadsMap.get(key)!;
      thread.transcriptions.push(transcription);
      thread.totalCalls = thread.transcriptions.length;
      
      // Update last call time if this is more recent
      if (transcription.startTime > thread.lastCallTime) {
        thread.lastCallTime = transcription.startTime;
        // Update name/company info with most recent call
        thread.customerName = normalizedData.customerName;
        thread.companyName = normalizedData.companyName;
      }
    });
    
    // Convert to array and sort by last call time
    const threads = Array.from(threadsMap.values())
      .map(thread => ({
        ...thread,
        transcriptions: thread.transcriptions.sort((a, b) => b.startTime - a.startTime)
      }))
      .sort((a, b) => b.lastCallTime - a.lastCallTime);
    
    console.log('Generated conversation threads:', threads);
    setConversationThreads(threads);
  };

  const filterThreads = () => {
    let filtered = [...conversationThreads];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(thread => 
        thread.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        thread.phoneNumber.includes(searchTerm) ||
        (thread.companyName || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date filter
    if (mounted) {
      const now = new Date();
      switch (dateFilter) {
        case 'today':
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const todayTimestamp = Math.floor(todayStart.getTime() / 1000);
          filtered = filtered.filter(thread => thread.lastCallTime >= todayTimestamp);
          break;
        case 'week':
          const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const weekTimestamp = Math.floor(weekStart.getTime() / 1000);
          filtered = filtered.filter(thread => thread.lastCallTime >= weekTimestamp);
          break;
        case 'month':
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const monthTimestamp = Math.floor(monthStart.getTime() / 1000);
          filtered = filtered.filter(thread => thread.lastCallTime >= monthTimestamp);
          break;
      }
    }

    setFilteredThreads(filtered);
  };

  const openThreadDetail = (thread: ConversationThread) => {
    console.log('Opening thread detail for:', thread);
    if (!thread || !thread.transcriptions || thread.transcriptions.length === 0) {
      console.error('Invalid thread data:', thread);
      return;
    }
    setSelectedThread(thread);
  };

  const closeThreadDetail = () => {
    console.log('Closing thread detail');
    setSelectedThread(null);
  };

  const openCallDetail = (call: Transcription) => {
    console.log('Opening call detail for:', call);
    setSelectedCall(call);
  };

  const closeCallDetail = () => {
    console.log('Closing call detail');
    setSelectedCall(null);
  };

  const formatTimestamp = (timestamp: number) => {
    if (!mounted) return 'Laden...';
    
    try {
      const date = new Date(timestamp * 1000);
      return date.toLocaleDateString('nl-NL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Ongeldige datum';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}u ${mins}m` : `${mins}m`;
  };

  const getTimeAgo = (timestamp: number) => {
    if (!mounted) return 'Laden...';
    
    const now = Math.floor(Date.now() / 1000);
    const diffInSeconds = now - timestamp;
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

  if (!mounted || loading) {
    return (
      <div className="min-h-screen clean-background flex items-center justify-center">
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
    <div className="min-h-screen pb-20 clean-background">
      <Header title="Transcripties" showBack />

      <div className="px-4 py-4">
        {/* Simplified Header Stats - Calm Tech Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between blabla-card mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Phone size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {mounted ? conversationThreads.filter(thread => {
                    const today = new Date();
                    const todayStart = Math.floor(new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() / 1000);
                    return thread.lastCallTime >= todayStart;
                  }).length : 0} actieve gesprekken
                </p>
                <p className="text-sm text-gray-600">vandaag ontvangen</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              <RefreshCw size={16} className={`text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </motion.div>

        {/* Simplified Filters - Calm Tech Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 space-y-4"
        >
          {/* Clean Search Bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Zoek op naam of nummer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Essential Time Filters */}
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'Alle', icon: null },
              { key: 'today', label: 'Vandaag', icon: null },
              { key: 'week', label: 'Deze week', icon: null },
            ].map((filter) => (
              <motion.button
                key={filter.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDateFilter(filter.key as any)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                  dateFilter === filter.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Conversaties</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {filteredThreads.length}
            </span>
          </div>
        </div>

        {/* Conversation Threads */}
        <div className="space-y-3">
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
            <div className="text-center py-12">
              <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Geen conversaties gevonden
              </h3>
              <p className="text-gray-600">
                {searchTerm || dateFilter !== 'all' 
                  ? 'Probeer andere zoekfilters'
                  : 'Er zijn nog geen voicemail gesprekken'
                }
              </p>
            </div>
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
            className="w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <RefreshCw size={20} />
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
const normalizeTranscriptionData = (transcription: Transcription) => ({
  customerName: transcription.customerName || transcription.customer_name || 'Onbekende beller',
  companyName: transcription.companyName || transcription.company_name || '',
  phoneNumber: transcription.externalNumber || transcription.caller_phone || '',
  summary: transcription.transcriptSummary || '',
  callType: transcription.callDuration < 60 ? 'Kort' : transcription.callDuration < 180 ? 'Normaal' : 'Lang'
});

// Conversation Thread Card Component
interface ConversationThreadCardProps {
  thread: ConversationThread;
  onOpen: () => void;
  getTimeAgo: (timestamp: number) => string;
  index: number;
}

function ConversationThreadCard({ thread, onOpen, getTimeAgo, index }: ConversationThreadCardProps) {
  // Ensure we have valid thread data
  if (!thread || !thread.transcriptions || thread.transcriptions.length === 0) {
    console.error('Invalid thread data in card:', thread);
    return null;
  }
  
  const lastCall = thread.transcriptions[0] || thread.transcriptions.find(t => t.startTime === thread.lastCallTime);
  const hasMultipleCalls = thread.totalCalls > 1;
  
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
      className="bg-white rounded-xl p-4 max-fold:p-2 max-fold:rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-center space-x-3 max-fold:space-x-2">
        {/* Customer Avatar */}
        <div className="relative">
          <div className="w-12 h-12 max-fold:w-fold-avatar max-fold:h-fold-avatar rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg max-fold:text-sm">
            {thread.customerName.charAt(0).toUpperCase()}
          </div>
          {hasMultipleCalls && (
            <div className="absolute -top-1 -right-1 w-5 h-5 max-fold:w-fold-badge max-fold:h-fold-badge bg-red-500 rounded-full flex items-center justify-center text-white text-xs max-fold:text-fold-xs font-bold">
              {thread.totalCalls}
            </div>
          )}
        </div>
        
        {/* Conversation Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1 max-fold:mb-0">
            <h3 className="font-semibold text-gray-900 text-base max-fold:text-fold-base truncate">
              {thread.customerName}
            </h3>
            <span className="text-xs max-fold:text-fold-xs text-gray-500 flex-shrink-0">
              {getTimeAgo(thread.lastCallTime)}
            </span>
          </div>
          
          <p className="text-sm max-fold:text-fold-sm text-gray-600 truncate mb-2 max-fold:mb-1">
            {thread.phoneNumber}
          </p>
          
          {/* Last Message Preview */}
          <div className="flex items-center justify-between max-fold:flex-col max-fold:items-start max-fold:space-y-1">
            <p className="text-sm max-fold:text-fold-sm text-gray-500 truncate flex-1 max-fold:w-full">
              {lastCall?.transcriptSummary || 'Geen samenvatting beschikbaar'}
            </p>
            <div className="flex items-center space-x-2 max-fold:space-x-1 ml-2 max-fold:ml-0 flex-shrink-0 max-fold:self-end">
              {hasMultipleCalls && (
                <span className="text-xs max-fold:text-fold-xs bg-blue-100 text-blue-700 px-2 py-1 max-fold:px-1 max-fold:py-0.5 rounded-full">
                  {thread.totalCalls} gesprekken
                </span>
              )}
              <ChevronDown size={16} className="text-gray-400 transform -rotate-90 max-fold:hidden" />
            </div>
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
    <div className={`flex ${isAgent ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`max-w-[85%] ${
        isAgent 
          ? 'bg-white border border-blue-200 shadow-sm' 
          : 'bg-blue-600 text-white shadow-sm'
      } p-3 rounded-2xl ${isAgent ? 'rounded-bl-md' : 'rounded-br-md'}`}>
        <div className={`flex items-center mb-2 ${isAgent ? 'justify-start' : 'justify-end'}`}>
          <div className="flex items-center space-x-2">
            <div className={`w-1.5 h-1.5 rounded-full ${
              isAgent ? 'bg-blue-500' : 'bg-blue-200'
            }`}></div>
            <span className={`text-xs font-medium ${
              isAgent ? 'text-blue-700' : 'text-blue-100'
            }`}>
              {isAgent ? 'VoicemailAI' : 'Beller'}
            </span>
            {message.timeInCallSecs !== undefined && (
              <span className={`text-xs ${
                isAgent ? 'text-gray-500' : 'text-blue-200'
              }`}>
                {formatDuration(message.timeInCallSecs)}
              </span>
            )}
          </div>
        </div>
        <p className={`text-sm leading-relaxed ${
          isAgent ? 'text-gray-800' : 'text-white'
        }`}>
          {message.message}
        </p>
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
  // Ensure we have valid transcriptions
  if (!thread || !thread.transcriptions || thread.transcriptions.length === 0) {
    console.error('No transcriptions found for thread:', thread);
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div className="bg-white rounded-xl p-6 m-4 max-w-sm max-fold:max-w-modal-fold max-xs:max-w-modal-xs">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Geen gespreksdata</h3>
          <p className="text-gray-600 mb-4">Er zijn geen transcripties beschikbaar voor dit gesprek.</p>
          <button 
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg"
          >
            Sluiten
          </button>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl w-full max-w-lg max-fold:max-w-modal-fold max-xs:max-w-modal-xs max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-4 max-fold:p-2 border-b border-gray-100 bg-gray-50 rounded-t-3xl max-fold:rounded-t-xl">
          <div className="flex items-center justify-between mb-3 max-fold:mb-1">
            <div className="flex items-center space-x-3 max-fold:space-x-2">
              <div className="w-10 h-10 max-fold:w-8 max-fold:h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold max-fold:text-sm">
                {thread.customerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 max-fold:text-sm">{thread.customerName}</h2>
                <p className="text-sm max-fold:text-xs text-gray-600">{thread.phoneNumber}</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
            >
              <ChevronDown size={16} className="text-gray-600" />
            </motion.button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex justify-center">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white py-2.5 max-fold:py-1.5 px-6 max-fold:px-4 rounded-xl max-fold:rounded-lg text-sm max-fold:text-xs font-medium flex items-center justify-center space-x-2 max-fold:space-x-1 min-w-[120px]"
              onClick={() => window.open(`tel:${thread.phoneNumber}`, '_self')}
            >
              <Phone size={14} className="max-fold:w-3 max-fold:h-3" />
              <span>Bellen</span>
            </motion.button>
          </div>
        </div>
        
        {/* Call History List - Now the main content */}
        <div className="flex-1 overflow-y-auto p-4 max-fold:p-2" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="space-y-3">
            {thread.transcriptions.map((call, index) => (
              <motion.div
                key={call.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => openCallDetail(call)}
                className="p-4 max-fold:p-2 rounded-xl max-fold:rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-sm">
                        {call.callDirection === 'inbound' ? '📞' : '📱'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatTimestamp(call.startTime)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {call.callDirection === 'inbound' ? 'Inkomend gesprek' : 'Uitgaand gesprek'} • {formatDuration(call.callDuration)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                      {getTimeAgo(call.startTime)}
                    </span>
                  </div>
                </div>
                {call.transcriptSummary && (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {call.transcriptSummary.length > 120 
                      ? call.transcriptSummary.substring(0, 120) + '...' 
                      : call.transcriptSummary
                    }
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-blue-600 font-medium">Tap voor details →</span>
                  <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-xs">›</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
      </motion.div>
    </motion.div>
  );
}

// Individual Call Detail Modal Component
interface CallDetailModalProps {
  call: Transcription;
  onClose: () => void;
  formatTimestamp: (timestamp: number) => string;
  formatDuration: (seconds: number) => string;
}

function CallDetailModal({ call, onClose, formatTimestamp, formatDuration }: CallDetailModalProps) {
  if (!call) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl w-full max-w-lg max-fold:max-w-modal-fold max-xs:max-w-modal-xs max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-4 max-fold:p-2 border-b border-gray-100 bg-gray-50 rounded-t-3xl max-fold:rounded-t-xl">
          <div className="flex items-center justify-between mb-3 max-fold:mb-1">
            <div className="flex items-center space-x-3 max-fold:space-x-2">
              <div className="w-10 h-10 max-fold:w-8 max-fold:h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white max-fold:text-sm">
                {call.callDirection === 'inbound' ? '📞' : '📱'}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 max-fold:text-sm">
                  {call.callDirection === 'inbound' ? 'Inkomend Gesprek' : 'Uitgaand Gesprek'}
                </h2>
                <p className="text-sm max-fold:text-xs text-gray-600">{formatTimestamp(call.startTime)}</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
            >
              <ChevronDown size={16} className="text-gray-600" />
            </motion.button>
          </div>
          
          {/* Call Info Strip */}
          <div className="flex items-center justify-between text-sm max-fold:text-xs bg-white rounded-lg max-fold:rounded-md p-3 max-fold:p-2">
            <div className="flex items-center space-x-4 max-fold:space-x-2">
              <div className="text-center">
                <p className="text-xs max-fold:text-fold-xs text-gray-500 mb-1">Duur</p>
                <p className="font-medium text-gray-900 max-fold:text-xs">{formatDuration(call.callDuration)}</p>
              </div>
              <div className="w-px h-8 max-fold:h-6 bg-gray-200"></div>
              <div className="text-center">
                <p className="text-xs max-fold:text-fold-xs text-gray-500 mb-1">Status</p>
                <p className="font-medium text-green-600 max-fold:text-xs">Voltooid</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Call Content */}
        <div className="flex-1 overflow-y-auto p-4 max-fold:p-2" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="space-y-6">
            {/* Summary */}
            {call.transcriptSummary && (
              <div>
                <div className="flex items-center mb-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-blue-600 text-xs">✨</span>
                  </div>
                  <h3 className="font-medium text-gray-900">Samenvatting</h3>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl max-fold:rounded-lg p-4 max-fold:p-2 border border-blue-100">
                  <p className="text-sm max-fold:text-xs text-blue-900 leading-relaxed">
                    {call.transcriptSummary}
                  </p>
                </div>
              </div>
            )}
            
            {/* Full Transcript */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                    <FileText size={12} className="text-purple-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">Volledig gesprek</h3>
                </div>
                {Array.isArray(call.transcript) && call.transcript.length > 0 && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {call.transcript.filter(m => m.message).length} berichten
                  </span>
                )}
              </div>
              <div className="bg-gray-50 rounded-xl max-fold:rounded-lg p-4 max-fold:p-2 min-h-[300px] max-fold:min-h-[200px] pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>
                {Array.isArray(call.transcript) && call.transcript.length > 0 ? (
                  <div className="space-y-4 pb-8">
                    {call.transcript.map((message, idx) => (
                      message.message && (
                        <TranscriptMessage
                          key={idx}
                          message={message}
                          formatDuration={formatDuration}
                        />
                      )
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">Geen transcriptie beschikbaar</p>
                    <p className="text-xs text-gray-400 mt-1">Dit gesprek heeft geen gedetailleerde transcriptie</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}