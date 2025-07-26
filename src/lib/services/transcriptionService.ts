// Transcription service for voicemail operations
import { ApiService } from './apiService';
import type { ApiResponse } from './types/api';

// Transcription types
export interface CallTranscription {
  id: string;
  client_id: string;
  call_timestamp: string;
  transcript: TranscriptSegment[];
  summary?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  action_items?: string[];
  priority?: 'high' | 'medium' | 'low';
  status: 'new' | 'read' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface TranscriptSegment {
  speaker: string;
  text: string;
  timestamp: number;
  confidence: number;
}

export interface TranscriptionFilters {
  clientId?: string;
  status?: 'new' | 'read' | 'archived';
  priority?: 'high' | 'medium' | 'low';
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}


/**
 * Transcription service class
 * Handles voicemail transcription operations
 */
export class TranscriptionService {
  private static readonly ENDPOINTS = {
    transcriptions: '/api/transcriptions',
    transcription: (id: string) => `/api/transcriptions/${id}`,
    summary: (id: string) => `/api/transcriptions/${id}/summary`,
    analytics: '/api/transcriptions/analytics',
  };

  /**
   * Fetch all transcriptions with optional filters
   */
  static async fetchTranscriptions(filters?: TranscriptionFilters): Promise<ApiResponse<CallTranscription[]>> {
    try {
      const queryParams: Record<string, any> = {};
      
      if (filters) {
        if (filters.clientId) queryParams.clientId = filters.clientId;
        if (filters.status) queryParams.status = filters.status;
        if (filters.priority) queryParams.priority = filters.priority;
        if (filters.dateFrom) queryParams.dateFrom = filters.dateFrom;
        if (filters.dateTo) queryParams.dateTo = filters.dateTo;
        if (filters.limit) queryParams.limit = filters.limit;
        if (filters.offset) queryParams.offset = filters.offset;
      }

      const response = await ApiService.get<{ transcriptions: CallTranscription[] }>(
        this.ENDPOINTS.transcriptions,
        queryParams,
        { cache: true }
      );

      if (!response.success) {
        return {
          success: false,
          data: [],
          error: response.error || 'Failed to fetch transcriptions',
        };
      }

      // Ensure transcript is always an array
      const validatedTranscriptions = response.data?.transcriptions?.map(item => ({
        ...item,
        transcript: Array.isArray(item.transcript) ? item.transcript : [],
      })) || [];

      return {
        success: true,
        data: validatedTranscriptions,
        error: null,
      };
    } catch (error) {
      console.error('Transcriptions fetch error:', error);
      return {
        success: false,
        data: [],
        error: 'Failed to fetch transcriptions',
      };
    }
  }

  /**
   * Fetch single transcription by ID
   */
  static async fetchTranscription(id: string): Promise<ApiResponse<CallTranscription>> {
    try {
      const response = await ApiService.get<CallTranscription>(
        this.ENDPOINTS.transcription(id),
        undefined,
        { cache: true }
      );

      if (!response.success) {
        return {
          success: false,
          data: undefined,
          error: response.error || 'Failed to fetch transcription',
        };
      }

      // Ensure transcript is always an array
      const validatedTranscription = {
        ...response.data!,
        transcript: Array.isArray(response.data!.transcript) ? response.data!.transcript : [],
      };

      return {
        success: true,
        data: validatedTranscription,
        error: null,
      };
    } catch (error) {
      console.error('Transcription fetch error:', error);
      return {
        success: false,
        data: undefined,
        error: 'Failed to fetch transcription',
      };
    }
  }

  /**
   * Update transcription status
   */
  static async updateTranscriptionStatus(
    id: string, 
    status: 'new' | 'read' | 'archived'
  ): Promise<ApiResponse<CallTranscription>> {
    try {
      const response = await ApiService.patch<CallTranscription>(
        this.ENDPOINTS.transcription(id),
        { status }
      );

      if (!response.success) {
        return {
          success: false,
          data: undefined,
          error: response.error || 'Failed to update transcription status',
        };
      }

      // Clear transcriptions cache
      ApiService.clearCache('/api/transcriptions');

      return {
        success: true,
        data: response.data,
        error: null,
      };
    } catch (error) {
      console.error('Transcription status update error:', error);
      return {
        success: false,
        data: undefined,
        error: 'Failed to update transcription status',
      };
    }
  }

  /**
   * Archive transcription
   */
  static async archiveTranscription(id: string): Promise<ApiResponse<boolean>> {
    return this.updateTranscriptionStatus(id, 'archived').then(response => ({
      success: response.success,
      data: response.success,
      error: response.error,
    }));
  }

  /**
   * Mark transcription as read
   */
  static async markAsRead(id: string): Promise<ApiResponse<boolean>> {
    return this.updateTranscriptionStatus(id, 'read').then(response => ({
      success: response.success,
      data: response.success,
      error: response.error,
    }));
  }

