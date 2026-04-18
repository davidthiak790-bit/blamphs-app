/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        navy: { 950: '#050D1A', 900: '#0A1628', 800: '#101F36', 700: '#1A2D4D', 600: '#2A4068' },
        money: { 400: '#33FFAA', 500: '#00FF88', 600: '#00CC6E', 700: '#009954' },
        ink: { 100: '#E8EEF7', 200: '#B8C4D6', 300: '#8595AE', 400: '#5B6B85', 900: '#0A1628' }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
