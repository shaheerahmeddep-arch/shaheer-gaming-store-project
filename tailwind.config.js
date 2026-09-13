/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gaming: {
          bg: '#0a0a12',
          surface: '#12121e',
          card: '#161625',
          border: '#242438',
          neon: '#00f6ff',
          neon2: '#a855f7',
          neon3: '#ff2ee6',
          accent: '#7c3aed',
        },
      },
      fontFamily: {
        display: ['"Rajdhani"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 20px rgba(0, 246, 255, 0.35)',
        'neon-purple': '0 0 20px rgba(168, 85, 247, 0.35)',
        'neon-pink': '0 0 20px rgba(255, 46, 230, 0.35)',
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(124,58,237,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.08) 1px, transparent 1px)',
      },
      animation: {
        'gradient-x': 'gradient-x 8s ease infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
}
