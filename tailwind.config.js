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
        pink100: "#FFFFFF", // background
        pink400: '#ffece8',
        pink700: "#fb6c31", // main/primary color (for backward compatibility)
        primary: "#fb6c31", // new main/primary color
        blue100: "#7ea8d0",
        purple100: "#715056",
        purple500: "#757fb4",
      },
      boxShadow: {
        primary: '0 2px 8px 0 #fb6c3155', // subtle shadow with primary color
      },
    },
  },
  plugins: [],
  variants: {},
};
