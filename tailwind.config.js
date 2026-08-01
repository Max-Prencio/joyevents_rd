/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        orange: '#F7890F',
        'orange-dark': '#d97409',
        'orange-light': '#fef3e2',
        jet: '#0a0a0a',
        'off-white': '#FAFAF8',
        gray: '#6b6b6b',
        'gray-light': '#f5f5f3',
      },
      fontFamily: {
        serif: ['"Vanilla RavioliDemo"', 'cursive'],
        sans: ['Montserrat', 'sans-serif'],
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
}
