/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0F1A',
        primary: {
          DEFAULT: '#00F0FF',
          dark: '#00B8CC',
        },
        secondary: {
          DEFAULT: '#8A2BE2',
          dark: '#6A1CB2',
        },
        accent: '#00F0FF',
        main: '#0A0F1A',
        card: 'rgba(255, 255, 255, 0.05)',
        surface: '#111827',
        'text-main': '#F8F9FA',
        'text-muted': 'rgba(248, 249, 250, 0.5)',
        'border-subtle': 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        sans: ['Sora', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
