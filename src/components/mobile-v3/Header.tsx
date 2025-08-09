'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, MoreVertical, Settings, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showSettings?: boolean;
  showNotifications?: boolean;
  onBack?: () => void;
  onNotificationClick?: () => void;
}

export default function Header({ 
  title, 
  subtitle,
  showBack = false, 
  showSettings = false, 
  showNotifications = false,
  onBack,
  onNotificationClick
}: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleNotifications = () => {
    if (onNotificationClick) {
      onNotificationClick();
    } else {
      router.push('/mobile-v3/notifications');
    }
  };

  return (
    <div className="va-header" style={{ padding: 'var(--spacing-md)', minHeight: '64px', display: 'flex', alignItems: 'center' }}>
      <div className="flex items-center justify-between w-full">
        {/* Left side */}
        <div className="flex items-center">
          {showBack && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.02, y: -1 }}
              onClick={handleBack}
              className="mr-3"
              style={{
                padding: '8px',
                borderRadius: '12px',
                background: 'transparent',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(0,0,0,0.08)',
                transition: 'var(--transition-default)'
              }}
            >
              <ArrowLeft 
                size={20} 
                style={{ color: 'var(--color-primary)' }} 
              />
            </motion.button>
          )}
          <div className="flex flex-col">
            <h1 className="va-header-title">
              {title}
            </h1>
            {subtitle && (
              <p className="va-header-subtitle">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {showNotifications && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.02, y: -1 }}
              onClick={handleNotifications}
              className="relative"
              style={{
                padding: '8px',
                borderRadius: '12px',
                background: 'transparent',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(0,0,0,0.08)',
                transition: 'var(--transition-default)'
              }}
            >
              <Bell 
                size={20} 
                style={{ color: 'var(--color-primary)' }} 
              />
              <div 
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2"
                style={{
                  background: 'var(--color-error)',
                  borderColor: 'white'
                }}
              ></div>
            </motion.button>
          )}

          {showSettings && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.02, y: -1 }}
              onClick={() => router.push('/mobile-v3/settings')}
              style={{
                padding: '8px',
                borderRadius: '12px',
                background: 'transparent',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(0,0,0,0.08)',
                transition: 'var(--transition-default)'
              }}
            >
              <Settings 
                size={20} 
                style={{ color: 'var(--color-primary)' }} 
              />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}