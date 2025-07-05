"use client";

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface StatsOverviewProps {
  clientId?: string | null;
}

interface Stats {
  totalCalls: number;
  thisMonth: number;
  avgDuration: number;
  latestCall: number | null;
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
  companyName: string;
  created_at: string;
  client_id?: string;
}

export default function StatsOverview({ clientId }: StatsOverviewProps) {
  const [stats, setStats] = useState<Stats>({
    totalCalls: 0,
    thisMonth: 0,
    avgDuration: 0,
    latestCall: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Add clientId to query params if available
        const url = clientId 
          ? `/api/transcriptions?clientId=${clientId}&t=${new Date().getTime()}`
          : `/api/transcriptions?t=${new Date().getTime()}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch transcriptions');
        }
        
        const data = await response.json();
        const rawTranscriptions = data.transcriptions || [];
        
        // Ensure all transcriptions have valid properties
        const transcriptions: Transcription[] = rawTranscriptions.map((t: any) => ({
          ...t,
          transcript: Array.isArray(t.transcript) ? t.transcript : [],
          callDuration: typeof t.callDuration === 'number' ? t.callDuration : 0,
          startTime: typeof t.startTime === 'number' ? t.startTime : 0
        }));
        
        // Sort transcriptions by startTime in descending order (newest first)
        transcriptions.sort((a, b) => b.startTime - a.startTime);
        
        // Calculate stats from all transcriptions
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayOfMonthTimestamp = Math.floor(firstDayOfMonth.getTime() / 1000);
        
        // Get this month's transcriptions
        const thisMonthTranscriptions = transcriptions.filter((t: Transcription) => {
          return t.startTime >= firstDayOfMonthTimestamp;
        });
        
        // Get latest call date
        let latestCall = null;
        if (transcriptions.length > 0) {
          // Find the call with the latest startTime
          latestCall = transcriptions.reduce((max, t) => t.startTime > max ? t.startTime : max, 0);
        }
        
        // Calculate average duration
        const totalDuration = transcriptions.reduce((sum: number, t: Transcription) => sum + (t.callDuration || 0), 0);
        const avgDuration = transcriptions.length > 0 ? Math.round(totalDuration / transcriptions.length) : 0;
        
        setStats({
          totalCalls: transcriptions.length,
          thisMonth: thisMonthTranscriptions.length,
          avgDuration: avgDuration || 0,
          latestCall: latestCall
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Er is een fout opgetreden bij het ophalen van de statistieken.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [clientId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-700 h-32 rounded-lg"></div>
        ))}
      </div>
    );
  }

  // Format date
  const formatTimestamp = (timestamp: number | null) => {
    if (!timestamp) return 'Geen data';
    
    try {
      const date = new Date(timestamp * 1000);
      return new Intl.DateTimeFormat('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      return 'Ongeldige datum';
    }
  };

  // Format time (seconds to mm:ss)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-100 dark:border-blue-800">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 uppercase">Totaal aantal gesprekken</h3>
        <p className="mt-2 text-3xl font-semibold text-blue-900 dark:text-blue-100">{stats.totalCalls}</p>
      </div>
      
      <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-100 dark:border-green-800">
        <h3 className="text-sm font-medium text-green-800 dark:text-green-300 uppercase">Deze maand</h3>
        <p className="mt-2 text-3xl font-semibold text-green-900 dark:text-green-100">{stats.thisMonth}</p>
      </div>
      
      <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-100 dark:border-purple-800">
        <h3 className="text-sm font-medium text-purple-800 dark:text-purple-300 uppercase">Gemiddelde duur</h3>
        <p className="mt-2 text-3xl font-semibold text-purple-900 dark:text-purple-100">{formatTime(stats.avgDuration)}</p>
      </div>
      
      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg border border-indigo-100 dark:border-indigo-800">
        <h3 className="text-sm font-medium text-indigo-800 dark:text-indigo-300 uppercase">Laatste gesprek</h3>
        <p className="mt-2 text-xl font-semibold text-indigo-900 dark:text-indigo-100">{formatTimestamp(stats.latestCall)}</p>
      </div>
    </div>
  );
} 