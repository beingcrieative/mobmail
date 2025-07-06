'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Clock, TrendingUp, Calendar, Settings, User, BarChart3, PlayCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/mobile-v3/Header';
import BottomNavigation from '@/components/mobile-v3/BottomNavigation';
import { useAuth } from '@/lib/hooks/useAuth';
import AuthDebugInfo from '@/components/mobile-v3/AuthDebugInfo';
import AuthStatus from '@/components/mobile-v3/AuthStatus';
import SupabaseTest from '@/components/debug/SupabaseTest';

interface DashboardStats {
  todayVoicemails: number;
  timeSaved: number;
  weeklyTrend: number;
  totalTranscriptions: number;
  unreadCount: number;
  avgDuration: number;
}

interface RecentActivity {
  id: string;
  type: 'voicemail' | 'call' | 'transcription' | 'insight';
  title: string;
  subtitle: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
}

interface Transcription {
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

export default function MobileHomePage() {
  const { isAuthenticated, user, loading: authLoading, error: authError } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState<DashboardStats>({
    todayVoicemails: 0,
    timeSaved: 0,
    weeklyTrend: 0,
    totalTranscriptions: 0,
    unreadCount: 0,
    avgDuration: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const router = useRouter();

  // Fetch user data when authentication state changes
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.id) {
      console.log('User authenticated, fetching data for:', user.email);
      fetchRealData(user.id);
    } else if (!authLoading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchRealData = async (userId: string) => {
    setDataLoading(true);
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
      
      // Calculate real stats
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayTimestamp = Math.floor(todayStart.getTime() / 1000);
      
      const todayTranscriptions = transcriptions.filter(t => t.startTime >= todayTimestamp);
      const totalDuration = transcriptions.reduce((sum, t) => sum + (t.callDuration || 0), 0);
      const avgDuration = transcriptions.length > 0 ? Math.round(totalDuration / transcriptions.length) : 0;
      
      // Calculate time saved (assuming 2 minutes saved per transcription)
      const timeSavedMinutes = transcriptions.length * 2;
      
      setStats({
        todayVoicemails: todayTranscriptions.length,
        timeSaved: timeSavedMinutes,
        weeklyTrend: 12, // Mock trend for now
        totalTranscriptions: transcriptions.length,
        unreadCount: transcriptions.length, // All are considered unread for now
        avgDuration
      });
      
      // Generate recent activity from real data
      const recentActivities: RecentActivity[] = transcriptions
        .slice(0, 3)
        .map((t, index) => {
          const timeAgo = formatTimeAgo(t.startTime);
          return {
            id: t.id,
            type: 'transcription' as const,
            title: 'Voicemail transcriptie',
            subtitle: `${t.customerName || 'Onbekende beller'} - ${t.transcriptSummary?.substring(0, 50) || 'Transcriptie beschikbaar'}...`,
            time: timeAgo,
            priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low'
          };
        });
      
      setRecentActivity(recentActivities);
      
    } catch (error) {
      console.error('Error fetching real data:', error);
      // Show more specific error information
      if (authError) {
        console.error('Authentication error:', authError);
      }
      // Fallback to empty data with error indication
      setStats({
        todayVoicemails: 0,
        timeSaved: 0,
        weeklyTrend: 0,
        totalTranscriptions: 0,
        unreadCount: 0,
        avgDuration: 0
      });
      setRecentActivity([]);
    } finally {
      setDataLoading(false);
    }
  };

    const formatTimeAgo = (timestamp: number) => {
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

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Goedemorgen';
    if (hour < 18) return 'Goedemiddag';
    return 'Goedenavond';
  };

  const getFirstName = (email: string) => {
    if (!email) return 'Gebruiker';
    return email.split('@')[0].split('.')[0];
  };

  const quickActions = [
    { 
      icon: Phone, 
      label: 'Transcripties', 
      color: 'bg-blue-500',
      route: '/mobile-v3/transcriptions',
      badge: stats.unreadCount > 0 ? stats.unreadCount : null
    },
    { 
      icon: Calendar, 
      label: 'Agenda', 
      color: 'bg-green-500',
      route: '/mobile-v3/calendar',
      badge: null
    },
    { 
      icon: BarChart3, 
      label: 'Analytics', 
      color: 'bg-purple-500',
      route: '/mobile-v3/analytics',
      badge: null
    },
    { 
      icon: Settings, 
      label: 'Instellingen', 
      color: 'bg-gray-500',
      route: '/mobile-v3/settings',
      badge: null
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'voicemail': return Phone;
      case 'transcription': return PlayCircle;
      case 'insight': return TrendingUp;
      default: return Clock;
    }
  };

  const getActivityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-600';
      case 'medium': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticatie controleren...</p>
        </div>
      </div>
    );
  }

  // Show error if authentication failed
  if (!isAuthenticated) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Niet ingelogd</h2>
          <p className="text-gray-600 mb-6">Je bent niet ingelogd. Doorverwijzen naar loginpagina...</p>
          {authError && (
            <p className="text-red-600 text-sm">{authError}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50">
      <Header 
        title="VoicemailAI" 
        showNotifications={stats.unreadCount > 0}
        showSettings={false}
      />

      <div className="px-4 py-6 pb-24">
        <AuthStatus />
        
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {getGreeting()}, {getFirstName(user?.email || '')}!
          </h2>
          <p className="text-gray-600">
            {dataLoading ? 'Gegevens laden...' : `Je hebt ${stats.todayVoicemails} voicemails vandaag verwerkt`}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Clock size={20} className="text-blue-500" />
              <span className="text-xs text-green-600 font-medium">
                +{stats.weeklyTrend}%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.timeSaved}min</p>
            <p className="text-sm text-gray-600">Tijd bespaard</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp size={20} className="text-purple-500" />
              <span className="text-xs text-blue-600 font-medium">
                {stats.totalTranscriptions}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.todayVoicemails}</p>
            <p className="text-sm text-gray-600">Vandaag</p>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Snelle acties</h3>
          <div className="grid grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => router.push(action.route)}
                  className="relative bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center active:bg-gray-50 transition-all duration-200"
                  style={{ 
                    WebkitTapHighlightColor: 'transparent',
                    userSelect: 'none',
                    touchAction: 'manipulation'
                  }}
                >
                  <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-3`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center">
                    {action.label}
                  </span>
                  
                  {action.badge && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{action.badge}</span>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recente activiteit</h3>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center space-x-3 active:bg-gray-50 cursor-pointer transition-all duration-200"
                  style={{ 
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                  }}
                  onClick={() => router.push('/mobile-v3/transcriptions')}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.priority)}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-600">{activity.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Today's Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Vandaag's samenvatting</h3>
            <TrendingUp size={24} className="text-white/80" />
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{stats.totalTranscriptions}</p>
              <p className="text-blue-100 text-sm">Transcripties</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.timeSaved}min</p>
              <p className="text-blue-100 text-sm">Bespaard</p>
            </div>
          </div>
        </motion.div>
      </div>

      <BottomNavigation />
      <AuthDebugInfo />
      <SupabaseTest />
    </div>
  );
}