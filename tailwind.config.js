/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dojo: {
          950: '#090a0f',
          900: '#0f111a',
          850: '#151824',
          800: '#1b1f30',
          700: '#282d45',
          600: '#3a4163',
          gold: '#e5a93c',
          'gold-light': '#fcd34d',
          crimson: '#e11d48',
          emerald: '#10b981',
          slate: '#64748b'
        }
      }
    },
  },
  plugins: [],
}
