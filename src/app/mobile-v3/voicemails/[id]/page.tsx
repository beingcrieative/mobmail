'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Clock, User, FileText, Play, Pause, ArrowLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/mobile-v3/Header';
import BottomNavigation from '@/components/mobile-v3/BottomNavigation';

interface TranscriptionDetail {
  id: string;
  customerName: string;
  externalNumber: string;
  startTime: number;
  callDuration: number;
  transcriptSummary: string;
  transcript: Array<{
    role: string;
    message: string;
    timeInCallSecs?: number;
  }>;
  callDirection: string;
  agentNumber: string;
  companyName: string;
  status: string;
  client_id?: string;
}

export default function VoicemailDetailPage() {
  const [transcription, setTranscription] = useState<TranscriptionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const router = useRouter();
  const params = useParams();
  const voicemailId = params?.id as string;

  useEffect(() => {
    const fetchTranscriptionDetail = async () => {
      try {
        setLoading(true);
        
        // Get user ID
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
        
        if (!userId || !voicemailId) {
          router.push('/mobile-v3/voicemails');
          return;
        }
        
        const response = await fetch(`/api/transcriptions?clientId=${userId}&t=${new Date().getTime()}`);
        if (!response.ok) throw new Error('Failed to fetch transcriptions');
        
        const data = await response.json();
        const transcriptions = data.transcriptions || [];
        
        // Find the specific transcription
        const foundTranscription = transcriptions.find((t: any) => t.id === voicemailId);
        
        if (!foundTranscription) {
          router.push('/mobile-v3/voicemails');
          return;
        }
        
        setTranscription(foundTranscription);
      } catch (error) {
        console.error('Error fetching transcription detail:', error);
        router.push('/mobile-v3/voicemails');
      } finally {
        setLoading(false);
      }
    };

    fetchTranscriptionDetail();
  }, [voicemailId, router]);

  const formatTimestamp = (timestamp: number) => {
    try {
      const date = new Date(timestamp * 1000);
      return date.toLocaleDateString('nl-NL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
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

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In a real app, this would control audio playback
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Transcriptie laden...</p>
        </div>
      </div>
    );
  }

  if (!transcription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Phone size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Transcriptie niet gevonden
          </h3>
          <p className="text-gray-600 mb-4">
            De gevraagde transcriptie kon niet worden gevonden.
          </p>
          <button
            onClick={() => router.push('/mobile-v3/voicemails')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Terug naar voicemails
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header 
        title="Voicemail Details" 
        showBack 
        onBack={() => router.push('/mobile-v3/voicemails')}
      />

      <div className="px-4 py-6">
        {/* Call Info Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={24} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {transcription.customerName || 'Onbekende beller'}
                </h2>
                <p className="text-gray-600">{transcription.externalNumber}</p>
              </div>
            </div>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handlePlayPause}
              className="p-3 rounded-full bg-blue-500 text-white"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </motion.button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Clock size={16} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Datum</p>
                <p className="font-medium text-gray-900">
                  {formatTimestamp(transcription.startTime)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Phone size={16} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Duur</p>
                <p className="font-medium text-gray-900">
                  {formatDuration(transcription.callDuration)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-50 rounded-2xl p-6 mb-6 border border-blue-100"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <span className="text-xl mr-2">🤖</span>
            AI Samenvatting
          </h3>
          <p className="text-blue-700 leading-relaxed">
            {transcription.transcriptSummary || 'Geen samenvatting beschikbaar'}
          </p>
        </motion.div>

        {/* Full Transcription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText size={20} className="mr-2" />
            Volledige Transcriptie
          </h3>
          
          {Array.isArray(transcription.transcript) && transcription.transcript.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {transcription.transcript.map((message, index) => (
                message.message && (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className={`p-4 rounded-xl ${
                      message.role === 'agent' 
                        ? 'bg-blue-50 border-l-4 border-blue-400 ml-4' 
                        : 'bg-green-50 border-l-4 border-green-400 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {message.role === 'agent' ? '👤 Agent' : '📞 Beller'}
                      </span>
                      {message.timeInCallSecs !== undefined && (
                        <span className="text-xs text-gray-500">
                          {formatDuration(message.timeInCallSecs)}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-800 leading-relaxed">
                      {message.message}
                    </p>
                  </motion.div>
                )
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Geen transcriptie beschikbaar</p>
            </div>
          )}
        </motion.div>

        {/* Call Metadata */}
        {(transcription.companyName || transcription.callDirection || transcription.status) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-50 rounded-2xl p-6 mt-6 border border-gray-200"
          >
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Gesprek Details</h4>
            <div className="space-y-3">
              {transcription.companyName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Bedrijf:</span>
                  <span className="font-medium text-gray-900">{transcription.companyName}</span>
                </div>
              )}
              {transcription.callDirection && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Richting:</span>
                  <span className="font-medium text-gray-900">
                    {transcription.callDirection === 'inbound' ? 'Inkomend' : 'Uitgaand'}
                  </span>
                </div>
              )}
              {transcription.status && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-gray-900">{transcription.status}</span>
                </div>
              )}
              {transcription.agentNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Agent nummer:</span>
                  <span className="font-medium text-gray-900">{transcription.agentNumber}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}