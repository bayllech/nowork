window.tailwind = window.tailwind || {};
window.tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        display: ['Manrope', 'Noto Sans SC', 'ui-sans-serif', 'system-ui'],
        body: ['Inter', 'Noto Sans SC', 'ui-sans-serif']
      },
      colors: {
        ink: '#1f2033',
        muted: '#6f708f',
        primary: {
          DEFAULT: '#5d5bff',
          strong: '#4137ff',
          light: '#eef0ff'
        },
        accent: '#ff5f75',
        surface: 'rgba(255,255,255,0.88)'
      },
      boxShadow: {
        card: '0 22px 48px rgba(70, 64, 153, 0.16)',
        soft: '0 18px 35px rgba(65, 55, 255, 0.18)'
      },
      borderRadius: {
        xl: '24px',
        '3xl': '32px'
      },
      backgroundImage: {
        'gradient-hero': 'radial-gradient(circle at top left, #ffffff 0%, #f1f3ff 55%, #e7e9ff 100%)',
        'rage-button': 'radial-gradient(circle at 50% 10%, #ff9da9, #ff5f75 70%, #ff3a59 100%)'
      }
    }
  }
};
