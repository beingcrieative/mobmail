"use client";

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { toast } from 'react-toastify';

interface TranscriptionsTableProps {
  clientId?: string | null;
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

export default function TranscriptionsTable({ clientId }: TranscriptionsTableProps) {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    const fetchTranscriptions = async () => {
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
        console.log('Transcriptions fetched:', data);
        
        // Ensure all transcriptions have a valid transcript array
        const validatedTranscriptions = data.transcriptions?.map((item: any) => ({
          ...item,
          transcript: Array.isArray(item.transcript) ? item.transcript : []
        })) || [];
        
        // Sort transcriptions by startTime in descending order (newest first)
        const sortedTranscriptions = [...validatedTranscriptions].sort((a, b) => b.startTime - a.startTime);
        
        setTranscriptions(sortedTranscriptions);
      } catch (error) {
        console.error('Error fetching transcriptions:', error);
        toast.error('Er is een fout opgetreden bij het ophalen van de transcripties.');
      } finally {
        setLoading(false);
      }
    };

    fetchTranscriptions();
  }, [clientId]);

  const toggleExpandRow = (id: string) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    try {
      const date = new Date(timestamp * 1000); // Convert UNIX timestamp to JavaScript Date
      return format(date, 'dd MMMM yyyy, HH:mm', { locale: nl });
    } catch (error) {
      return 'Ongeldige datum';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center my-8">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (transcriptions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Geen transcripties gevonden</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Er zijn nog geen voicemail transcripties beschikbaar.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Datum
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Klant
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Telefoonnummer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Duur
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {transcriptions.map((item) => (
              <React.Fragment key={item.id}>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatTimestamp(item.startTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {item.customerName || 'Onbekend'} ({item.companyName || 'N/A'})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {item.externalNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDuration(item.callDuration)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => toggleExpandRow(item.id)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      {expandedRow === item.id ? 'Verbergen' : 'Tonen'}
                    </button>
                  </td>
                </tr>
                {expandedRow === item.id && (
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Samenvatting</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {item.transcriptSummary}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Volledige transcriptie</h4>
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md p-3 max-h-96 overflow-y-auto">
                            {Array.isArray(item.transcript) ? item.transcript.map((message, idx) => (
                              message.message && (
                                <div key={idx} className={`mb-3 ${message.role === 'agent' ? 'pl-3 border-l-2 border-blue-400' : 'pl-3 border-l-2 border-green-400'}`}>
                                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    {message.role === 'agent' ? 'Agent' : 'Klant'} 
                                    {message.timeInCallSecs !== undefined && ` (${message.timeInCallSecs}s)`}
                                  </p>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {message.message}
                                  </p>
                                </div>
                              )
                            )) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400">Geen transcriptie beschikbaar</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 