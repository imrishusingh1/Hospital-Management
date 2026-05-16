/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#1db1d7',
          600: '#107c9f',
          700: '#0a5f7a',
          800: '#073c52',
          900: '#052a3a',
        },
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          500: '#1db1d7',
          600: '#107c9f',
          700: '#073c52',
        },
        dark: {
          bg: '#0f172a',
          surface: '#1e293b',
          border: '#334155',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 10px 40px -10px rgb(7 60 82 / 0.15)',
        glow: '0 0 40px -10px rgb(29 177 215 / 0.4)',
      },
    },
  },
  plugins: [],
};
