import type { Config } from 'tailwindcss'

export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        galaxy: '#010106',
        star: '#ffffff',
        flame: '#F0A848',
        ember: '#E86820',
        muted: '#8A8A8A',
        field: '#D4D4D4',
        heart: '#4A4A4A',
      },
    },
  },
} satisfies Config
