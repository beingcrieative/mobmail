'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface MobileLayoutProps {
  children: ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Status Bar Simulation */}
      <div className="h-11 bg-black flex items-center justify-center text-white text-sm font-medium">
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full opacity-60"></div>
          </div>
          <span className="ml-2">Proximus</span>
        </div>
        <div className="ml-auto flex items-center space-x-2">
          <span>100%</span>
          <div className="w-6 h-3 border border-white rounded-sm">
            <div className="w-full h-full bg-white rounded-sm"></div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1"
      >
        {children}
      </motion.div>
    </div>
  );
}
