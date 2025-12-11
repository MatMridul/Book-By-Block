/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0D0D0D',
          card: '#1A1A1A',
          border: '#2A2A2A',
          text: '#E6E6E6',
          muted: '#9CA3AF'
        },
        primary: {
          purple: '#7C3AED',
          'purple-dark': '#5B21B6'
        },
        accent: {
          mint: '#24E3C0',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444'
        }
      },
      animation: {
        'scan-line': 'scanLine 2s ease-in-out infinite',
        'pulse-success': 'pulseSuccess 1s ease-in-out',
        'pulse-error': 'pulseError 1s ease-in-out'
      },
      keyframes: {
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '50%': { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(100%)' }
        },
        pulseSuccess: {
          '0%': { backgroundColor: '#22C55E', transform: 'scale(1)' },
          '50%': { backgroundColor: '#16A34A', transform: 'scale(1.05)' },
          '100%': { backgroundColor: '#22C55E', transform: 'scale(1)' }
        },
        pulseError: {
          '0%': { backgroundColor: '#EF4444', transform: 'scale(1)' },
          '50%': { backgroundColor: '#DC2626', transform: 'scale(1.05)' },
          '100%': { backgroundColor: '#EF4444', transform: 'scale(1)' }
        }
      }
    },
  },
  plugins: [],
}
