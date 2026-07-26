import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "hsl(var(--canvas))",
        paper: "hsl(var(--paper))",
        ink: "hsl(var(--ink))",
        muted: "hsl(var(--muted))",
        line: "hsl(var(--line))",
        brand: "hsl(var(--brand))",
        "brand-soft": "hsl(var(--brand-soft))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        danger: "hsl(var(--danger))",
      },
      boxShadow: {
        quiet:
          "0 0 0 1px hsl(var(--line) / .7), 0 4px 18px hsl(var(--ink) / .045)",
        lift: "0 0 0 1px hsl(var(--line) / .55), 0 16px 40px -24px hsl(var(--ink) / .28)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
