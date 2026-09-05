import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Ginti brand — deep forest + leaf green + cream paper.
        ink: {
          950: '#06100B',
          900: '#0A1611',
          800: '#101E17',
          700: '#16251D',
          600: '#1E2E25',
        },
        leaf: {
          50: '#EAF7EF',
          100: '#C9EBD6',
          200: '#A7E0C0',
          300: '#7ED3A2',
          400: '#5AC08A',
          500: '#2E8B5A',
          600: '#23744A',
          700: '#1A5A39',
          800: '#134D3D',
        },
        paper: '#F5F3EC',
        cream: '#EAF2EC',
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      // Extra opacity steps used across the UI (color/<n> modifiers).
      opacity: {
        6: '0.06',
        8: '0.08',
        12: '0.12',
        15: '0.15',
        45: '0.45',
      },
      boxShadow: {
        glow: '0 0 80px -20px rgba(46,139,90,0.55)',
        'glow-sm': '0 0 40px -12px rgba(90,192,138,0.5)',
        card: '0 24px 60px -30px rgba(0,0,0,0.7)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        aurora: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(6%,-8%) scale(1.15)' },
          '66%': { transform: 'translate(-6%,6%) scale(0.95)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both',
        float: 'float 7s ease-in-out infinite',
        'aurora-slow': 'aurora 22s ease-in-out infinite',
        marquee: 'marquee 30s linear infinite',
        shimmer: 'shimmer 6s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
