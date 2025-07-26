// Main theme system exports
export * from './types';
export * from './themeConfig';
export * from './themeUtils';

// Theme exports
export { defaultTheme } from './themes/default';
export { experimentalTheme } from './themes/experimental'; 
export { mobileTheme } from './themes/mobile';

// Re-export commonly used functions
export {
  getThemeById,
  getAllThemes,
  getProductionThemes,
  getExperimentalThemes,
  validateTheme,
  applyCSSVariables,
} from './themeConfig';

export {
  switchTheme,
  previewTheme,
  stopPreview,
  getComponentClasses,
  generateDynamicStyles,
  isThemeSwitchingSupported,
  getPreferredColorScheme,
  mergeThemes,
} from './themeUtils';