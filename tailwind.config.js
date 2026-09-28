/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ability: {
          red:   '#cc0000',
          navy:  '#0e2841',
          dark:  '#1a1a1a',
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
