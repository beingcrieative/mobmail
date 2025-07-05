'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Phone, Clock, Archive, Trash2, MoreHorizontal, Play, Pause, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/mobile-v3/Header';
import BottomNavigation from '@/components/mobile-v3/BottomNavigation';

interface Voicemail {
  id: string;
  caller: string;
  phoneNumber: string;
  timestamp: Date;
  duration: number;
  transcription: string;
  aiSummary: string;
  priority: 'high' | 'medium' | 'low';
  listened: boolean;
  archived: boolean;
  actionItems: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

export default function VoicemailsPage() {
  const [voicemails, setVoicemails] = useState<Voicemail[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high' | 'today'>('all');
  const [selectedVoicemail, setSelectedVoicemail] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockVoicemails: Voicemail[] = [
      {
        id: '1',
        caller: 'Sarah de Vries',
        phoneNumber: '+31 6 1234 5678',
        timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        duration: 45,
        transcription: 'Hoi, met Sarah. Ik wilde even bellen over het project waar we het over hadden. Kunnen we volgende week een afspraak inplannen?',
        aiSummary: 'Sarah wil een afspraak inplannen voor projectbesprekking volgende week.',
        priority: 'high',
        listened: false,
        archived: false,
        actionItems: ['Terugbellen Sarah', 'Afspraak inplannen'],
        sentiment: 'positive'
      },
      {
        id: '2',
        caller: 'Dr. Peters',
        phoneNumber: '+31 20 555 0123',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        duration: 32,
        transcription: 'Goedemorgen, u spreekt met Dr. Peters. Uw uitslag is binnen en die is gelukkig goed. U hoeft geen vervolgafspraak te maken.',
        aiSummary: 'Goede medische uitslag, geen vervolgafspraak nodig.',
        priority: 'medium',
        listened: true,
        archived: false,
        actionItems: ['Uitslag noteren'],
        sentiment: 'positive'
      },
      {
        id: '3',
        caller: 'Onbekend',
        phoneNumber: '+31 85 XXX XXXX',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        duration: 18,
        transcription: 'Goedemorgen, u spreekt met Mark van EnergieDirect. Wij hebben een speciale aanbieding...',
        aiSummary: 'Commercieel gesprek EnergieDirect - mogelijk spam.',
        priority: 'low',
        listened: false,
        archived: false,
        actionItems: [],
        sentiment: 'neutral'
      }
    ];

    setVoicemails(mockVoicemails);
    setLoading(false);
  }, []);

  const filteredVoicemails = voicemails.filter(vm => {
    if (vm.archived) return false;
    
    switch (filter) {
      case 'unread': return !vm.listened;
      case 'high': return vm.priority === 'high';
      case 'today': {
        const today = new Date();
        return vm.timestamp.toDateString() === today.toDateString();
      }
      default: return true;
    }
  });

  const handleSwipe = (id: string, direction: 'left' | 'right') => {
    setVoicemails(prev => 
      prev.map(vm => 
        vm.id === id 
          ? { 
              ...vm, 
              archived: direction === 'right',
              listened: true 
            }
          : vm
      )
    );
  };