  /**
   * Delete transcription
   */
  static async deleteTranscription(id: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await ApiService.delete(this.ENDPOINTS.transcription(id));

      if (!response.success) {
        return {
          success: false,
          data: false,
          error: response.error || 'Failed to delete transcription',
        };
      }

      // Clear transcriptions cache
      ApiService.clearCache('/api/transcriptions');

      return {
        success: true,
        data: true,
        error: null,
      };
    } catch (error) {
      console.error('Transcription deletion error:', error);
      return {
        success: false,
        data: false,
        error: 'Failed to delete transcription',
      };
    }
  }

  /**
   * Generate AI summary for transcription
   */
  static async generateSummary(id: string): Promise<ApiResponse<{ summary: string; actionItems: string[] }>> {
    try {
      const response = await ApiService.post<{ summary: string; actionItems: string[] }>(
        this.ENDPOINTS.summary(id)
      );

      if (!response.success) {
        return {
          success: false,
          data: undefined,
          error: response.error || 'Failed to generate summary',
        };
      }

      return {
        success: true,
        data: response.data,
        error: null,
      };
    } catch (error) {
      console.error('Summary generation error:', error);
      return {
        success: false,
        data: undefined,
        error: 'Failed to generate summary',
      };
    }
  }

  /**
   * Get transcription analytics
   */
  static async getAnalytics(dateRange?: { from: string; to: string }): Promise<ApiResponse<{
    totalTranscriptions: number;
    newTranscriptions: number;
    averageCallDuration: number;
    sentimentDistribution: Record<string, number>;
    topActionItems: string[];
    callVolumeByHour: Record<string, number>;
  }>> {
    try {
      const queryParams: Record<string, any> = {};
      if (dateRange) {
        queryParams.from = dateRange.from;
        queryParams.to = dateRange.to;
      }

      const response = await ApiService.get(
        this.ENDPOINTS.analytics,
        queryParams,
        { cache: true }
      );

      if (!response.success) {
        return {
          success: false,
          data: undefined,
          error: response.error || 'Failed to fetch analytics',
        };
      }

      return {
        success: true,
        data: response.data,
        error: null,
      };
    } catch (error) {
      console.error('Analytics fetch error:', error);
      return {
        success: false,
        data: undefined,
        error: 'Failed to fetch analytics',
      };
    }
  }

  /**
   * Search transcriptions by text content
   */
  static async searchTranscriptions(
    query: string, 
    filters?: TranscriptionFilters
  ): Promise<ApiResponse<CallTranscription[]>> {
    try {
      const queryParams: Record<string, any> = { q: query };
      
      if (filters) {
        Object.assign(queryParams, filters);
      }

      const response = await ApiService.get<{ transcriptions: CallTranscription[] }>(
        `${this.ENDPOINTS.transcriptions}/search`,
        queryParams
      );

      if (!response.success) {
        return {
          success: false,
          data: [],
          error: response.error || 'Failed to search transcriptions',
        };
      }

      const validatedTranscriptions = response.data?.transcriptions?.map(item => ({
        ...item,
        transcript: Array.isArray(item.transcript) ? item.transcript : [],
      })) || [];

      return {
        success: true,
        data: validatedTranscriptions,
        error: null,
      };
    } catch (error) {
      console.error('Transcription search error:', error);
      return {
        success: false,
        data: [],
        error: 'Failed to search transcriptions',
      };
    }
  }

  /**
   * Export transcriptions
   */
  static async exportTranscriptions(
    format: 'csv' | 'json' | 'pdf', 
    filters?: TranscriptionFilters
  ): Promise<ApiResponse<Blob>> {
    try {
      const queryParams: Record<string, any> = { format };
      
      if (filters) {
        Object.assign(queryParams, filters);
      }

      const response = await fetch(
        `${this.ENDPOINTS.transcriptions}/export?${new URLSearchParams(queryParams)}`,
        {
          method: 'GET',
          headers: {
            'Accept': format === 'pdf' ? 'application/pdf' : format === 'csv' ? 'text/csv' : 'application/json',
          },
        }
      );

      if (!response.ok) {
        return {
          success: false,
          data: undefined,
          error: `Export failed: ${response.statusText}`,
        };
      }

      const blob = await response.blob();

      return {
        success: true,
        data: blob,
        error: null,
      };
    } catch (error) {
      console.error('Export error:', error);
      return {
        success: false,
        data: undefined,
        error: 'Failed to export transcriptions',
      };
    }
  }

  /**
   * Get real-time transcription stats
   */
  static async getRealtimeStats(): Promise<ApiResponse<{
    totalToday: number;
    newCount: number;
    averageResponseTime: number;
    systemStatus: 'online' | 'offline' | 'maintenance';
  }>> {
    try {
      const response = await ApiService.get(
        `${this.ENDPOINTS.transcriptions}/stats`,
        undefined,
        { cache: false } // Always fresh data for stats
      );

      if (!response.success) {
        return {
          success: false,
          data: undefined,
          error: response.error || 'Failed to fetch stats',
        };
      }

      return {
        success: true,
        data: response.data,
        error: null,
      };
    } catch (error) {
      console.error('Stats fetch error:', error);
      return {
        success: false,
        data: undefined,
        error: 'Failed to fetch real-time stats',
      };
    }
  }
}