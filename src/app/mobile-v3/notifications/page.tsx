'use client';

import { motion } from 'framer-motion';
import { Bell, Check, Clock, Mail, Phone, AlertCircle } from 'lucide-react';
import Header from '@/components/mobile-v3/Header';
import BottomNavigation from '@/components/mobile-v3/BottomNavigation';

interface Notification {
  id: string;
  type: 'voicemail' | 'transcription' | 'action' | 'system';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

export default function NotificationsPage() {
  // Mock notifications data
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'voicemail',
      title: 'Nieuwe voicemail',
      message: 'Jan Bakker heeft een voicemail achtergelaten',
      timestamp: Date.now() - 300000, // 5 min ago
      read: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'transcription',
      title: 'Transcriptie gereed',
      message: 'Voicemail van Sarah de Vries is getranscribeerd',
      timestamp: Date.now() - 900000, // 15 min ago
      read: false,
      priority: 'medium'
    },
    {
      id: '3',
      type: 'action',
      title: 'Actie vereist',
      message: 'Agent heeft een nieuwe taak gegenereerd',
      timestamp: Date.now() - 1800000, // 30 min ago
      read: true,
      priority: 'medium'
    },
    {
      id: '4',
      type: 'system',
      title: 'Systeem update',
      message: 'VoicemailAI is bijgewerkt naar versie 2.1',
      timestamp: Date.now() - 3600000, // 1 hour ago
      read: true,
      priority: 'low'
    }
  ];

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'voicemail': return Phone;
      case 'transcription': return Mail;
      case 'action': return AlertCircle;
      case 'system': return Bell;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-400 bg-red-50';
      case 'medium': return 'border-l-yellow-400 bg-yellow-50';
      case 'low': return 'border-l-blue-400 bg-blue-50';
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d geleden`;
    if (hours > 0) return `${hours}u geleden`;
    return `${minutes}m geleden`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Notificaties" showBack />

      <div className="px-4 py-6">
        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bell size={24} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {unreadCount} ongelezen notificaties
                  </h2>
                  <p className="text-sm text-gray-600">
                    {notifications.length} totaal berichten
                  </p>
                </div>
              </div>
              {unreadCount > 0 && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg"
                >
                  Alles markeren als gelezen
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alle notificaties</h3>
          <div className="space-y-3">
            {notifications.map((notification, index) => {
              const Icon = getIcon(notification.type);
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${getPriorityColor(notification.priority)} ${
                    !notification.read ? 'border border-blue-200' : 'border border-gray-100'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      notification.type === 'voicemail' ? 'bg-green-100' :
                      notification.type === 'transcription' ? 'bg-blue-100' :
                      notification.type === 'action' ? 'bg-orange-100' :
                      'bg-gray-100'
                    }`}>
                      <Icon size={18} className={
                        notification.type === 'voicemail' ? 'text-green-600' :
                        notification.type === 'transcription' ? 'text-blue-600' :
                        notification.type === 'action' ? 'text-orange-600' :
                        'text-gray-600'
                      } />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-medium truncate ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                      </div>
                      
                      <p className={`text-sm ${
                        !notification.read ? 'text-gray-700' : 'text-gray-600'
                      }`}>
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Empty State */}
        {notifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Geen notificaties
            </h3>
            <p className="text-gray-600">
              Je hebt momenteel geen nieuwe berichten
            </p>
          </motion.div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}