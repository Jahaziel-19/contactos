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
      },
    },
  },
  plugins: [
    scrollbarPlugin,
  ],
}
