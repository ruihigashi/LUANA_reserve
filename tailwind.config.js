/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Georgia', 'serif'],
        'luana': ['"Amatic SC"', 'cursive'],
        great: ['"Great Vibes"', 'cursive'],
        quicksand: ['"Quicksand"', 'sans-serif'],
        dancing: ['"Dancing Script"', 'cursive'],
        serifjp: ['"Noto Serif JP"', 'serif'],
        playfair: ['"Playfair Display"', 'serif'],
      },
      colors: {
        pink: {
          50: '#FFF5F7',
          100: '#FED7D7',
          200: '#FBB6CE',
          300: '#F687B3',
          400: '#ED64A6',
          500: '#D53F8C',
          600: '#B83280',
          700: '#97266D',
          800: '#702459',
          900: '#521B41',
        },
        purple: {
          50: '#FAF5FF',
          100: '#E9D8FD',
          200: '#D6BCFA',
          300: '#B794F4',
          400: '#9F7AEA',
          500: '#805AD5',
          600: '#6B46C1',
          700: '#553C9A',
          800: '#44337A',
          900: '#322659',
        },
      },
    },
  },
  plugins: [],
};