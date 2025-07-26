/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        // Samsung Fold specific breakpoints
        'fold': '280px',        // Samsung Fold when closed (very narrow)
        'fold-open': '512px',   // Samsung Fold when partially open
        'xs': '375px',          // Small phones
        'sm': '640px',          // Default Tailwind small
        'md': '768px',          // Default Tailwind medium
        'lg': '1024px',         // Default Tailwind large
        'xl': '1280px',         // Default Tailwind extra large
        '2xl': '1536px',        // Default Tailwind 2x large
        
        // Custom max-width queries for better control
        'max-fold': {'max': '320px'},     // Target only fold devices
        'max-xs': {'max': '374px'},       // Target small phones and below
        'max-sm': {'max': '639px'},       // Target mobile devices
      },
      spacing: {
        // Fold-specific spacing
        'fold-xs': '2px',
        'fold-sm': '4px',
        'fold-md': '6px',
        'fold-lg': '8px',
      },
      fontSize: {
        // Fold-specific font sizes
        'fold-xs': '0.625rem',   // 10px
        'fold-sm': '0.75rem',    // 12px
        'fold-base': '0.875rem', // 14px
      },
      maxWidth: {
        // Responsive modal widths
        'modal-fold': '280px',    // For Samsung Fold
        'modal-xs': '320px',      // For small phones
        'modal-sm': '400px',      // For regular phones
        'modal-md': '512px',      // For larger phones/tablets
      },
      width: {
        // Fold-specific widths
        'fold-full': '100%',
        'fold-avatar': '32px',    // Smaller avatars for fold
        'fold-badge': '16px',     // Smaller badges for fold
      },
      height: {
        // Fold-specific heights
        'fold-avatar': '32px',    // Smaller avatars for fold
        'fold-badge': '16px',     // Smaller badges for fold
      }
    },
  },
  plugins: [],
}