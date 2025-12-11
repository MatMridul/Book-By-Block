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
        // BookByBlock Dark Theme
        dark: {
          bg: '#0D0D0D',
          card: '#1A1A1A',
          border: '#2A2A2A',
          text: '#E6E6E6',
          muted: '#9CA3AF'
        },
        primary: {
          purple: '#7C3AED',
          'purple-dark': '#5B21B6',
          'purple-light': '#8B5CF6'
        },
        accent: {
          mint: '#24E3C0',
          'mint-dark': '#10B981',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'qr-refresh': 'qrRefresh 10s linear infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        qrRefresh: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '90%': { transform: 'scale(1)', opacity: '1' },
          '95%': { transform: 'scale(0.95)', opacity: '0.7' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-pattern': 'linear-gradient(135deg, #7C3AED 0%, #24E3C0 100%)'
      }
    },
  },
  plugins: [],
}
