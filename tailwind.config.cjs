/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**"],
  dark: [],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    prefix: "dui-",
    themes: [
      "light",
      "emerald",
      "fantasy",
      "wireframe",
      "cmyk",
      "autumn",

      "synthwave",
      "halloween",
      "forest",
      "luxury",
      "dracula",
      "business",
      "night",
    ],
  },
};
