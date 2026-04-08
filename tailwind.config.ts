import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#c9a227",
        "accent-hover": "#a88520",
        "accent-warm": "#d4ae3f",
        dark: "#0a0f1e",
        "dark-card": "#0f1a2e",
        "dark-border": "#1a2d4a",
        "dark-deep": "#060c17",
      },
    },
  },
  plugins: [],
}

export default config
