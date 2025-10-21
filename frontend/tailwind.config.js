import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  safelist: [
    'from-orange-500',
    'to-rose-500',
    'from-indigo-500',
    'to-purple-500',
    'from-emerald-500',
    'to-teal-500',
    'from-sky-500',
    'to-cyan-500',
    'from-amber-500',
    'to-yellow-400',
    'from-pink-500',
    'to-fuchsia-500',
    'from-slate-500',
    'to-slate-700',
    'from-lime-500',
    'to-green-500'
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Manrope', 'Noto Sans SC', 'sans-serif'],
        body: ['Inter', 'Noto Sans SC', 'sans-serif']
      },
      colors: {
        primary: {
          DEFAULT: '#5d5bff',
          strong: '#4137ff',
          subtle: '#eef0ff',
          light: '#eef0ff'
        },
        accent: '#ff5f75',
        surface: 'rgba(255,255,255,0.88)',
        ink: '#1f2033',
        muted: '#6f708f'
      },
      boxShadow: {
        soft: '0 18px 35px rgba(65, 55, 255, 0.18)',
        card: '0 22px 48px rgba(70, 64, 153, 0.22)'
      },
      backgroundImage: {
        'gradient-hero': 'radial-gradient(circle at top left, #ffffff 0%, #f1f3ff 55%, #e7e9ff 100%)',
        'rage-button': 'radial-gradient(circle at 50% 10%, #ff9da9, #ff5f75 70%, #ff3a59 100%)'
      },
      borderRadius: {
        xl: '24px',
        '3xl': '30px'
      }
    }
  },
  plugins: [forms]
};
