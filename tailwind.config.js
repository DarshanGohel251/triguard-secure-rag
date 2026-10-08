/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        graphite: '#1c1c1e',
        graphite_light: '#2c2c2e',
        cyan_ai: '#00f0ff',
        emerald_auth: '#10b981',
        amber_warn: '#f59e0b',
        red_blocked: '#ef4444',
      },
    },
  },
  plugins: [],
}
