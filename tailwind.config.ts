/*
 * Tailwind CSS custom colors for the Life Planner Assistant dark theme.
 * Primary accent: #60a5fa (blue)
 * Secondary accent: #2dd4bf (teal)
 * Background: near‑black (hsl(210, 30%, 4%))
 */

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(210, 30%, 4%)",
        foreground: "hsl(210, 40%, 98%)",
        primary: {
          DEFAULT: "#60a5fa",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#2dd4bf",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "hsl(210, 30%, 6%)",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#2dd4bf",
          foreground: "#ffffff",
        },
        sidebar: {
          DEFAULT: "hsl(210, 30%, 6%)",
          foreground: "#ffffff",
          primary: "#60a5fa",
          "primary-foreground": "#ffffff",
          accent: "#2dd4bf",
          "accent-foreground": "#ffffff",
          border: "hsl(210, 20%, 12%)",
          ring: "#60a5fa",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
