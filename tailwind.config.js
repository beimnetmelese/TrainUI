/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', "sans-serif"],
        body: ['"Space Grotesk"', "sans-serif"],
      },
      colors: {
        night: "#0f172a",
        dusk: "#1e293b",
        accent: "#38bdf8",
        accentSoft: "#bae6fd",
        signal: "#f97316",
      },
      boxShadow: {
        card: "0 10px 40px rgba(15, 23, 42, 0.25)",
      },
    },
  },
  plugins: [],
};
