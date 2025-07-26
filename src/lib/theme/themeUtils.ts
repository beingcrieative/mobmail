import { ThemeConfig, ThemeSwitchResult } from './types';
import { 
  getThemeById, 
  validateTheme, 
  applyCSSVariables, 
  removeCSSVariables,
  saveTheme,
  savePreviewTheme,
  clearPreviewTheme
} from './themeConfig';

// Theme switching utilities

/**
 * Safely switch to a new theme with validation and rollback support
 */
export async function switchTheme(
  themeId: string, 
  currentTheme: ThemeConfig,
  isPreview: boolean = false
): Promise<ThemeSwitchResult> {
  try {
    // Get the new theme
    const newTheme = getThemeById(themeId);
    
    // Validate the new theme
    const validation = validateTheme(newTheme);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Theme validation failed: ${validation.errors.join(', ')}`,
        previousTheme: currentTheme.id,
      };
    }
    
    // Log warnings if any
    if (validation.warnings.length > 0) {
      console.warn('Theme warnings:', validation.warnings);
    }
    
    // Remove current theme variables
    removeCSSVariables(currentTheme);
    
    // Apply new theme variables
    applyCSSVariables(newTheme);
    
    // Save theme preference
    if (isPreview) {
      savePreviewTheme(themeId);
    } else {
      saveTheme(themeId);
      clearPreviewTheme(); // Clear any active preview
    }
    
    // Add a small delay to ensure CSS has been applied
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return {
      success: true,
      previousTheme: currentTheme.id,
    };
  } catch (error) {
    console.error('Theme switching error:', error);
    
    // Attempt to rollback to previous theme
    try {
      const failedTheme = getThemeById(themeId);
      removeCSSVariables(failedTheme);
      applyCSSVariables(currentTheme);
    } catch (rollbackError) {
      console.error('Theme rollback failed:', rollbackError);
    }
    
    return {
      success: false,
      error: `Theme switching failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      previousTheme: currentTheme.id,
    };
  }
}

/**
 * Preview a theme temporarily without saving it
 */
export async function previewTheme(
  themeId: string,
  currentTheme: ThemeConfig
): Promise<ThemeSwitchResult> {
  return switchTheme(themeId, currentTheme, true);
}

/**
 * Stop previewing and return to saved theme
 */
export async function stopPreview(
  currentTheme: ThemeConfig,
  savedThemeId: string
): Promise<ThemeSwitchResult> {
  clearPreviewTheme();
  return switchTheme(savedThemeId, currentTheme, false);
}

/**
 * Generate CSS class string from theme component styles
 */
export function getComponentClasses(
  theme: ThemeConfig,
  component: keyof ThemeConfig['components'],
  variant: string,
  state?: string
): string {
  const componentStyles = theme.components[component];
  if (!componentStyles) {
    console.warn(`Component "${component}" not found in theme`);
    return '';
  }
  
  const variantStyles = (componentStyles as any)[variant];
  if (!variantStyles) {
    console.warn(`Variant "${variant}" not found for component "${component}"`);
    return '';
  }
  
  let classes = variantStyles.base || '';
  
  // Add state-specific classes
  if (state && variantStyles[state]) {
    classes += ` ${variantStyles[state]}`;
  }
  
  return classes.trim();
}

/**
 * Create a utility function for a specific component
 */
export function createComponentStyler(theme: ThemeConfig, component: keyof ThemeConfig['components']) {
  return (variant: string, state?: string) => {
    return getComponentClasses(theme, component, variant, state);
  };
}

/**
 * Get CSS variable value from theme
 */
export function getThemeVariable(theme: ThemeConfig, variableName: string): string {
  const value = theme.cssVariables[variableName];
  if (!value) {
    console.warn(`CSS variable "${variableName}" not found in theme`);
    return '';
  }
  return value;
}

/**
 * Generate dynamic styles for components
 */
export function generateDynamicStyles(theme: ThemeConfig): string {
  return `
    :root {
      ${Object.entries(theme.cssVariables)
        .map(([key, value]) => `${key}: ${value};`)
        .join('\n      ')}
    }
    
    .theme-button-primary {
      ${theme.components.button.primary.base}
    }
    
    .theme-button-primary:hover {
      ${theme.components.button.primary.interactive}
    }
    
    .theme-button-primary:disabled {
      ${theme.components.button.primary.disabled}
    }
    
    .theme-button-secondary {
      ${theme.components.button.secondary.base}
    }
    
    .theme-button-secondary:hover {
      ${theme.components.button.secondary.interactive}
    }
    
    .theme-button-secondary:disabled {
      ${theme.components.button.secondary.disabled}
    }
    
    .theme-card {
      ${theme.components.card.default.base}
    }
    
    .theme-card-elevated {
      ${theme.components.card.default.elevated}
    }
    
    .theme-card-compact {
      ${theme.components.card.compact.base}
    }
    
    .theme-input {
      ${theme.components.input.base}
    }
    
    .theme-input:focus {
      ${theme.components.input.focused}
    }
    
    .theme-input:disabled {
      ${theme.components.input.disabled}
    }
    
    .theme-navigation {
      ${theme.components.navigation.base}
    }
    
    .theme-navigation-mobile {
      ${theme.components.navigation.mobile}
    }
  `;
}

/**
 * Check if theme switching is supported
 */
export function isThemeSwitchingSupported(): boolean {
  return typeof window !== 'undefined' && 
         typeof document !== 'undefined' && 
         'documentElement' in document &&
         'style' in document.documentElement;
}

/**
 * Detect user's preferred color scheme
 */
export function getPreferredColorScheme(): 'light' | 'dark' | 'no-preference' {
  if (typeof window === 'undefined') return 'no-preference';
  
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  
  return 'no-preference';
}

/**
 * Merge theme configurations (for theme extensions)
 */
export function mergeThemes(baseTheme: ThemeConfig, overrides: Partial<ThemeConfig>): ThemeConfig {
  return {
    ...baseTheme,
    ...overrides,
    colors: { ...baseTheme.colors, ...overrides.colors },
    typography: { ...baseTheme.typography, ...overrides.typography },
    spacing: { ...baseTheme.spacing, ...overrides.spacing },
    shadows: { ...baseTheme.shadows, ...overrides.shadows },
    borderRadius: { ...baseTheme.borderRadius, ...overrides.borderRadius },
    transitions: { ...baseTheme.transitions, ...overrides.transitions },
    components: {
      ...baseTheme.components,
      ...overrides.components,
      button: {
        ...baseTheme.components.button,
        ...overrides.components?.button,
      },
      card: {
        ...baseTheme.components.card,
        ...overrides.components?.card,
      },
      input: {
        ...baseTheme.components.input,
        ...overrides.components?.input,
      },
      navigation: {
        ...baseTheme.components.navigation,
        ...overrides.components?.navigation,
      },
    },
    cssVariables: { ...baseTheme.cssVariables, ...overrides.cssVariables },
  };
}