  const handlePlayPause = (id: string) => {
    setIsPlaying(prev => prev === id ? null : id);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min geleden`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} uur geleden`;
    } else {
      return date.toLocaleDateString('nl-NL');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      default: return 'text-gray-400';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <CheckCircle size={16} className="text-green-500" />;
      case 'negative': return <AlertCircle size={16} className="text-red-500" />;
      default: return <div className="w-4 h-4 rounded-full bg-gray-300"></div>;
    }
  };

  const getUnreadCount = () => voicemails.filter(vm => !vm.listened && !vm.archived).length;
  const getHighPriorityCount = () => voicemails.filter(vm => vm.priority === 'high' && !vm.listened && !vm.archived).length;
  const getTodayCount = () => voicemails.filter(vm => {
    const today = new Date();
    return vm.timestamp.toDateString() === today.toDateString() && !vm.archived;
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Voicemails laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Voicemails" showBack />

      {/* Quick Stats */}
      <div className="px-4 py-4 bg-white border-b border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{getUnreadCount()}</p>
            <p className="text-xs text-gray-600">Ongelezen</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{getHighPriorityCount()}</p>
            <p className="text-xs text-gray-600">Urgent</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{getTodayCount()}</p>
            <p className="text-xs text-gray-600">Vandaag</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-4 bg-white">
        <div className="flex space-x-2">
          {[
            { key: 'all', label: 'Alle', count: filteredVoicemails.length },
            { key: 'unread', label: 'Ongelezen', count: getUnreadCount() },
            { key: 'high', label: 'Urgent', count: getHighPriorityCount() },
            { key: 'today', label: 'Vandaag', count: getTodayCount() }
          ].map((tab) => (
            <motion.button
              key={tab.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(tab.key as any)}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                  {tab.count}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Gesture Hint */}
      <div className="mx-4 mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-sm text-blue-700 text-center">
          💡 Swipe rechts om te archiveren, links om te verwijderen
        </p>
      </div>

      {/* Voicemail List */}
      <div className="px-4 py-4 space-y-4">
        <AnimatePresence>
          {filteredVoicemails.map((voicemail) => (
            <VoicemailCard
              key={voicemail.id}
              voicemail={voicemail}
              isPlaying={isPlaying === voicemail.id}
              onSwipe={handleSwipe}
              onPlayPause={handlePlayPause}
              onClick={() => setSelectedVoicemail(voicemail.id)}
              isExpanded={selectedVoicemail === voicemail.id}
            />
          ))}
        </AnimatePresence>

        {filteredVoicemails.length === 0 && (
          <div className="text-center py-12">
            <Phone size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Geen voicemails
            </h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'Je hebt geen voicemails' 
                : 'Geen voicemails in deze categorie'
              }
            </p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}

interface VoicemailCardProps {
  voicemail: Voicemail;
  isPlaying: boolean;
  onSwipe: (id: string, direction: 'left' | 'right') => void;
  onPlayPause: (id: string) => void;
  onClick: () => void;
  isExpanded: boolean;
}

function VoicemailCard({ voicemail, isPlaying, onSwipe, onPlayPause, onClick, isExpanded }: VoicemailCardProps) {
  const [dragX, setDragX] = useState(0);

  const handlePan = (event: any, info: PanInfo) => {
    setDragX(info.offset.x);
  };

  const handlePanEnd = (event: any, info: PanInfo) => {
    const { offset } = info;
    const swipeThreshold = 100;

    if (Math.abs(offset.x) > swipeThreshold) {
      if (offset.x > 0) {
        onSwipe(voicemail.id, 'right'); // Archive
      } else {
        onSwipe(voicemail.id, 'left'); // Delete
      }
    }
    setDragX(0);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min geleden`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} uur geleden`;
    } else {
      return date.toLocaleDateString('nl-NL');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <CheckCircle size={16} className="text-green-500" />;
      case 'negative': return <AlertCircle size={16} className="text-red-500" />;
      default: return <div className="w-4 h-4 rounded-full bg-gray-300"></div>;
    }
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl"
      drag="x"
      dragConstraints={{ left: -200, right: 200 }}
      dragElastic={0.1}
      onPan={handlePan}
      onPanEnd={handlePanEnd}
      whileDrag={{ scale: 0.98 }}
    >
      {/* Swipe Actions Background */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 bg-green-500 flex items-center justify-start pl-6">
          <div className="text-white">
            <Archive size={24} />
            <p className="text-sm font-medium mt-1">Archiveer</p>
          </div>
        </div>
        <div className="w-1/2 bg-red-500 flex items-center justify-end pr-6">
          <div className="text-white">
            <Trash2 size={24} />
            <p className="text-sm font-medium mt-1">Verwijder</p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <motion.div
        className={`bg-white rounded-2xl border-2 transition-all duration-200 ${getPriorityColor(voicemail.priority)}`}
        style={{ x: dragX }}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <div className="flex items-center space-x-2">
                  <User size={16} className="text-gray-400" />
                  <h3 className="font-semibold text-gray-900">{voicemail.caller}</h3>
                </div>
                {!voicemail.listened && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
                {getSentimentIcon(voicemail.sentiment)}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{formatTime(voicemail.timestamp)}</span>
                <span>•</span>
                <span>{formatDuration(voicemail.duration)}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayPause(voicemail.id);
                }}
                className="p-2 rounded-full bg-blue-100 hover:bg-blue-200"
              >
                {isPlaying ? 
                  <Pause size={16} className="text-blue-600" /> : 
                  <Play size={16} className="text-blue-600" />
                }
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/mobile-v3/voicemails/${voicemail.id}`;
                }}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
              >
                <MoreHorizontal size={16} className="text-gray-600" />
              </motion.button>
            </div>
          </div>

          {/* AI Summary */}
          <div className="mb-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-700 font-medium">🤖 AI Samenvatting</p>
            <p className="text-sm text-blue-600 mt-1">{voicemail.aiSummary}</p>
          </div>

          {/* Action Items */}
          {voicemail.actionItems.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {voicemail.actionItems.map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                >
                  ⏰ {item}
                </span>
              ))}
            </div>
          )}

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-200 pt-3 mt-3"
              >
                <h4 className="font-medium text-gray-900 mb-2">Volledige transcriptie</h4>
                <p className="text-sm text-gray-600 leading-relaxed p-3 bg-gray-50 rounded-lg">
                  {voicemail.transcription}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}