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
}

export default function Header({ 
  title, 
  showBack = false, 
  showSettings = false, 
  showNotifications = false,
  onBack 
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
    router.push('/mobile-v3/notifications');
  };

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center">
          {showBack && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 mr-3"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </motion.button>
          )}
          
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {showNotifications && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleNotifications}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 relative"
            >
              <Bell size={20} className="text-gray-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
            </motion.button>
          )}
          
          {showSettings && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/mobile-v3/settings')}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Settings size={20} className="text-gray-600" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}