/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "solar-amber": "#F59E0B",
        "solar-amber-deep": "#D97706",
        "solar-amber-light": "#FEF3C7",
        "grid-teal": "#0EA5E9",
        "grid-teal-dark": "#0284C7",
        "grid-teal-light": "#E0F2FE",
        "ai-violet": "#8B5CF6",
        "ai-violet-dark": "#7C3AED",
        "ai-violet-light": "#F3E8FF",
        "ai-emerald": "#10B981",
        "slate-dark": "#0F172A",
        "slate-sub": "#475569",
        "bg-light": "#F8FAFC",
        "card-light": "#FFFFFF",
        "hairline-light": "#E5E7EB",
        saffron: "#F59E0B",
        "saffron-deep": "#D97706",
        "india-green": "#10B981",
        "chakra-blue": "#0284C7",
        "chakra-blue-light": "#0EA5E9",
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "'Inter'", "sans-serif"],
        body: ["'Plus Jakarta Sans'", "'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        soft: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
        "soft-hover": "0 20px 30px -10px rgba(0, 0, 0, 0.08)",
        "soft-sm": "0 4px 12px -2px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};

