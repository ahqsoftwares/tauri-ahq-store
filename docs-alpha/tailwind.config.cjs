/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{css,astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  prefix: "tw-",
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    prefix: "dui-",
	  logs: false,
  },
};
