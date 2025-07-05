'use client';

import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Phone, BarChart3, User, Calendar } from 'lucide-react';

const navigationItems = [
  { icon: Home, label: 'Home', href: '/mobile-v3' },
  { icon: Phone, label: 'Calls', href: '/mobile-v3/transcriptions' },
  { icon: Calendar, label: 'Calendar', href: '/mobile-v3/calendar' },
  { icon: BarChart3, label: 'Analytics', href: '/mobile-v3/analytics' },
  { icon: User, label: 'Profile', href: '/mobile-v3/profile' }
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Home indicator */}
      <div className="flex justify-center pb-2">
        <div className="w-32 h-1 bg-black rounded-full"></div>
      </div>
      
      {/* Navigation */}
      <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around items-center">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <motion.button
                key={item.href}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(item.href)}
                className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon 
                  size={20} 
                  className={`mb-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} 
                />
                <span className="text-xs font-medium">{item.label}</span>
                
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}