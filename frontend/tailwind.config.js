/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#0a0a1a",
          card: "#12122a",
          border: "#1e1e4a",
          purple: "#7c3aed",
          "purple-light": "#a78bfa",
          "purple-glow": "#6d28d9",
          cyan: "#06b6d4",
          green: "#10b981",
          red: "#ef4444",
          yellow: "#f59e0b",
          text: "#e2e8f0",
          muted: "#94a3b8",
        },
      },
      boxShadow: {
        "cyber-purple": "0 0 20px rgba(124, 58, 237, 0.3)",
        "cyber-cyan": "0 0 20px rgba(6, 182, 212, 0.3)",
        "cyber-green": "0 0 20px rgba(16, 185, 129, 0.3)",
      },
    },
  },
  plugins: [],
};
