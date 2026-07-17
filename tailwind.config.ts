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
        background: "#fafaf9",
        foreground: "#333333",
        primary: {
          DEFAULT: "#ff8a5c",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#2dd4bf",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#333333",
        },
        accent: {
          DEFAULT: "#2dd4bf",
          foreground: "#ffffff",
        },
        sidebar: {
          DEFAULT: "#2d2a4a",
          foreground: "#f5f5f5",
          primary: "#ff8a5c",
          "primary-foreground": "#ffffff",
          accent: "#2dd4bf",
          "accent-foreground": "#ffffff",
          border: "#ff8a5c",
          ring: "#ff8a5c",
        },
        border: "#e5e5e5",
        input: "#e5e5e5",
        ring: "#ff8a5c",
        muted: "#e5e5e5",
        "muted-foreground": "#a1a1aa",
        destructive: "#ff6b6b",
        "destructive-foreground": "#ffffff",
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