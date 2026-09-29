/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef9f7',
          100: '#d4f0ea',
          200: '#a9e0d4',
          300: '#73c9bc',
          400: '#41ab9e',
          500: '#258d80',
          600: '#1b7268',
          700: '#185c56',
          800: '#164a47',
          900: '#143e3c',
        },
        accent: {
          500: '#e8956f',
          600: '#d97d52',
        },
        ink: '#16263a',
      },
      fontFamily: {
        display: ['"Lexend"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 10px rgba(20, 50, 60, 0.06)',
      },
    },
  },
  plugins: [],
};
