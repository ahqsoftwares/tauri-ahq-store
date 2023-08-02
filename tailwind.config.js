/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**"],
  dark: "class",
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark"],
    prefix: "dui-"
  }
};
