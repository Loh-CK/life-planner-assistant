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
        background: "#14141f",
        foreground: "#f5f5f5",
        primary: {
          DEFAULT: "#ff8a65",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#a78bfa",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "#1e1e2e",
          foreground: "#f5f5f5",
        },
        accent: {
          DEFAULT: "#a78bfa",
          foreground: "#ffffff",
        },
        sidebar: {
          DEFAULT: "#1e1e2e",
          foreground: "#f5f5f5",
          primary: "#ff8a65",
          "primary-foreground": "#ffffff",
          accent: "#a78bfa",
          "accent-foreground": "#ffffff",
          border: "#ff8a65",
          ring: "#ff8a65",
        },
        border: "#ff8a65",
        input: "#2a2a3a",
        ring: "#ff8a65",
        muted: "#2a2a3a",
        "muted-foreground": "#a1a1aa",
        destructive: "#ff8a65",
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