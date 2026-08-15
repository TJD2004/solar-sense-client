/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        saffron: "#FF9933",
        "saffron-deep": "#FF7A1A",
        "india-green": "#1FAE5C",
        "chakra-blue": "#123A6B",
        "chakra-blue-light": "#5B9CE8",
        "navy-bg": "#0A1626",
        "navy-panel": "#0F2038",
        "navy-panel-2": "#122645",
        hairline: "#22344E",
        "ink-100": "#F3F6FB",
        "ink-300": "#AFC0D6",
        "ink-500": "#728199",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
