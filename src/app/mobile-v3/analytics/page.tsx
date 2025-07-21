'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Phone, BarChart3, Calendar, Filter } from 'lucide-react';
import Header from '@/components/mobile-v3/Header';
import BottomNavigation from '@/components/mobile-v3/BottomNavigation';
import { StatisticsService, AnalyticsData } from '@/lib/services/statisticsService';

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
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
        
        if (!userId) {
          setData({
            totalVoicemails: 0,
            timeSaved: 0,
            averageCallDuration: 0,
            weeklyGrowth: 0,
            monthlyStats: [],
            dailyStats: [],
            priorityDistribution: { high: 0, medium: 0, low: 0 }
          });
          setLoading(false);
          return;
        }
        
        // Use shared statistics service
        const { analyticsData } = await StatisticsService.getUserStatistics(userId);
        setData(analyticsData);
        
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        // Fallback to empty data
        setData({
          totalVoicemails: 0,
          timeSaved: 0,
          averageCallDuration: 0,
          weeklyGrowth: 0,
          monthlyStats: [],
          dailyStats: [],
          priorityDistribution: { high: 0, medium: 0, low: 0 }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}u ${mins}m` : `${mins}m`;
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const maxDailyCount = data ? Math.max(...data.dailyStats.map(d => d.count)) : 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Analytics laden...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Kan analytics niet laden</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Analytics" showBack />

      <div className="px-4 py-6">
        {/* Time Range Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex space-x-2 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
            {(['week', 'month', 'year'] as const).map((range) => (
              <motion.button
                key={range}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTimeRange(range)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {range === 'week' ? 'Week' : range === 'month' ? 'Maand' : 'Jaar'}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Phone size={20} className="text-blue-500" />
              <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                +{data.weeklyGrowth}%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{data.totalVoicemails}</p>
            <p className="text-sm text-gray-600">Totaal voicemails</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Clock size={20} className="text-green-500" />
              <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded-full">
                {formatCallDuration(data.averageCallDuration)}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatDuration(data.timeSaved)}</p>
            <p className="text-sm text-gray-600">Tijd bespaard</p>
          </div>
        </motion.div>

        {/* Weekly Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Weekactiviteit</h3>
            <BarChart3 size={20} className="text-gray-400" />
          </div>
          
          <div className="flex items-end justify-between h-32 mb-4">
            {data.dailyStats.map((day, index) => {
              const height = (day.count / maxDailyCount) * 100;
              return (
                <div key={day.day} className="flex flex-col items-center flex-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                    className="w-6 bg-blue-500 rounded-t mb-2 min-h-[4px]"
                  />
                  <span className="text-xs text-gray-600 font-medium">{day.day}</span>
                </div>
              );
            })}
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Deze week: <span className="font-medium text-gray-900">
                {data.dailyStats.reduce((sum, day) => sum + day.count, 0)} voicemails
              </span>
            </p>
          </div>
        </motion.div>

        {/* Priority Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Prioriteitsverdeling</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm font-medium text-gray-900">Hoge prioriteit</span>
              </div>
              <span className="text-sm text-gray-600">{data.priorityDistribution.high}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${data.priorityDistribution.high}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm font-medium text-gray-900">Medium prioriteit</span>
              </div>
              <span className="text-sm text-gray-600">{data.priorityDistribution.medium}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{ width: `${data.priorityDistribution.medium}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-500 rounded"></div>
                <span className="text-sm font-medium text-gray-900">Lage prioriteit</span>
              </div>
              <span className="text-sm text-gray-600">{data.priorityDistribution.low}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gray-500 h-2 rounded-full" 
                style={{ width: `${data.priorityDistribution.low}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        {/* Monthly Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Maandelijkse trends</h3>
            <TrendingUp size={20} className="text-green-500" />
          </div>
          
          <div className="space-y-4">
            {data.monthlyStats.map((month, index) => (
              <motion.div
                key={month.month}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{month.month}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{month.voicemails} voicemails</p>
                    <p className="text-sm text-gray-600">{formatDuration(month.timeSaved)} bespaard</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(month.voicemails / Math.max(...data.monthlyStats.map(m => m.voicemails))) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <BottomNavigation />
    </div>
  );
}