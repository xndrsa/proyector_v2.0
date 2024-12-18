/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")], // DaisyUI
  daisyui: {
    themes: true,
    styled: true,
    base: true,
    utils: true,
    logs: true,
    rtl: false,
  },
};
