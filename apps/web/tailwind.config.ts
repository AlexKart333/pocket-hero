import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        rarity: {
          common: '#9ca3af',
          rare: '#60a5fa',
          epic: '#c084fc',
          legendary: '#f59e0b',
          mythic: '#fb7185'
        }
      },
      boxShadow: {
        glow: '0 0 35px rgba(124, 58, 237, 0.18)'
      }
    }
  },
  plugins: []
};

export default config;
