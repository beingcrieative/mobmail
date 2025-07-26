export interface DashboardStats {
  todayVoicemails: number;
  timeSaved: number;
  weeklyTrend: number;
  totalTranscriptions: number;
  unreadCount: number;
  avgDuration: number;
}

export interface Transcription {
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
  client_id?: string;
}

export interface RecentActivity {
  id: string;
  type: 'voicemail' | 'call' | 'transcription' | 'insight';
  title: string;
  subtitle: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AnalyticsData {
  totalVoicemails: number;
  timeSaved: number;
  averageCallDuration: number;
  weeklyGrowth: number;
  monthlyStats: {
    month: string;
    voicemails: number;
    timeSaved: number;
  }[];
  dailyStats: {
    day: string;
    count: number;
  }[];
  priorityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
}

export class StatisticsService {
  /**
   * Fetch real transcription data from API
   */
  static async fetchTranscriptions(userId: string): Promise<Transcription[]> {
    try {
      console.log('Fetching transcriptions for user:', userId);
      const response = await fetch(`/api/transcriptions?clientId=${userId}&t=${new Date().getTime()}`);
      
      if (!response.ok) {
        console.error('API response not ok:', response.status, response.statusText);
        throw new Error(`Failed to fetch data: ${response.status}`);
      }
      
      const data = await response.json();
      const transcriptions: Transcription[] = data.transcriptions || [];
      
      console.log('Fetched transcriptions:', transcriptions.length);
      return transcriptions;
    } catch (error) {
      console.error('Error fetching transcriptions:', error);
      return [];
    }
  }

  /**
   * Calculate dashboard statistics from transcription data
   */
  static calculateDashboardStats(transcriptions: Transcription[]): DashboardStats {
    // Calculate real stats
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayTimestamp = Math.floor(todayStart.getTime() / 1000);
    
    const todayTranscriptions = transcriptions.filter(t => t.startTime >= todayTimestamp);
    const totalDuration = transcriptions.reduce((sum, t) => sum + (t.callDuration || 0), 0);
    const avgDuration = transcriptions.length > 0 ? Math.round(totalDuration / transcriptions.length) : 0;
    
    // Calculate time saved (assuming 2 minutes saved per transcription)
    const timeSavedMinutes = transcriptions.length * 2;
    
    return {
      todayVoicemails: todayTranscriptions.length,
      timeSaved: timeSavedMinutes,
      weeklyTrend: 12, // Mock trend for now
      totalTranscriptions: transcriptions.length,
      unreadCount: transcriptions.length, // All are considered unread for now
      avgDuration
    };
  }

  /**
   * Generate recent activity from transcription data
   */
  static generateRecentActivity(transcriptions: Transcription[]): RecentActivity[] {
    return transcriptions
      .slice(0, 3)
      .map((t, index) => {
        const timeAgo = this.formatTimeAgo(t.startTime);
        return {
          id: t.id,
          type: 'transcription' as const,
          title: 'Voicemail transcriptie',
          subtitle: `${t.customerName || 'Onbekende beller'} - ${t.transcriptSummary?.substring(0, 50) || 'Transcriptie beschikbaar'}...`,
          time: timeAgo,
          priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low'
        };
      });
  }

  /**
   * Calculate comprehensive analytics data
   */
  static calculateAnalyticsData(transcriptions: Transcription[]): AnalyticsData {
    const totalVoicemails = transcriptions.length;
    const timeSaved = transcriptions.length * 2; // 2 minutes saved per transcription
    const totalDuration = transcriptions.reduce((sum, t) => sum + (t.callDuration || 0), 0);
    const averageCallDuration = totalVoicemails > 0 ? Math.round(totalDuration / totalVoicemails) : 0;

    // Calculate weekly growth (mock for now)
    const weeklyGrowth = 12;

    // Generate monthly stats
    const monthlyStats = this.generateMonthlyStats(transcriptions);
    
    // Generate daily stats for the last 7 days
    const dailyStats = this.generateDailyStats(transcriptions);

    // Generate priority distribution (mock distribution)
    const priorityDistribution = {
      high: Math.round(totalVoicemails * 0.2),
      medium: Math.round(totalVoicemails * 0.5),
      low: Math.round(totalVoicemails * 0.3)
    };

    return {
      totalVoicemails,
      timeSaved,
      averageCallDuration,
      weeklyGrowth,
      monthlyStats,
      dailyStats,
      priorityDistribution
    };
  }

  /**
   * Generate monthly statistics
   */
  private static generateMonthlyStats(transcriptions: Transcription[]) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
    const monthlyData: { [key: string]: number } = {};

    // Group transcriptions by month
    transcriptions.forEach(t => {
      const date = new Date(t.startTime * 1000);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    // Convert to array format
    return Object.entries(monthlyData)
      .map(([month, voicemails]) => ({
        month,
        voicemails,
        timeSaved: voicemails * 2 // 2 minutes saved per voicemail
      }))
      .slice(-6); // Last 6 months
  }

  /**
   * Generate daily statistics for the last 7 days
   */
  private static generateDailyStats(transcriptions: Transcription[]) {
    const dailyData: { [key: string]: number } = {};
    const dayNames = ['Zon', 'Maa', 'Din', 'Woe', 'Don', 'Vri', 'Zat'];

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayKey = dayNames[date.getDay()];
      dailyData[dayKey] = 0;
    }

    // Count transcriptions per day
    transcriptions.forEach(t => {
      const date = new Date(t.startTime * 1000);
      const dayKey = dayNames[date.getDay()];
      if (dailyData.hasOwnProperty(dayKey)) {
        dailyData[dayKey]++;
      }
    });

    return Object.entries(dailyData).map(([day, count]) => ({ day, count }));
  }

  /**
   * Format timestamp to human readable time ago
   */
  private static formatTimeAgo(timestamp: number): string {
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
  }

  /**
   * Get comprehensive statistics for a user
   */
  static async getUserStatistics(userId: string): Promise<{
    dashboardStats: DashboardStats;
    recentActivity: RecentActivity[];
    analyticsData: AnalyticsData;
  }> {
    try {
      const transcriptions = await this.fetchTranscriptions(userId);
      
      return {
        dashboardStats: this.calculateDashboardStats(transcriptions),
        recentActivity: this.generateRecentActivity(transcriptions),
        analyticsData: this.calculateAnalyticsData(transcriptions)
      };
    } catch (error) {
      console.error('Error getting user statistics:', error);
      
      // Return empty/default stats on error
      const emptyStats: DashboardStats = {
        todayVoicemails: 0,
        timeSaved: 0,
        weeklyTrend: 0,
        totalTranscriptions: 0,
        unreadCount: 0,
        avgDuration: 0
      };

      const emptyAnalytics: AnalyticsData = {
        totalVoicemails: 0,
        timeSaved: 0,
        averageCallDuration: 0,
        weeklyGrowth: 0,
        monthlyStats: [],
        dailyStats: [],
        priorityDistribution: { high: 0, medium: 0, low: 0 }
      };

      return {
        dashboardStats: emptyStats,
        recentActivity: [],
        analyticsData: emptyAnalytics
      };
    }
  }
}