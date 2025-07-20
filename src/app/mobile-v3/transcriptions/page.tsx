'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Clock, User, FileText, Play, Pause, ArrowLeft, RefreshCw, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
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


export default function TranscriptionsPage() {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [filteredTranscriptions, setFilteredTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'last3months' | 'custom'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'duration'>('date');
  const [showFilters, setShowFilters] = useState(false);
  const [durationFilter, setDurationFilter] = useState<'all' | 'short' | 'medium' | 'long'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchTranscriptions();
  }, []);

  useEffect(() => {
    filterAndSortTranscriptions();
  }, [transcriptions, searchTerm, dateFilter, sortBy, durationFilter, customStartDate, customEndDate]);

  // Get call type based on duration
  const getCallType = (transcription: Transcription): 'short' | 'medium' | 'long' => {
    const duration = transcription.callDuration || 0;
    
    if (duration < 60) return 'short';
    if (duration < 180) return 'medium';
    return 'long';
  };


  const fetchTranscriptions = async () => {
    try {
      setLoading(true);
      
      const getUserId = () => {
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
      
      const response = await fetch(`/api/transcriptions?clientId=${userId}&t=${new Date().getTime()}`);
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

  const filterAndSortTranscriptions = () => {
    let filtered = [...transcriptions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(t => 
        (t.customerName || t.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.externalNumber || t.caller_phone || '').includes(searchTerm) ||
        (t.transcriptSummary || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }


    // Apply date filter
    const now = new Date();
    switch (dateFilter) {
      case 'today':
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayTimestamp = Math.floor(todayStart.getTime() / 1000);
        filtered = filtered.filter(t => t.startTime >= todayTimestamp);
        break;
      case 'week':
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weekTimestamp = Math.floor(weekStart.getTime() / 1000);
        filtered = filtered.filter(t => t.startTime >= weekTimestamp);
        break;
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthTimestamp = Math.floor(monthStart.getTime() / 1000);
        filtered = filtered.filter(t => t.startTime >= monthTimestamp);
        break;
      case 'last3months':
        const threeMonthsStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        const threeMonthsTimestamp = Math.floor(threeMonthsStart.getTime() / 1000);
        filtered = filtered.filter(t => t.startTime >= threeMonthsTimestamp);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          const startTimestamp = Math.floor(new Date(customStartDate).getTime() / 1000);
          const endTimestamp = Math.floor(new Date(customEndDate + 'T23:59:59').getTime() / 1000);
          filtered = filtered.filter(t => t.startTime >= startTimestamp && t.startTime <= endTimestamp);
        }
        break;
    }

    // Apply duration filter
    if (durationFilter !== 'all') {
      filtered = filtered.filter(t => {
        const callType = getCallType(t);
        return callType === durationFilter;
      });
    }

    // Apply sorting - simplified
    switch (sortBy) {
      case 'date':
        filtered.sort((a, b) => b.startTime - a.startTime);
        break;
      case 'duration':
        filtered.sort((a, b) => b.callDuration - a.callDuration);
        break;
      default:
        // Default sorting by recency
        filtered.sort((a, b) => b.startTime - a.startTime);
        break;
    }

    setFilteredTranscriptions(filtered);
  };

  const toggleExpandRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const formatTimestamp = (timestamp: number) => {
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

  if (loading) {
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
        {/* Header Stats - Enhanced Analytics Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          <motion.div 
            whileHover={{ y: -2 }}
            className="blabla-card hover-lift"
          >
            <div className="flex items-center justify-between mb-3" style={{
              background: 'rgba(99, 102, 241, 0.05)',
              margin: '-20px -20px 12px -20px',
              padding: '12px 20px',
              borderBottom: '1px solid #e2e8f0',
              borderRadius: '12px 12px 0 0'
            }}>
              <Phone size={20} className="text-blue-500" />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-1 rounded bg-white/80 hover:bg-white disabled:opacity-50 transition-colors"
              >
                <RefreshCw size={14} className={`text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {transcriptions.filter(t => {
                const today = new Date();
                const todayStart = Math.floor(new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() / 1000);
                return t.startTime >= todayStart;
              }).length}
            </p>
            <p className="text-sm text-gray-600">Vandaag ontvangen</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -2 }}
            className="blabla-card hover-lift"
          >
            <div className="flex items-center justify-between mb-3" style={{
              background: 'rgba(99, 102, 241, 0.05)',
              margin: '-20px -20px 12px -20px',
              padding: '12px 20px',
              borderBottom: '1px solid #e2e8f0',
              borderRadius: '12px 12px 0 0'
            }}>
              <Clock size={20} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {transcriptions.length > 0 
                ? formatMinutes(Math.round(transcriptions.reduce((sum, t) => sum + t.callDuration, 0) / transcriptions.length / 60))
                : '0m'
              }
            </p>
            <p className="text-sm text-gray-600">Gem. transcriptieduur</p>
          </motion.div>
        </motion.div>

        {/* Enhanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          {/* Advanced Filter Toggle */}
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-900">Filters</h4>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              <Filter size={14} />
              <span>{showFilters ? 'Minder filters' : 'Meer filters'}</span>
              {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </motion.button>
          </div>

          {/* Basic Date Filters */}
          <div className="blabla-card-compact flex space-x-2 mb-4">
            {[
              { key: 'all', label: 'Alle' },
              { key: 'today', label: 'Vandaag' },
              { key: 'week', label: 'Deze week' },
              { key: 'month', label: 'Deze maand' },
            ].map((filter) => (
              <motion.button
                key={filter.key}
                whileTap={{ scale: 0.95 }}
                whileHover={{ y: -1 }}
                onClick={() => setDateFilter(filter.key as any)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  dateFilter === filter.key
                    ? 'text-white shadow-sm'
                    : 'hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: dateFilter === filter.key ? 'var(--color-primary)' : 'transparent',
                  color: dateFilter === filter.key ? 'var(--color-text-white)' : 'var(--color-text-secondary)'
                }}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>
          
          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 mb-4"
              >
                {/* Extended Date Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Uitgebreide datumfilters</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'last3months', label: 'Laatste 3 maanden' },
                      { key: 'custom', label: 'Aangepast bereik' },
                    ].map((filter) => (
                      <motion.button
                        key={filter.key}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDateFilter(filter.key as any)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          dateFilter === filter.key
                            ? 'text-white shadow-sm'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                        style={{
                          backgroundColor: dateFilter === filter.key ? 'var(--color-primary)' : undefined
                        }}
                      >
                        {filter.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Custom Date Range */}
                {dateFilter === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Van datum</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tot datum</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Duration Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gespreksduur</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { key: 'all', label: 'Alle' },
                      { key: 'short', label: 'Kort (<1min)' },
                      { key: 'medium', label: 'Gemiddeld (1-3min)' },
                      { key: 'long', label: 'Lang (>3min)' },
                    ].map((filter) => (
                      <motion.button
                        key={filter.key}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDurationFilter(filter.key as any)}
                        className={`py-2 px-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                          durationFilter === filter.key
                            ? 'text-white shadow-sm'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                        style={{
                          backgroundColor: durationFilter === filter.key ? 'var(--color-primary)' : undefined
                        }}
                      >
                        {filter.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Zoek in transcripties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="blabla-input w-full pl-10 pr-4 py-3"
              style={{
                borderColor: 'var(--card-border)',
                fontSize: 'var(--font-size-body)'
              }}
            />
          </div>
        </motion.div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Recente transcripties</h3>
          <p className="text-sm text-gray-600">
            {filteredTranscriptions.length} van {transcriptions.length} transcripties
          </p>
        </div>

        {/* Transcriptions List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredTranscriptions.map((transcription, index) => (
              <TranscriptionCard
                key={transcription.id}
                transcription={transcription}
                isExpanded={expandedRow === transcription.id}
                onToggleExpand={() => toggleExpandRow(transcription.id)}
                formatTimestamp={formatTimestamp}
                formatDuration={formatDuration}
                getTimeAgo={getTimeAgo}
                index={index}
              />
            ))}
          </AnimatePresence>

          {filteredTranscriptions.length === 0 && (
            <div className="text-center py-12">
              <Phone size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Geen transcripties gevonden
              </h3>
              <p className="text-gray-600">
                {searchTerm || dateFilter !== 'all' 
                  ? 'Probeer andere zoekfilters'
                  : 'Er zijn nog geen voicemail transcripties beschikbaar'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}

interface TranscriptionCardProps {
  transcription: Transcription;
  isExpanded: boolean;
  onToggleExpand: () => void;
  formatTimestamp: (timestamp: number) => string;
  formatDuration: (seconds: number) => string;
  getTimeAgo: (timestamp: number) => string;
  index: number;
}

// Helper function to normalize transcription data
const normalizeTranscriptionData = (transcription: Transcription) => ({
  customerName: transcription.customerName || transcription.customer_name || 'Onbekende beller',
  companyName: transcription.companyName || transcription.company_name || '',
  phoneNumber: transcription.externalNumber || transcription.caller_phone || '',
  summary: transcription.transcriptSummary || '',
  callType: transcription.callDuration < 60 ? 'Kort' : transcription.callDuration < 180 ? 'Normaal' : 'Lang'
});

// Transcription Card Header Component
interface TranscriptionCardHeaderProps {
  customerName: string;
  startTime: number;
  callType: string;
  getTimeAgo: (timestamp: number) => string;
}

function TranscriptionCardHeader({ customerName, startTime, callType, getTimeAgo }: TranscriptionCardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
          <Phone size={16} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{customerName}</h3>
          <p className="text-sm text-gray-600">{getTimeAgo(startTime)}</p>
        </div>
      </div>
      <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600">
        {callType}
      </span>
    </div>
  );
}

// Call Details Component
interface TranscriptionDetailsProps {
  phoneNumber: string;
  duration: number;
  companyName?: string;
  formatDuration: (seconds: number) => string;
}

function TranscriptionDetails({ phoneNumber, duration, companyName, formatDuration }: TranscriptionDetailsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 p-3 rounded-lg mb-4 bg-gray-50">
      <div>
        <span className="text-xs text-gray-500">Telefoonnummer</span>
        <p className="font-medium text-gray-900 font-mono text-sm">{phoneNumber}</p>
      </div>
      <div>
        <span className="text-xs text-gray-500">Gespreksduur</span>
        <p className="font-medium text-gray-900">{formatDuration(duration)}</p>
      </div>
      {companyName && (
        <div className="col-span-2">
          <span className="text-xs text-gray-500">Bedrijf</span>
          <p className="font-medium text-gray-900">{companyName}</p>
        </div>
      )}
    </div>
  );
}

// Summary Component
interface TranscriptionSummaryProps {
  summary: string;
}

function TranscriptionSummary({ summary }: TranscriptionSummaryProps) {
  if (!summary) return null;

  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-gray-900 mb-2">Samenvatting</h4>
      <p className="text-sm text-gray-600 leading-relaxed">
        {summary.length > 120 ? summary.substring(0, 120) + '...' : summary}
      </p>
    </div>
  );
}

// Actions Component
interface TranscriptionActionsProps {
  phoneNumber: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function TranscriptionActions({ phoneNumber, isExpanded, onToggleExpand }: TranscriptionActionsProps) {
  return (
    <div className="flex space-x-2">
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ y: -1 }}
        className="blabla-button-primary flex-1 flex items-center justify-center space-x-2"
        onClick={() => window.open(`tel:${phoneNumber}`, '_self')}
      >
        <Phone size={14} />
        <span>Bellen</span>
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ y: -1 }}
        onClick={onToggleExpand}
        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200"
      >
        <ChevronDown size={16} className={`text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
      </motion.button>
    </div>
  );
}

// Transcript Message Component
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
    <div className={`flex ${isAgent ? 'justify-start' : 'justify-end'} mb-3`}>
      <div className={`max-w-[80%] p-3 rounded-xl ${
        isAgent 
          ? 'bg-blue-50 border border-blue-200 rounded-bl-sm' 
          : 'bg-green-50 border border-green-200 rounded-br-sm'
      }`}>
        <div className={`flex items-center mb-1 ${isAgent ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className={`w-2 h-2 rounded-full ${
            isAgent ? 'bg-blue-500 mr-2' : 'bg-green-500 ml-2'
          }`}></div>
          <span className="text-xs font-medium text-gray-600">
            {isAgent ? 'Agent' : 'Beller'}
          </span>
          {message.timeInCallSecs !== undefined && (
            <span className={`text-xs text-gray-500 ${
              isAgent ? 'ml-auto' : 'mr-auto'
            }`}>
              {formatDuration(message.timeInCallSecs)}
            </span>
          )}
        </div>
        <p className={`text-sm text-gray-800 leading-relaxed ${
          isAgent ? 'text-left' : 'text-right'
        }`}>
          {message.message}
        </p>
      </div>
    </div>
  );
}

// Expanded Content Component
interface TranscriptionExpandedProps {
  transcription: Transcription;
  formatTimestamp: (timestamp: number) => string;
  formatDuration: (seconds: number) => string;
}

function TranscriptionExpanded({ transcription, formatTimestamp, formatDuration }: TranscriptionExpandedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t border-gray-100 mt-4 pt-4"
    >
      <div className="space-y-4">
        {/* Extended Details */}
        <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-gray-50">
          <div>
            <span className="text-xs text-gray-500">Datum & Tijd</span>
            <p className="font-medium text-gray-900">{formatTimestamp(transcription.startTime)}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Richting</span>
            <p className="font-medium text-gray-900">
              {transcription.callDirection === 'inbound' ? 'Inkomend' : 'Uitgaand'}
            </p>
          </div>
        </div>

        {/* Full Transcript */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <FileText size={16} className="mr-2 text-gray-400" />
              Volledige transcriptie
            </h4>
          </div>
          <div className="max-h-64 overflow-y-auto rounded-lg p-4 border border-slate-200 bg-gray-50">
            {Array.isArray(transcription.transcript) && transcription.transcript.length > 0 ? (
              <div className="space-y-3">
                {transcription.transcript.map((message, idx) => (
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
              <p className="text-sm text-gray-500 text-center py-8">
                Geen gedetailleerde transcriptie beschikbaar
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Main Transcription Card Component (now much cleaner)
function TranscriptionCard({
  transcription,
  isExpanded,
  onToggleExpand,
  formatTimestamp,
  formatDuration,
  getTimeAgo,
  index
}: TranscriptionCardProps) {
  const normalizedData = normalizeTranscriptionData(transcription);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className="blabla-card hover-lift mb-4"
    >
      <TranscriptionCardHeader
        customerName={normalizedData.customerName}
        startTime={transcription.startTime}
        callType={normalizedData.callType}
        getTimeAgo={getTimeAgo}
      />
      
      <TranscriptionDetails
        phoneNumber={normalizedData.phoneNumber}
        duration={transcription.callDuration}
        companyName={normalizedData.companyName}
        formatDuration={formatDuration}
      />
      
      <TranscriptionSummary summary={normalizedData.summary} />
      
      <TranscriptionActions
        phoneNumber={normalizedData.phoneNumber}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      />

      <AnimatePresence>
        {isExpanded && (
          <TranscriptionExpanded
            transcription={transcription}
            formatTimestamp={formatTimestamp}
            formatDuration={formatDuration}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}