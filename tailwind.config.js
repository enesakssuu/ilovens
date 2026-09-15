/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
      },
      colors: {
        brand: {
          blue: '#86B3F0',
          pink: '#FA7DA8',
          purple: '#B896DF',
          text: '#323642',
        },
        apple: {
          bg: '#FAFAFA',
          text: '#323642',
          secondary: '#6E6E73',
          tertiary: '#AEAEB2',
          card: 'rgba(255,255,255,0.45)',
          border: 'rgba(255,255,255,0.5)',
          divider: 'rgba(0,0,0,0.06)',
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6)',
        'glass-hover': '0 20px 60px rgba(0,0,0,0.10), 0 8px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
        'glass-sm': '0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.5)',
        'apple-btn': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
        'apple-btn-hover': '0 4px 12px rgba(0,113,227,0.35)',
        'blue-glow': '0 0 0 4px rgba(0,113,227,0.15)',
        'icon-glow': '0 4px 16px rgba(0,0,0,0.15)',
      },
      backdropBlur: {
        '3xl': '64px',
        '4xl': '96px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'float-slow': 'floatSlow 20s ease-in-out infinite',
        'float-medium': 'floatMedium 15s ease-in-out infinite',
        'float-fast': 'floatFast 10s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fadeIn 0.4s ease both',
        'gradient-shift': 'gradientShift 8s ease infinite',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -40px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
        floatMedium: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-40px, -30px) scale(1.08)' },
        },
        floatFast: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(25px, 35px) scale(0.92)' },
        },
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(32px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}
