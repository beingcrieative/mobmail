'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/mobile-v3/Header';
import BottomNavigation from '@/components/mobile-v3/BottomNavigation';
import MobileUserCalendar from '@/components/mobile-v3/calendar/MobileUserCalendar';

export default function CalendarPage() {
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedUserId = localStorage.getItem('userId') || 'user-123';
      setUserId(storedUserId);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen clean-background flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
          ></div>
          <p style={{ color: 'var(--color-text-secondary)' }}>Kalender laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen clean-background pb-20">
      <Header title="Kalender" showBack />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-2"
      >
        <MobileUserCalendar userId={userId} />
      </motion.div>

      <BottomNavigation />
    </div>
  );
}