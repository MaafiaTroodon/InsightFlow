/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#07111f',
        panel: '#0f172a',
        surface: '#e2e8f0',
        brand: '#0f766e',
        accent: '#f59e0b',
      },
      fontFamily: {
        sans: ['"Manrope"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 20px 50px rgba(15, 118, 110, 0.15)',
      },
    },
  },
  plugins: [],
};
