import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        lavender: "#CFA8FA",
        lime: "#C2FF3F",
        cream: "#F5EFE5",
      },
      fontFamily: {
        display: ['"Archivo Black"', "Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ['"Times New Roman"', "Times", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
