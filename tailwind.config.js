/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'app-bg': '#020814',
        'nav-bg': '#030B18',
        'card-bg': '#061426',
        'raised-bg': '#0A1C35',
        'primary': '#1260F5',
        'cyan-accent': '#00D4E8',
        'text-primary': '#EAF2FF',
        'text-secondary': '#A5BAD5',
        'status-success': '#00CCA3',
        'status-warning': '#FFBC38',
        'status-danger': '#FF4565',
      },
    },
  },
  plugins: [],
}
