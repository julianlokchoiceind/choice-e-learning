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
          "SF Pro Display",
          "SF Pro Text",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        display: ["SF Pro Display", "Helvetica Neue", "Helvetica", "Arial"],
        serif: ["ui-serif", "Georgia", "Cambria", "serif"],
        mono: [
          "SF Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
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
    },
  },
  plugins: [],
}

