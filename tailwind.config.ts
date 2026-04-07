import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: "var(--void)",
          deep: "var(--void-deep)",
          surface: "var(--void-surface)",
          elevated: "var(--void-elevated)",
        },
        gold: {
          DEFAULT: "var(--gold)",
          dim: "var(--gold-dim)",
          ghost: "var(--gold-ghost)",
        },
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-dim": "var(--text-dim)",
        border: {
          DEFAULT: "var(--border)",
          active: "var(--border-active)",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "sans-serif"],
        body: ['"DM Sans"', "sans-serif"],
      },
      fontSize: {
        display: [
          "clamp(3.5rem, 8vw, 7rem)",
          {
            lineHeight: "0.92",
            letterSpacing: "-0.04em",
            fontWeight: "700",
          },
        ],
        h1: [
          "clamp(2.8rem, 5vw, 5rem)",
          { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "700" },
        ],
        h2: [
          "clamp(2rem, 3.5vw, 3.5rem)",
          { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "700" },
        ],
        h3: [
          "clamp(1.3rem, 2vw, 1.8rem)",
          { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" },
        ],
      },
    },
  },
  plugins: [],
};
export default config;
