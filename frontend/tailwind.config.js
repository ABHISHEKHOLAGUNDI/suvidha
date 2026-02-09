/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kiosk-blue': '#003366',
        'kiosk-amber': '#FFC107',
      },
      minHeight: {
        'touch': '60px',
      },
    },
  },
  plugins: [],
}
