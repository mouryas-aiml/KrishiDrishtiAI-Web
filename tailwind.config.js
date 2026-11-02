/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: "#0B3D2E",
        leaf: "#2F855A",
        cream: "#F4F7F1",
        sun: "#F4B942"
      }
    }
  },
  plugins: []
};
