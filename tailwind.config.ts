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
          border: "hsl(210, 30%, 12%)",   // <-- added
          ring: "#60a5fa",
        },
        border: "hsl(var(--border))",   // <-- added
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
