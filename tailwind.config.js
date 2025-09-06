/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "bar-pulse": {
          "0%, 100%": {
            transform: "scaleY(0.28) translateY(6px)",
            opacity: "0.6",
          },
          "50%": { transform: "scaleY(1.18) translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 220ms ease-out forwards",
        "bar-1": "bar-pulse 900ms cubic-bezier(.2,.8,.2,1) infinite",
        "bar-2": "bar-pulse 900ms cubic-bezier(.2,.8,.2,1) infinite .12s",
        "bar-3": "bar-pulse 900ms cubic-bezier(.2,.8,.2,1) infinite .26s",
      },
    },
  },
  plugins: [],
};
