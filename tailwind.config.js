/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#edf4ff',
          100: '#dce8ff',
          200: '#b9d1ff',
          300: '#95b9ff',
          400: '#729fff',
          500: '#4f86ff',
          600: '#3d66e6',
          700: '#2c4dcc',
          800: '#1b33b3',
          900: '#101f8f',
        },
        navy: '#0b132b',
        parchment: '#f7f7f7',
      },
    },
  },
  plugins: [],
}
