import { ThemeConfig } from '../types';

// Default theme - extracted from current globals.css
export const defaultTheme: ThemeConfig = {
  id: 'default',
  name: 'BlaBlaCar Inspired',
  description: 'Current production theme with glassmorphism design',
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
      h1: '32px',
      h2: '24px',
      h3: '20px',
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
    lg: '24px',
    xl: '32px',
  },
  
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.04)',
    md: '0 4px 16px rgba(0, 0, 0, 0.08)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
    primary: '0 2px 8px rgba(74, 144, 226, 0.3)',
    primaryHover: '0 4px 12px rgba(74, 144, 226, 0.4)',
  },
  
  borderRadius: {
    sm: '8px',
    md: '16px',
    lg: '24px',
    full: '9999px',
  },
  
  transitions: {
    default: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fast: 'all 0.15s ease-out',
  },
  
  components: {
    button: {
      primary: {
        base: 'bg-primary text-white rounded-full px-6 py-4 font-medium shadow-sm border-none min-h-[48px]',
        interactive: 'hover:-translate-y-0.5 hover:shadow-md transition-all',
        disabled: 'opacity-50 cursor-not-allowed',
      },
      secondary: {
        base: 'bg-transparent text-primary rounded-full px-6 py-4 font-medium border border-primary min-h-[48px]',
        interactive: 'hover:bg-primary/10 hover:-translate-y-0.5 transition-all',
        disabled: 'opacity-50 cursor-not-allowed',
      },
    },
    card: {
      default: {
        base: 'bg-surface border border-gray-200 rounded-2xl p-6 shadow-sm',
        elevated: 'hover:shadow-md hover:-translate-y-0.5 transition-all',
      },
      compact: {
        base: 'bg-surface border border-gray-200 rounded-2xl p-4 shadow-sm',
        elevated: 'hover:shadow-md transition-all',
      },
    },
    input: {
      base: 'bg-surface border border-gray-200 rounded-lg p-4 shadow-sm transition-fast font-body',
      focused: 'outline-none border-primary shadow-[0_0_0_3px_rgba(0,188,212,0.1)]',
      disabled: 'opacity-50 cursor-not-allowed',
    },
    navigation: {
      base: 'bg-surface border-t border-gray-200 shadow-[0_-1px_8px_rgba(0,0,0,0.04)]',
      mobile: 'fixed bottom-0 left-0 right-0 z-50',
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
    '--font-size-h1': '32px',
    '--font-size-h2': '24px',
    '--font-size-h3': '20px',
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
    '--spacing-lg': '24px',
    '--spacing-xl': '32px',
    '--shadow-sm': '0 2px 8px rgba(0, 0, 0, 0.04)',
    '--shadow-md': '0 4px 16px rgba(0, 0, 0, 0.08)',
    '--shadow-lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
    '--shadow-primary': '0 2px 8px rgba(74, 144, 226, 0.3)',
    '--shadow-primary-hover': '0 4px 12px rgba(74, 144, 226, 0.4)',
    '--radius-sm': '8px',
    '--radius-md': '16px',
    '--radius-lg': '24px',
    '--radius-full': '9999px',
    '--transition-default': 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '--transition-fast': 'all 0.15s ease-out',
  },
};