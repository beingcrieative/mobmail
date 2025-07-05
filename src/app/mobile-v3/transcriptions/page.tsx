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
  companyName: string;
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
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'caller'>('date');
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchTranscriptions();
  }, []);

  useEffect(() => {
    filterAndSortTranscriptions();
  }, [transcriptions, searchTerm, dateFilter, sortBy]);

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
        t.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.externalNumber?.includes(searchTerm) ||
        t.transcriptSummary?.toLowerCase().includes(searchTerm.toLowerCase())
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
    }

    // Apply sorting
    switch (sortBy) {
      case 'date':
        filtered.sort((a, b) => b.startTime - a.startTime);
        break;
      case 'duration':
        filtered.sort((a, b) => b.callDuration - a.callDuration);
        break;
      case 'caller':
        filtered.sort((a, b) => (a.customerName || '').localeCompare(b.customerName || ''));
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Transcripties laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Transcripties" showBack />

      <div className="px-4 py-4">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Overzicht</h2>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 disabled:opacity-50"
            >
              <RefreshCw size={16} className={`text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{transcriptions.length}</p>
              <p className="text-xs text-gray-600">Totaal</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {transcriptions.filter(t => {
                  const today = new Date();
                  const todayStart = Math.floor(new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() / 1000);
                  return t.startTime >= todayStart;
                }).length}
              </p>
              <p className="text-xs text-gray-600">Vandaag</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {transcriptions.length > 0 
                  ? formatDuration(Math.round(transcriptions.reduce((sum, t) => sum + t.callDuration, 0) / transcriptions.length))
                  : '0:00'
                }
              </p>
              <p className="text-xs text-gray-600">Gem. duur</p>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100"
        >
          {/* Search */}
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Zoek op naam, nummer of inhoud..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filter Toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-between w-full p-2 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center">
              <Filter size={16} className="text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Filters</span>
            </div>
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </motion.button>

          {/* Filter Options */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-4"
              >
                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Periode</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { key: 'all', label: 'Alle' },
                      { key: 'today', label: 'Vandaag' },
                      { key: 'week', label: 'Week' },
                      { key: 'month', label: 'Maand' }
                    ].map((filter) => (
                      <motion.button
                        key={filter.key}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDateFilter(filter.key as any)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                          dateFilter === filter.key
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {filter.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Sort Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sorteren op</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'date', label: 'Datum' },
                      { key: 'duration', label: 'Duur' },
                      { key: 'caller', label: 'Beller' }
                    ].map((sort) => (
                      <motion.button
                        key={sort.key}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSortBy(sort.key as any)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                          sortBy === sort.key
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {sort.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Count */}
        <div className="mb-4">
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

function TranscriptionCard({
  transcription,
  isExpanded,
  onToggleExpand,
  formatTimestamp,
  formatDuration,
  getTimeAgo,
  index
}: TranscriptionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <User size={16} className="text-gray-400" />
              <h3 className="font-semibold text-gray-900">
                {transcription.customerName || 'Onbekende beller'}
              </h3>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <span>{transcription.externalNumber}</span>
              <span>•</span>
              <span>{formatDuration(transcription.callDuration)}</span>
              <span>•</span>
              <span>{getTimeAgo(transcription.startTime)}</span>
            </div>
          </div>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onToggleExpand}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} className="text-gray-600" />
            </motion.div>
          </motion.button>
        </div>

        {/* AI Summary */}
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-start space-x-2">
            <span className="text-lg">🤖</span>
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">AI Samenvatting</p>
              <p className="text-sm text-blue-700">
                {transcription.transcriptSummary || 'Geen samenvatting beschikbaar'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-100"
          >
            <div className="p-4 space-y-4">
              {/* Call Details */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
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
                {transcription.companyName && (
                  <div className="col-span-2">
                    <span className="text-xs text-gray-500">Bedrijf</span>
                    <p className="font-medium text-gray-900">{transcription.companyName}</p>
                  </div>
                )}
              </div>

              {/* Full Transcript */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <FileText size={16} className="mr-2" />
                  Volledige Transcriptie
                </h4>
                <div className="max-h-64 overflow-y-auto bg-gray-50 rounded-lg p-3">
                  {Array.isArray(transcription.transcript) && transcription.transcript.length > 0 ? (
                    <div className="space-y-3">
                      {transcription.transcript.map((message, idx) => (
                        message.message && (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg ${
                              message.role === 'agent' 
                                ? 'bg-blue-100 border-l-3 border-blue-400 ml-2' 
                                : 'bg-green-100 border-l-3 border-green-400 mr-2'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-700">
                                {message.role === 'agent' ? '👤 Agent' : '📞 Beller'}
                              </span>
                              {message.timeInCallSecs !== undefined && (
                                <span className="text-xs text-gray-500">
                                  {formatDuration(message.timeInCallSecs)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-800">{message.message}</p>
                          </div>
                        )
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Geen gedetailleerde transcriptie beschikbaar
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 py-2 px-3 bg-blue-500 text-white rounded-lg text-sm font-medium"
                >
                  📞 Terugbellen
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 py-2 px-3 bg-green-500 text-white rounded-lg text-sm font-medium"
                >
                  ✉️ Email
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 py-2 px-3 bg-purple-500 text-white rounded-lg text-sm font-medium"
                >
                  📅 Afspraak
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}