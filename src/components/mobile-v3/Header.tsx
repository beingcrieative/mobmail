'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, MoreVertical, Settings, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showSettings?: boolean;
  showNotifications?: boolean;
  onBack?: () => void;
  onNotificationClick?: () => void;
}

export default function Header({ 
  title, 
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
    <div 
      style={{
        background: 'linear-gradient(135deg, rgba(22, 138, 173, 0.05) 0%, rgba(26, 117, 159, 0.08) 100%)',
        padding: 'var(--spacing-md)',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid rgba(22, 138, 173, 0.1)'
      }}
    >
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
                padding: 'var(--spacing-sm)',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(22, 138, 173, 0.1)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(22, 138, 173, 0.2)',
                transition: 'var(--transition-default)'
              }}
            >
              <ArrowLeft 
                size={20} 
                style={{ color: 'var(--va-bondi-blue)' }} 
              />
            </motion.button>
          )}
          
          <h1 
            style={{
              fontSize: 'var(--font-size-h2)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-primary)'
            }}
          >
            {title}
          </h1>
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
                padding: 'var(--spacing-sm)',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(22, 138, 173, 0.1)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(22, 138, 173, 0.2)',
                transition: 'var(--transition-default)'
              }}
            >
              <Bell 
                size={20} 
                style={{ color: 'var(--va-bondi-blue)' }} 
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
                padding: 'var(--spacing-sm)',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(22, 138, 173, 0.1)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(22, 138, 173, 0.2)',
                transition: 'var(--transition-default)'
              }}
            >
              <Settings 
                size={20} 
                style={{ color: 'var(--va-bondi-blue)' }} 
              />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}