/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4B0082',
        secondary: '#003F00',
        accent: '#43CDE8',
      },
      fontFamily: {
        sans: ['Playfair Display', 'serif'],
      },
      borderRadius: {
        'bento': '20px',
      },
    },
  },
  plugins: [],
}