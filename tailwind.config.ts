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
        accent: "#ff1aa8",
        "accent-hover": "#d41488",
        "accent-soft": "#ff5fc3",
        plum: "#7a1cac",
        orchid: "#b5179e",
        mint: "#11d68f",
        dark: "#160312",
        "dark-card": "#23071d",
        "dark-border": "#4a1840",
        "dark-deep": "#0d020b",
      },
    },
  },
  plugins: [],
}

export default config
