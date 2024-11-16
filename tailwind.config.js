module.exports = {
  content: [
    "./src/**/*.html",
    "./src/**/*.vue",
    "./src/**/*.jsx",
    "./components/**/*.{js,jsx,tsx,ts}",
    "./screens/**/*.{js,jsx,tsx,ts}",
    "./pages/**/*.{js,jsx,tsx,ts}",
  ],
  theme: {
    extend: {
      colors: {
        pink100: "#1d1b2c",
        pink700: "#eca899",
        blue100: "#7ea8d0",
        purple100: "#715056",
        purple500: "#757fb4",
      },
    },
  },
  plugins: [],
  variants: {},
};
