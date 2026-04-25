import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background-rgb) / <alpha-value>)",
        foreground: "rgb(var(--foreground-rgb) / <alpha-value>)",
        border: "rgb(var(--border-rgb) / <alpha-value>)",
        input: "rgb(var(--input-rgb) / <alpha-value>)",
        ring: "rgb(var(--ring-rgb) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary-rgb) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground-rgb) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary-rgb) / <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground-rgb) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--muted-rgb) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground-rgb) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent-rgb) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground-rgb) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive-rgb) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground-rgb) / <alpha-value>)",
        },
        card: {
          DEFAULT: "rgb(var(--card-rgb) / <alpha-value>)",
          foreground: "rgb(var(--card-foreground-rgb) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--popover-rgb) / <alpha-value>)",
          foreground: "rgb(var(--popover-foreground-rgb) / <alpha-value>)",
        },
        "devil-bg": "rgb(var(--devil-bg-rgb) / <alpha-value>)",
        "devil-bg-soft": "rgb(var(--devil-bg-soft-rgb) / <alpha-value>)",
        "devil-ivory": "rgb(var(--devil-ivory-rgb) / <alpha-value>)",
        "devil-muted": "rgb(var(--devil-muted-rgb) / <alpha-value>)",
        "devil-red": "rgb(var(--devil-red-rgb) / <alpha-value>)",
        "devil-gold": "rgb(var(--devil-gold-rgb) / <alpha-value>)",
        "devil-line": "rgb(var(--devil-line-rgb) / <alpha-value>)",
        "devil-leather": "rgb(var(--devil-leather-rgb) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-instrument-serif)", "serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
        "serif-cn": ["Source Han Serif SC", "Noto Serif SC", "serif"],
        "body-cn": ["LXGW WenKai", "霞鹜文楷", "KaiTi", "serif"],
      },
      borderRadius: {
        sm: "0.125rem",
        md: "0.25rem",
        lg: "0.375rem",
        xl: "0.5rem",
      },
      keyframes: {
        "slow-pulse": {
          "0%, 100%": { opacity: "0.42", transform: "scale(1)" },
          "50%": { opacity: "0.72", transform: "scale(1.04)" },
        },
        "ink-spread": {
          "0%, 100%": { opacity: "0.16", transform: "translateY(-1%) scale(0.98)" },
          "50%": { opacity: "0.28", transform: "translateY(2%) scale(1.03)" },
        },
        typewriter: {
          from: { clipPath: "inset(0 100% 0 0)" },
          to: { clipPath: "inset(0 0 0 0)" },
        },
      },
      animation: {
        "slow-pulse": "slow-pulse 6s ease-in-out infinite",
        "ink-spread": "ink-spread 9s ease-in-out infinite",
        typewriter: "typewriter 1.8s steps(28) both",
      },
    },
  },
  plugins: [],
};

export default config;
