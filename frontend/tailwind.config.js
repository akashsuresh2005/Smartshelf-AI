/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 4px 10px rgba(0, 0, 0, 0.1)', // your custom soft shadow
      },
      borderRadius: {
        xl: '1rem',
      },
    },
  },
  plugins: [],
}
