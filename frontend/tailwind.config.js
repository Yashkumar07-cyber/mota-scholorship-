/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mota: {
          forest: '#0c5c3a',
          forestDark: '#073e27',
          forestLight: '#147a4f',
          gold: '#b47814',
          goldLight: '#fdf6e7',
          warmbg: '#fbfaf6',
          charcoal: '#1e293b',
          muted: '#64748b',
          border: '#e2e8f0',
          surface: '#ffffff',
          accent: '#c25e1a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '14px',
      },
      boxShadow: {
        'gov': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'gov-md': '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04)',
        'gov-lg': '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.03)',
      }
    },
  },
  plugins: [],
}
