import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './services/**/*.{ts,tsx}', './types/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6D214F',
        secondary: '#F8F3EE',
        background: '#FCFAF8',
        card: '#FFFFFF',
        accent: '#C89B7B',
        text: '#2F2F2F',
        'text-secondary': '#6E6E6E',
        border: '#E8DDD5',
        success: '#4CAF50',
        warning: '#F4A261',
        danger: '#E76F51',
        ink: '#2F2F2F',
      },
      boxShadow: {
        soft: '0 12px 32px rgba(109, 33, 79, 0.10)',
        card: '0 18px 40px rgba(109, 33, 79, 0.08)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.4rem',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
