/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Requested Design Palette
        'obsidian': '#0B0F17', // Main Page Background
        'apex-slate': '#141C2B', // Cards, Sidebar & Containers
        'divider-slate': '#253346', // Borders, Lines & Hover states
        'cobalt': '#2563EB', // Primary Highlights, CTAs & Buttons
        'sky-glow': '#38BDF8', // Active Hover & Pipeline Icons
        'verified-green': '#059669', // "PASS" Badges & Active Status
        'alert-red': '#EF4444', // "DENY", Alerts & Interventions
        'off-white': '#F8FAFC', // Titles & High-Contrast Text

        // Semantic aliases
        'app-bg': '#0B0F17',
        'nav-bg': '#141C2B',
        'card-bg': '#141C2B',
        'raised-bg': '#1A2438',
        'primary': '#2563EB',
        'cyan-accent': '#38BDF8',
        'text-primary': '#F8FAFC',
        'text-secondary': '#94A3B8',
        'status-success': '#059669',
        'status-warning': '#F59E0B',
        'status-danger': '#EF4444',
      },
    },
  },
  plugins: [],
}
