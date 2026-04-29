// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // El nombre 'syne' debe coincidir con la clase font-syne de tu HTML
        syne: ['var(--font-syne)', 'sans-serif'],
      },
      colors: {
        'pedal-primary': '#tu-color-aqui', // Asegúrate de tener definido tu color primario
      }
    },
  },
  plugins: [],
}