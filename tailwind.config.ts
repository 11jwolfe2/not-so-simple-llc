import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: "var(--paper)", sunk: "var(--paper-sunk)" },
        ink: {
          DEFAULT: "var(--ink)",
          dim: "var(--ink-dim)",
          faint: "var(--ink-faint)",
        },
        rule: "var(--rule)",
        "on-ink": {
          DEFAULT: "var(--on-ink)",
          dim: "var(--on-ink-dim)",
          faint: "var(--on-ink-faint)",
        },
        "rule-inverse": "var(--rule-inverse)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      maxWidth: { content: "1280px" },
    },
  },
  plugins: [],
}
export default config
