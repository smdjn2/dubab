/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#F4F7F3',
          100: '#EDF3EB',
          200: '#D5E2D2',
          300: '#B5CDB1',
          400: '#8BA888',
          500: '#6E8F6B',
          600: '#577256',
          700: '#455A44',
          800: '#384839',
          900: '#2E3C2E',
        },
      },
      fontFamily: {
        pretendard: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};