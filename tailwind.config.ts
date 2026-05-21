import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FDF8F0",
        "cream-dark": "#F5EDD8",
        "cream-border": "#EAE0CC",
        pastel: {
          blue: "#D4E8F7",
          green: "#D4F0E0",
          yellow: "#FFF3CC",
          pink: "#FFD4D4",
          purple: "#E8D4F7",
          orange: "#FFE5CC",
        },
      },
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["Nunito", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
