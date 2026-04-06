/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // ─── Colors ───────────────────────────────────────────────────
      colors: {
        primary: {
          DEFAULT: '#9E968E',
          light: '#BDB6AF',
          dark: '#6B635B',
        },
        secondary: {
          cream: '#F2EDE4',
          sage: '#C5D5C9',
        },
        accent: {
          DEFAULT: '#3D6147',
          light: '#5A8268',
        },
        highlight: '#D4AA5F',
        success: '#4A7C5F',
        warning: '#C49A3C',
        error: '#B85C4A',
        neutral: {
          50: '#FAF8F5',
          100: '#F2EDE4',
          200: '#DDD7CE',
          400: '#A89E95',
          600: '#6B635B',
          900: '#2C2420',
        },
      },

      // ─── Typography ────────────────────────────────────────────────
      fontFamily: {
        cormorant: ['"Cormorant Garamond"', 'serif'],
        jost: ['Jost', 'sans-serif'],
      },
      fontSize: {
        display: ['56px', { lineHeight: '1.1', fontWeight: '500' }],
        h1: ['40px', { lineHeight: '1.2', fontWeight: '500' }],
        h2: ['32px', { lineHeight: '1.25', fontWeight: '500' }],
        h3: ['24px', { lineHeight: '1.3', fontWeight: '500' }],
        h4: ['18px', { lineHeight: '1.4', fontWeight: '500' }],
        body: ['16px', { lineHeight: '1.65', fontWeight: '400' }],
        small: ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        micro: ['12px', { lineHeight: '1.4', fontWeight: '400' }],
      },

      // ─── Spacing ───────────────────────────────────────────────────
      spacing: {
        'space-xs': '4px',
        'space-sm': '8px',
        'space-md': '16px',
        'space-lg': '24px',
        'space-xl': '40px',
        'space-2xl': '64px',
        'space-3xl': '96px',
        'space-4xl': '128px',
      },

      // ─── Border Radius ─────────────────────────────────────────────
      borderRadius: {
        'radius-sm': '4px',
        'radius-md': '8px',
        'radius-lg': '16px',
        'radius-full': '9999px',
      },

      // ─── Shadows ───────────────────────────────────────────────────
      boxShadow: {
        sm: '0 1px 3px rgba(44, 36, 32, 0.06)',
        md: '0 4px 12px rgba(44, 36, 32, 0.08)',
        lg: '0 8px 32px rgba(44, 36, 32, 0.12)',
      },
    },
  },
  plugins: [],
}
