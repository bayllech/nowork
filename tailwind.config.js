module.exports = {
  content: ['./prototype/**/*.{html,js}'],
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
          subtle: '#eef0ff'
        },
        accent: '#ff5f75',
        ink: '#1f2033',
        muted: '#6f708f'
      },
      boxShadow: {
        soft: '0 18px 35px rgba(65, 55, 255, 0.18)',
        card: '0 22px 48px rgba(70, 64, 153, 0.22)'
      },
      borderRadius: {
        xl: '24px',
        '3xl': '30px'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
