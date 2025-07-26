import { ThemeConfig, ThemeValidationResult } from './types';
import { ThemeConfigSchema } from './types';
import { defaultTheme } from './themes/default';
import { experimentalTheme } from './themes/experimental';
import { mobileTheme } from './themes/mobile';

// Available themes registry
export const AVAILABLE_THEMES: Record<string, ThemeConfig> = {
  default: defaultTheme,
  experimental: experimentalTheme,
  mobile: mobileTheme,
} as const;

// Theme constants
export const DEFAULT_THEME_ID = 'default';
export const THEME_STORAGE_KEY = 'voicemail-ai-theme';
export const THEME_PREVIEW_STORAGE_KEY = 'voicemail-ai-theme-preview';

// Get theme by ID with fallback to default
export function getThemeById(themeId: string): ThemeConfig {
  const theme = AVAILABLE_THEMES[themeId];
  if (!theme) {
    console.warn(`Theme "${themeId}" not found, falling back to default theme`);
    return AVAILABLE_THEMES[DEFAULT_THEME_ID];
  }
  return theme;
}

// Get all available themes
export function getAllThemes(): ThemeConfig[] {
  return Object.values(AVAILABLE_THEMES);
}

// Get non-experimental themes only
export function getProductionThemes(): ThemeConfig[] {
  return getAllThemes().filter(theme => !theme.isExperimental);
}

// Get experimental themes only
export function getExperimentalThemes(): ThemeConfig[] {
  return getAllThemes().filter(theme => theme.isExperimental);
}

// Validate theme configuration
export function validateTheme(theme: unknown): ThemeValidationResult {
  try {
    const result = ThemeConfigSchema.safeParse(theme);
    
    if (result.success) {
      // Additional validation rules
      const warnings: string[] = [];
      const errors: string[] = [];
      
      // Check for required CSS variables
      const requiredVars = [
        '--color-primary',
        '--color-background', 
        '--color-surface',
        '--color-text-primary',
      ];
      
      for (const varName of requiredVars) {
        if (!result.data.cssVariables[varName]) {
          errors.push(`Missing required CSS variable: ${varName}`);
        }
      }
      
      // Check for experimental theme warnings
      if (result.data.isExperimental) {
        warnings.push('This is an experimental theme and may have stability issues');
      }
      
      // Check component completeness
      const requiredComponents = ['button', 'card', 'input', 'navigation'];
      for (const component of requiredComponents) {
        if (!result.data.components[component as keyof typeof result.data.components]) {
          errors.push(`Missing required component styles: ${component}`);
        }
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } else {
      return {
        isValid: false,
        errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
        warnings: [],
      };
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: [],
    };
  }
}

// Apply CSS variables to document
export function applyCSSVariables(theme: ThemeConfig): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Apply all CSS variables from theme
  Object.entries(theme.cssVariables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
  
  // Add theme ID as data attribute for debugging
  root.setAttribute('data-theme', theme.id);
  root.setAttribute('data-theme-experimental', theme.isExperimental.toString());
}

// Remove CSS variables from document
export function removeCSSVariables(theme: ThemeConfig): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Remove theme-specific CSS variables
  Object.keys(theme.cssVariables).forEach(property => {
    root.style.removeProperty(property);
  });
  
  // Remove theme attributes
  root.removeAttribute('data-theme');
  root.removeAttribute('data-theme-experimental');
}

// Get saved theme from localStorage
export function getSavedTheme(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error);
    return null;
  }
}

// Save theme to localStorage
export function saveTheme(themeId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch (error) {
    console.warn('Failed to save theme to localStorage:', error);
  }
}

// Get preview theme from localStorage
export function getPreviewTheme(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem(THEME_PREVIEW_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to read preview theme from localStorage:', error);
    return null;
  }
}

// Save preview theme to localStorage
export function savePreviewTheme(themeId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(THEME_PREVIEW_STORAGE_KEY, themeId);
  } catch (error) {
    console.warn('Failed to save preview theme to localStorage:', error);
  }
}

// Clear preview theme
export function clearPreviewTheme(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(THEME_PREVIEW_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear preview theme from localStorage:', error);
  }
}