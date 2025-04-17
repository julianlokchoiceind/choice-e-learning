/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
        apple: {
          background: "#ffffff",
          text: "#1d1d1f",
          link: "#0066cc",
          subdued: "#86868b",
          highlight: "#f5f5f7",
          secondary: "#333336",
          accent: "#0071e3"
        },
        'blue': {
          DEFAULT: '#0066cc',
          'light': '#e3efff',
          'hover': '#0077ed',
        },
        'text': {
          'primary': '#1d1d1f',
          'secondary': '#86868b',
        },
        'background': {
          'light': '#f5f5f7',
          'white': '#ffffff',
        },
      },
      fontFamily: {
        sans: [
          'var(--font-inter)',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
      borderRadius: {
        'large': '18px',
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'apple': '0 1px 4px rgba(0, 0, 0, 0.08)',
        'apple-hover': '0 2px 8px rgba(0, 0, 0, 0.12)',
        'apple-deep': '0 4px 12px rgba(0, 0, 0, 0.16)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        fadeInDown: 'fadeInDown 0.5s ease-out',
        float: 'float 5s ease-in-out infinite',
        'float-slow': 'float-slow 7s ease-in-out infinite',
        'float-slow-reverse': 'float-slow-reverse 8s ease-in-out infinite',
        'float-slow-alt': 'float-slow-alt 9s ease-in-out infinite',
        'float-alt': 'float-alt 6s ease-in-out infinite',
        ticker: 'ticker 30s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeInDown: {
          '0%': { 
            opacity: 0,
            transform: 'translateY(-20px)'
          },
          '100%': { 
            opacity: 1,
            transform: 'translateY(0)'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'float-slow-reverse': {
          '0%, 100%': { transform: 'translateY(0) rotate(5deg)' },
          '50%': { transform: 'translateY(-12px) rotate(-2deg)' },
        },
        'float-slow-alt': {
          '0%, 100%': { transform: 'translateY(0) rotate(-3deg)' },
          '50%': { transform: 'translateY(-15px) rotate(3deg)' },
        },
        'float-alt': {
          '0%, 100%': { transform: 'translateY(0) rotate(3deg)' },
          '50%': { transform: 'translateY(-10px) rotate(-3deg)' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}

