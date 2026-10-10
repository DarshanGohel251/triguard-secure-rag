/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Obsidian Apex Primary Palette
        'obsidian': '#10120F',
        'obsidian-deep': '#0B0C09',
        'obsidian-card': '#141712',
        'carbon': '#20231E',
        'carbon-raised': '#262A24',
        'carbon-elevated': '#2C312A',
        'carbon-recessed': '#181A15',
        'graphite': '#363A31',
        'graphite-subtle': '#2A2E26',
        'graphite-highlight': '#4A4F43',
        'ivory': '#F1EEE5',
        'ivory-muted': '#B8B5AB',
        'ivory-dim': '#8E8B82',
        'ivory-faint': '#5E6157',
        'lime': '#C9F36A',
        'lime-hover': '#D6F886',
        'champagne': '#C4A878',
        'champagne-hover': '#D1B88B',

        // Cohesive Semantic Aliases (Obsidian Apex)
        'app-bg': '#10120F',
        'nav-bg': '#20231E',
        'card-bg': '#20231E',
        'raised-bg': '#262A24',
        'primary': '#C9F36A',
        'primary-hover': '#D6F886',
        'accent': '#C4A878',
        'accent-hover': '#D1B88B',
        'text-primary': '#F1EEE5',
        'text-secondary': '#B8B5AB',
        'text-muted': '#8E8B82',
        'border-default': '#363A31',
        'border-subtle': '#2A2E26',
        'status-success': '#10B981',
        'status-warning': '#F59E0B',
        'status-danger': '#EF4444',

        // Legacy compatibility mappings re-routed to Obsidian Apex
        'frozen-water': '#F1EEE5',
        'electric-sapphire': '#C9F36A',
        'strong-cyan': '#C9F36A',
        'twilight-indigo': '#20231E',
        'evergreen': '#10120F',
        'cyan-accent': '#C4A878',
      },
    },
  },
  plugins: [],
}

