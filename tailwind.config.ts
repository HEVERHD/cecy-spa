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
        accent: "#00bcd4",
        "accent-hover": "#0097a7",
        "accent-warm": "#26c6da",
        dark: "#080f16",
        "dark-card": "#0d1a22",
        "dark-border": "#0e2530",
        "dark-deep": "#050c10",
      },
    },
  },
  plugins: [],
}

export default config
