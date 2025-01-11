/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class', // Enable class-based dark mode
  plugins: [
    daisyui, // No need for `require`, just use the imported module
  ],
  daisyui: {
    themes: ["light"],
  },
};
