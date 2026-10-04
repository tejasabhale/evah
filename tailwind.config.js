/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        evah: {
          bg: '#07090D',
          surface: '#0D1117',
          surface2: '#111720',
          border: 'rgba(255, 255, 255, 0.06)',
          borderSubtle: 'rgba(255, 255, 255, 0.04)',
          borderHighlight: 'rgba(255, 255, 255, 0.12)',
          text: '#F2F4F7',
          secondary: '#A4ADB8',
          muted: '#68717D',
          accent: '#8CC8FF',
          accentMuted: 'rgba(140, 200, 255, 0.12)',
          success: '#7FD1A1',
          warning: '#E7C878',
          danger: '#E78383',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'panel': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glow-accent': '0 0 25px -5px rgba(140, 200, 255, 0.15)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'natural': 'cubic-bezier(0.25, 1, 0.5, 1)',
      }
    },
  },
  plugins: [],
}
