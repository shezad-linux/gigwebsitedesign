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
          50: "#FAFAFA",
          100: "#F4F4F5",
          200: "#E4E4E7",
          300: "#D4D4D8",
          400: "#A1A1AA",
          500: "#52525B",
          600: "#18181B", // Solid Onyx / Deep Black
          700: "#09090B",
          800: "#000000",
          900: "#000000",
        },
        primary: {
          DEFAULT: "#000000",
          hover: "#27272A",
          light: "#F4F4F5",
          foreground: "#FFFFFF",
        },
        canvas: {
          bg: "#FAFAFA",
          surface: "#FFFFFF",
          subtle: "#F4F4F5",
          dark: "#09090B",
        },
        ink: {
          DEFAULT: "#09090B",
          muted: "#71717A",
          subtle: "#A1A1AA",
        },
        border: {
          DEFAULT: "#E4E4E7",
          strong: "#18181B",
          dark: "#27272A",
        },
        success: {
          DEFAULT: "#18181B",
          light: "#F4F4F5",
          border: "#E4E4E7",
        },
        warning: {
          DEFAULT: "#52525B",
          light: "#F4F4F5",
          border: "#E4E4E7",
        },
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        card: "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)",
        cardHover: "0 8px 16px -4px rgb(0 0 0 / 0.12), 0 4px 6px -2px rgb(0 0 0 / 0.06)",
        dropdown: "0 10px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
