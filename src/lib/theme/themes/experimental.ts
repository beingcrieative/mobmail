import { ThemeConfig } from '../types';

// Experimental theme for safe testing
export const experimentalTheme: ThemeConfig = {
  id: 'experimental',
  name: 'Modern Experiment',
  description: 'Safe experimental theme for testing new designs',
  version: '1.0.0',
  isExperimental: true,
  
  colors: {
    primary: '#6366F1', // Indigo
    secondary: '#8B5CF6', // Purple
    background: '#FAFAFA',
    surface: '#FFFFFF',
    accent: '#F59E0B', // Amber
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    textWhite: '#FFFFFF',
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
  },
  
  typography: {
    fontFamily: "'Inter', -apple-system, sans-serif",
    fontSize: {
      h1: '36px',
      h2: '28px',
      h3: '22px',
      body: '16px',
      small: '14px',
      tiny: '12px',
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 600,
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
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    primary: '0 4px 14px rgba(99, 102, 241, 0.25)',
    primaryHover: '0 8px 25px rgba(99, 102, 241, 0.35)',
  },
  
  borderRadius: {
    sm: '6px',
    md: '12px',
    lg: '16px',
    full: '9999px',
  },
  
  transitions: {
    default: 'all 0.2s ease-in-out',
    fast: 'all 0.1s ease-out',
  },
  
  components: {
    button: {
      primary: {
        base: 'bg-primary text-white rounded-lg px-6 py-3 font-medium shadow-sm border-none min-h-[44px]',
        interactive: 'hover:shadow-primary hover:scale-105 transition-all',
        disabled: 'opacity-50 cursor-not-allowed',
      },
      secondary: {
        base: 'bg-gray-100 text-gray-700 rounded-lg px-6 py-3 font-medium border border-gray-200 min-h-[44px]',
        interactive: 'hover:bg-gray-200 hover:scale-105 transition-all',
        disabled: 'opacity-50 cursor-not-allowed',
      },
    },
    card: {
      default: {
        base: 'bg-surface border border-gray-100 rounded-lg p-6 shadow-sm',
        elevated: 'hover:shadow-md hover:scale-102 transition-all',
      },
      compact: {
        base: 'bg-surface border border-gray-100 rounded-lg p-4 shadow-sm',
        elevated: 'hover:shadow-md transition-all',
      },
    },
    input: {
      base: 'bg-surface border border-gray-200 rounded-md p-3 shadow-sm transition-fast font-body',
      focused: 'outline-none border-primary ring-2 ring-primary/20',
      disabled: 'opacity-50 cursor-not-allowed bg-gray-50',
    },
    navigation: {
      base: 'bg-surface/80 backdrop-blur-md border-t border-gray-100 shadow-sm',
      mobile: 'fixed bottom-0 left-0 right-0 z-50',
    },
  },
  
  cssVariables: {
    '--color-primary': '#6366F1',
    '--color-secondary': '#8B5CF6',
    '--color-background': '#FAFAFA',
    '--color-surface': '#FFFFFF',
    '--color-accent': '#F59E0B',
    '--color-text-primary': '#111827',
    '--color-text-secondary': '#6B7280',
    '--color-text-muted': '#9CA3AF',
    '--color-text-white': '#FFFFFF',
    '--color-success': '#059669',
    '--color-warning': '#D97706',
    '--color-error': '#DC2626',
    '--font-family-primary': "'Inter', -apple-system, sans-serif",
    '--font-size-h1': '36px',
    '--font-size-h2': '28px',
    '--font-size-h3': '22px',
    '--font-size-body': '16px',
    '--font-size-small': '14px',
    '--font-size-tiny': '12px',
    '--font-weight-light': '300',
    '--font-weight-regular': '400',
    '--font-weight-medium': '500',
    '--font-weight-bold': '600',
    '--spacing-xs': '4px',
    '--spacing-sm': '8px',
    '--spacing-md': '16px',
    '--spacing-lg': '24px',
    '--spacing-xl': '32px',
    '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
    '--shadow-md': '0 4px 6px rgba(0, 0, 0, 0.07)',
    '--shadow-lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
    '--shadow-primary': '0 4px 14px rgba(99, 102, 241, 0.25)',
    '--shadow-primary-hover': '0 8px 25px rgba(99, 102, 241, 0.35)',
    '--radius-sm': '6px',
    '--radius-md': '12px',
    '--radius-lg': '16px',
    '--radius-full': '9999px',
    '--transition-default': 'all 0.2s ease-in-out',
    '--transition-fast': 'all 0.1s ease-out',
  },
};