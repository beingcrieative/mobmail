import { ThemeConfig } from '../types';

// Mobile-optimized theme with larger touch targets and simplified design
export const mobileTheme: ThemeConfig = {
  id: 'mobile',
  name: 'Mobile Optimized',
  description: 'Optimized for mobile devices with larger touch targets',
  version: '1.0.0',
  isExperimental: false,
  
  colors: {
    primary: '#00BCD4',
    secondary: '#1DE9B6',
    background: '#F8FAFB',
    surface: '#FFFFFF',
    accent: '#FF9800',
    textPrimary: '#004D40',
    textSecondary: '#757575',
    textMuted: '#BDBDBD',
    textWhite: '#FFFFFF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  
  typography: {
    fontFamily: "'Inter', -apple-system, sans-serif",
    fontSize: {
      h1: '28px', // Smaller for mobile
      h2: '22px',
      h3: '18px',
      body: '16px',
      small: '14px',
      tiny: '12px',
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700,
    },
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '20px', // Slightly smaller for mobile
    xl: '28px',
  },
  
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.06)',
    md: '0 4px 8px rgba(0, 0, 0, 0.1)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.15)',
    primary: '0 2px 8px rgba(0, 188, 212, 0.3)',
    primaryHover: '0 4px 12px rgba(0, 188, 212, 0.4)',
  },
  
  borderRadius: {
    sm: '8px',
    md: '12px', // Smaller for mobile
    lg: '16px',
    full: '9999px',
  },
  
  transitions: {
    default: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fast: 'all 0.15s ease-out',
  },
  
  components: {
    button: {
      primary: {
        base: 'bg-primary text-white rounded-xl px-6 py-4 font-medium shadow-sm border-none min-h-[52px] text-lg', // Larger for mobile
        interactive: 'active:scale-95 transition-all',
        disabled: 'opacity-50 cursor-not-allowed',
      },
      secondary: {
        base: 'bg-transparent text-primary rounded-xl px-6 py-4 font-medium border-2 border-primary min-h-[52px] text-lg',
        interactive: 'active:scale-95 active:bg-primary/5 transition-all',
        disabled: 'opacity-50 cursor-not-allowed',
      },
    },
    card: {
      default: {
        base: 'bg-surface border border-gray-200 rounded-xl p-5 shadow-sm', // Smaller padding for mobile
        elevated: 'active:scale-99 transition-all',
      },
      compact: {
        base: 'bg-surface border border-gray-200 rounded-xl p-4 shadow-sm',
        elevated: 'active:scale-99 transition-all',
      },
    },
    input: {
      base: 'bg-surface border-2 border-gray-200 rounded-lg p-4 shadow-sm transition-fast font-body min-h-[48px] text-lg', // Larger for mobile
      focused: 'outline-none border-primary shadow-[0_0_0_3px_rgba(0,188,212,0.1)]',
      disabled: 'opacity-50 cursor-not-allowed',
    },
    navigation: {
      base: 'bg-surface/90 backdrop-blur-sm border-t border-gray-200 shadow-lg',
      mobile: 'fixed bottom-0 left-0 right-0 z-50 pb-safe', // Safe area padding
    },
  },
  
  cssVariables: {
    '--color-primary': '#00BCD4',
    '--color-secondary': '#1DE9B6',
    '--color-background': '#F8FAFB',
    '--color-surface': '#FFFFFF',
    '--color-accent': '#FF9800',
    '--color-text-primary': '#004D40',
    '--color-text-secondary': '#757575',
    '--color-text-muted': '#BDBDBD',
    '--color-text-white': '#FFFFFF',
    '--color-success': '#10B981',
    '--color-warning': '#F59E0B',
    '--color-error': '#EF4444',
    '--font-family-primary': "'Inter', -apple-system, sans-serif",
    '--font-size-h1': '28px',
    '--font-size-h2': '22px',
    '--font-size-h3': '18px',
    '--font-size-body': '16px',
    '--font-size-small': '14px',
    '--font-size-tiny': '12px',
    '--font-weight-light': '300',
    '--font-weight-regular': '400',
    '--font-weight-medium': '500',
    '--font-weight-bold': '700',
    '--spacing-xs': '4px',
    '--spacing-sm': '8px',
    '--spacing-md': '16px',
    '--spacing-lg': '20px',
    '--spacing-xl': '28px',
    '--shadow-sm': '0 2px 4px rgba(0, 0, 0, 0.06)',
    '--shadow-md': '0 4px 8px rgba(0, 0, 0, 0.1)',
    '--shadow-lg': '0 8px 16px rgba(0, 0, 0, 0.15)',
    '--shadow-primary': '0 2px 8px rgba(0, 188, 212, 0.3)',
    '--shadow-primary-hover': '0 4px 12px rgba(0, 188, 212, 0.4)',
    '--radius-sm': '8px',
    '--radius-md': '12px',
    '--radius-lg': '16px',
    '--radius-full': '9999px',
    '--transition-default': 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '--transition-fast': 'all 0.15s ease-out',
    // Mobile-specific variables
    '--mobile-nav-height': '80px',
    '--mobile-safe-area-bottom': 'env(safe-area-inset-bottom)',
    '--mobile-touch-target': '48px',
  },
};