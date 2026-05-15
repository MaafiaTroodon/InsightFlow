/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core brand
        ink:     '#050d1a',
        canvas:  '#080f1e',
        surface: '#0c1526',
        panel:   '#111d30',
        // Elevated surfaces
        lift:    '#162035',
        rim:     '#1c2a42',
        // Brand teal
        brand: {
          50:  '#edfcfb',
          100: '#d2f7f4',
          200: '#aaeeea',
          300: '#72e1db',
          400: '#38ccc5',
          500: '#1fb0aa',
          600: '#178d8a',
          700: '#167170',
          800: '#175a5a',
          900: '#174b4b',
          950: '#072e2e',
        },
        // Gold accent
        gold: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        // Semantic
        danger:  '#f43f5e',
        warning: '#fb923c',
        success: '#34d399',
        info:    '#38bdf8',
      },
      fontFamily: {
        sans:  ['"Geist"', '"Inter"', '"Manrope"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:  ['"Geist Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
        display: ['"Cal Sans"', '"Geist"', '"Manrope"', 'ui-sans-serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      spacing: {
        sidebar: '260px',
        topbar:  '60px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        glow:      '0 0 30px rgba(31, 176, 170, 0.18)',
        'glow-lg': '0 0 60px rgba(31, 176, 170, 0.22)',
        'card':    '0 4px 24px rgba(5, 13, 26, 0.5), 0 1px 4px rgba(5, 13, 26, 0.3)',
        'float':   '0 24px 80px rgba(5, 13, 26, 0.6)',
        'inset':   'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      backgroundImage: {
        'grid-faint': 'linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      backgroundSize: {
        'grid': '32px 32px',
      },
      animation: {
        'fade-in':     'fadeIn 0.4s ease forwards',
        'slide-up':    'slideUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards',
        'slide-right': 'slideRight 0.4s cubic-bezier(0.22,1,0.36,1) forwards',
        'scale-in':    'scaleIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards',
        'pulse-slow':  'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':   'spin 8s linear infinite',
        'float':       'float 6s ease-in-out infinite',
        'shimmer':     'shimmer 1.8s ease-in-out infinite',
        'counter':     'counter 0.8s cubic-bezier(0.22,1,0.36,1) forwards',
        'glow-pulse':  'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' },                    to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideRight:{ from: { opacity: '0', transform: 'translateX(-16px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(0.95)' },  to: { opacity: '1', transform: 'scale(1)' } },
        float:     { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        glowPulse: { '0%,100%': { opacity: '0.6' }, '50%': { opacity: '1' } },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'expo':   'cubic-bezier(0.19, 1, 0.22, 1)',
      },
    },
  },
  plugins: [],
};
