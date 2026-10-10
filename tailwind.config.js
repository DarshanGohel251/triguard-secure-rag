/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // God-Level 5-Color Cyber-Intelligence Palette
        'frozen-water': '#D9FCED',
        'electric-sapphire': '#405FFA',
        'strong-cyan': '#09BBC8',
        'twilight-indigo': '#3B3664',
        'evergreen': '#07240F',

        // Cohesive Semantic Aliases
        'app-bg': '#07240F',
        'nav-bg': '#3B3664',
        'card-bg': '#3B3664',
        'raised-bg': '#3B3664',
        'primary': '#405FFA',
        'cyan-accent': '#09BBC8',
        'text-primary': '#D9FCED',
        'text-secondary': 'rgba(217, 252, 237, 0.70)',
        'status-success': '#09BBC8',
        'status-warning': '#FFB020',
        'status-danger': '#FF3B5C',
      },
    },
  },
  plugins: [],
}
