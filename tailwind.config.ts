import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        void: "#050508",
        obsidian: "#0C0C12",
        graphite: "#13131C",
        slate: "#1A1A28",
        mist: "#2A2A40",
        aurora: {
          DEFAULT: "#00D4FF",
          dim: "#0099BB",
          glow: "rgba(0, 212, 255, 0.15)",
        },
        pulse: {
          DEFAULT: "#FF6B6B",
          dim: "#CC4444",
          glow: "rgba(255, 107, 107, 0.15)",
        },
        sage: {
          DEFAULT: "#4ECDC4",
          dim: "#2A8A82",
          glow: "rgba(78, 205, 196, 0.15)",
        },
        ivory: "#F0EEE8",
        silver: "#8888A8",
        ghost: "#3A3A58",
      },
      animation: {
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
        "breathe": "breathe 3s ease-in-out infinite",
        "slide-up": "slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "scan": "scan 2s linear infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        "breathe": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.05)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scan": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 212, 255, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(0, 212, 255, 0.6)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
