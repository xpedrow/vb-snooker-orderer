/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coal: {
          DEFAULT: '#0A0A0A',
          2: '#111111',
          3: '#1A1A1A',
        },
        'vbs-green': '#008c4a',
        'vbs-neon': '#00ff88',
        gold: {
          DEFAULT: '#12A15F',
          hi: '#16C473',
        },
        cream: {
          DEFAULT: '#FFFFFF',
          2: '#A1A1AA',
        },
        ink: {
          DEFAULT: '#000000',
          2: '#18181B',
          3: '#3F3F46',
        },
        rowAlt: '#F4F4F5',
        docLine: '#D4D4D8',
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        brand: ['Cinzel', 'serif'],
        logo: ['Outfit', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      borderRadius: {
        'vbs': '6px',
      },
      scale: {
        'A4': 'var(--print-scale, 1)',
      }
    },
  },
  plugins: [],
}
