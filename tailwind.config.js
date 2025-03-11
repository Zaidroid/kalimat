/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(5px)' },
          '75%': { transform: 'translateX(-5px)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        flip: {
          '0%': { transform: 'rotateX(0)' },
          '50%': { transform: 'rotateX(90deg)' },
          '100%': { transform: 'rotateX(0)' },
        },
        ripple: {
          'to': {
            transform: 'scale(4)',
            opacity: '0',
          },
        },
      },
      animation: {
        shake: 'shake 0.5s ease-in-out',
        pop: 'pop 0.15s ease-in-out',
        flip: 'flip 0.25s ease-in-out',
        ripple: 'ripple 0.6s linear',
      },
      perspective: {
        '1000': '1000px',
      },
    },
  },
  plugins: [],
};
