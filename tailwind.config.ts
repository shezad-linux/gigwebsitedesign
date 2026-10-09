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
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5", // Primary specified
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },
        primary: {
          DEFAULT: "#4F46E5",
          hover: "#4338CA",
          light: "#EEF2FF",
        },
        canvas: {
          bg: "#F5F7FB",
          surface: "#FFFFFF",
          subtle: "#F8FAFC",
        },
        ink: {
          DEFAULT: "#0F172A",
          muted: "#64748B",
          subtle: "#94A3B8",
        },
        border: {
          DEFAULT: "#E2E8F0",
          strong: "#CBD5E1",
        },
        success: {
          DEFAULT: "#15803D",
          light: "#DCFCE7",
          border: "#86EFAC",
        },
        warning: {
          DEFAULT: "#B45309",
          light: "#FEF3C7",
          border: "#FDE68A",
        },
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        card: "0 4px 6px -1px rgb(15 23 42 / 0.05), 0 2px 4px -2px rgb(15 23 42 / 0.05)",
        cardHover: "0 10px 15px -3px rgb(15 23 42 / 0.08), 0 4px 6px -4px rgb(15 23 42 / 0.04)",
        dropdown: "0 10px 25px -5px rgb(15 23 42 / 0.1), 0 8px 10px -6px rgb(15 23 42 / 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
