// Theme system type definitions
import { z } from 'zod';

// Color palette schema
export const ColorPaletteSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  background: z.string(),
  surface: z.string(),
  accent: z.string(),
  textPrimary: z.string(),
  textSecondary: z.string(),
  textMuted: z.string(),
  textWhite: z.string(),
  success: z.string(),
  warning: z.string(),
  error: z.string(),
});

// Typography schema
export const TypographySchema = z.object({
  fontFamily: z.string(),
  fontSize: z.object({
    h1: z.string(),
    h2: z.string(),
    h3: z.string(),
    body: z.string(),
    small: z.string(),
    tiny: z.string(),
  }),
  fontWeight: z.object({
    light: z.number(),
    regular: z.number(),
    medium: z.number(),
    bold: z.number(),
  }),
});

// Spacing schema
export const SpacingSchema = z.object({
  xs: z.string(),
  sm: z.string(),
  md: z.string(),
  lg: z.string(),
  xl: z.string(),
});

// Shadow schema
export const ShadowSchema = z.object({
  sm: z.string(),
  md: z.string(),
  lg: z.string(),
  primary: z.string(),
  primaryHover: z.string(),
});

// Border radius schema
export const BorderRadiusSchema = z.object({
  sm: z.string(),
  md: z.string(),
  lg: z.string(),
  full: z.string(),
});

// Transition schema
export const TransitionSchema = z.object({
  default: z.string(),
  fast: z.string(),
});

// Component styles schema
export const ComponentStylesSchema = z.object({
  button: z.object({
    primary: z.object({
      base: z.string(),
      interactive: z.string(),
      disabled: z.string(),
    }),
    secondary: z.object({
      base: z.string(),
      interactive: z.string(),
      disabled: z.string(),
    }),
  }),
  card: z.object({
    default: z.object({
      base: z.string(),
      elevated: z.string(),
    }),
    compact: z.object({
      base: z.string(),
      elevated: z.string(),
    }),
  }),
  input: z.object({
    base: z.string(),
    focused: z.string(),
    disabled: z.string(),
  }),
  navigation: z.object({
    base: z.string(),
    mobile: z.string(),
  }),
});

// Main theme configuration schema
export const ThemeConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  version: z.string(),
  isExperimental: z.boolean().default(false),
  colors: ColorPaletteSchema,
  typography: TypographySchema,
  spacing: SpacingSchema,
  shadows: ShadowSchema,
  borderRadius: BorderRadiusSchema,
  transitions: TransitionSchema,
  components: ComponentStylesSchema,
  cssVariables: z.record(z.string()), // For CSS custom properties
});

// Theme validation result
export const ThemeValidationSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
});

// Export types
export type ColorPalette = z.infer<typeof ColorPaletteSchema>;
export type Typography = z.infer<typeof TypographySchema>;
export type Spacing = z.infer<typeof SpacingSchema>;
export type Shadow = z.infer<typeof ShadowSchema>;
export type BorderRadius = z.infer<typeof BorderRadiusSchema>;
export type Transition = z.infer<typeof TransitionSchema>;
export type ComponentStyles = z.infer<typeof ComponentStylesSchema>;
export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;
export type ThemeValidationResult = z.infer<typeof ThemeValidationSchema>;

// Theme context types
export interface ThemeContextValue {
  currentTheme: ThemeConfig;
  availableThemes: ThemeConfig[];
  switchTheme: (themeId: string) => Promise<void>;
  isExperimental: boolean;
  isLoading: boolean;
  error: string | null;
}

// Theme switching result
export interface ThemeSwitchResult {
  success: boolean;
  error?: string;
  previousTheme?: string;
}