import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./services/**/*.{ts,tsx}",
    "./types/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6D214F",
          foreground: "#FCFAF8",
          dark: "#581a3f",
          hover: "#581a3f",
        },
        secondary: {
          DEFAULT: "#F8F3EE",
          foreground: "#6D214F",
        },
        gold: {
          DEFAULT: "#E5B842",
          foreground: "#2F2F2F",
        },
        cream: {
          DEFAULT: "#F8F3EE",
          foreground: "#2F2F2F",
        },
        muted: {
          DEFAULT: "#F4EBE1",
          foreground: "#7E6E65",
        },
        accent: {
          DEFAULT: "#C89B7B",
          foreground: "#FCFAF8",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#2F2F2F",
        },
        background: "#FCFAF8",
        foreground: "#2F2F2F",
        text: "#2F2F2F",
        "text-secondary": "#6E6E6E",
        border: "#E8DDD5",
        success: {
          DEFAULT: "#4CAF50",
          light: "#ECF8EE",
        },
        warning: {
          DEFAULT: "#F4A261",
          light: "#FFF2E8",
        },
        danger: {
          DEFAULT: "#E76F51",
          light: "#FDECE8",
        },
        ink: "#2F2F2F",
        admin: {
          primary: "#6b1e2b",
          "primary-hover": "#5a1723",
          bg: "#faf3e2",
          text: "#3b1219",
          muted: "#8a6a55",
          border: "#e9dfd0",
          "border-dark": "#ece1cd",
          success: "#2f6b3a",
          subtle: "#a08a76",
        },
      },
      boxShadow: {
        soft: "0 12px 32px rgba(109, 33, 79, 0.10)",
        card: "0 18px 40px rgba(109, 33, 79, 0.08)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.4rem",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
