// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,jsx,ts,tsx}",
//   ],
//   theme: {
//     extend: {
//       boxShadow: {
//         soft: '0 4px 10px rgba(0, 0, 0, 0.1)', // your custom soft shadow
//       },
//       borderRadius: {
//         xl: '1rem',
//       },
//     },
//   },
//   plugins: [],
// }
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class", // 🔥 IMPORTANT
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        accent: '#06b6d4',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.3)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
} 