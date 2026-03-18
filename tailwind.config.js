/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.js"
  ],
  theme: {
    extend: {
      colors: {
        neonOrange: "#FF4500",
        neonRed: "#FF3333",
        neonYellow: "#FFD700",
        bgDark: "#050505",
        bgCard: "#0A0A0A"
      },
      fontFamily: {
        exo: ["Exo 2", "sans-serif"],
        rajdhani: ["Rajdhani", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      boxShadow: {
        neonOrange: "0 0 15px rgba(255,69,0,0.6)",
        neonRed: "0 0 15px rgba(255,51,51,0.6)"
      }
    }
  },
  plugins: []
};