import scrollbarPlugin from 'tailwind-scrollbar';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        "custom-gray": "#efefef",
        "custom-white": "#f7f7f7",
        "custom-blue-gradiant" : "gradient-to-r from-indigo-400 to-cyan-400",
      },
    },
  },
  plugins: [
    scrollbarPlugin,
  ],
}
