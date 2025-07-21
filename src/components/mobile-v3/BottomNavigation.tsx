'use client';

import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Phone, MessageSquare, User, BarChart3 } from 'lucide-react';

const navigationItems = [
  { icon: Home, label: 'Home', href: '/mobile-v3' },
  { icon: Phone, label: 'Transcripties', href: '/mobile-v3/transcriptions' },
  { icon: BarChart3, label: 'Analytics', href: '/mobile-v3/analytics' },
  { icon: MessageSquare, label: 'Assistant', href: '/mobile-v3/agent' },
  { icon: User, label: 'Profile', href: '/mobile-v3/profile' }
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 mobile-bottom-nav">
      {/* Home indicator - Glassmorphism */}
      <div className="flex justify-center pb-2">
        <div 
          className="w-32 h-1 rounded-full"
          style={{
            background: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'var(--glass-backdrop-blur-light)'
          }}
        ></div>
      </div>
      
      {/* Navigation - Clean Style */}
      <div 
        className="clean-navigation px-4"
        style={{
          background: 'var(--card-background)',
          borderTop: '1px solid var(--card-border)',
          boxShadow: '0 -2px 12px rgba(0, 0, 0, 0.06)',
          height: '80px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div className="flex justify-around items-center w-full">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <motion.button
                key={item.href}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.02, y: -1 }}
                onClick={() => router.push(item.href)}
                className="flex flex-col items-center py-2 px-3 relative"
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                  background: isActive ? 'rgba(74, 144, 226, 0.1)' : 'transparent',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'var(--transition-default)',
                  minWidth: '60px'
                }}
              >
                <Icon 
                  size={20} 
                  style={{
                    marginBottom: '4px',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    transition: 'var(--transition-fast)'
                  }}
                />
                <span 
                  className="text-xs font-medium"
                  style={{
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontSize: 'var(--font-size-tiny)',
                    fontWeight: isActive ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)'
                  }}
                >
                  {item.label}
                </span>
                
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: 'var(--color-primary)' }}
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