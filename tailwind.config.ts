import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['Instrument Serif', 'Georgia', 'serif'],
      },
      colors: {
        // CSS variable–backed tokens (set in globals.css per theme)
        background: 'var(--bg)',
        foreground: 'var(--foreground)',
        border:     'var(--border)',
        muted:      'var(--muted)',
        surface: {
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
        },
      },
      animation: {
        'in': 'animateIn 0.3s ease both',
      },
      keyframes: {
        animateIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss/plugin')(({ addUtilities }: { addUtilities: Function }) => {
      addUtilities({
        '.animate-in': { animation: 'animateIn 0.3s ease both' },
        '.fade-in':    { animationName: 'fadeIn' },
        '.slide-in-from-bottom-2': { '--tw-enter-translate-y': '8px' },
        '.slide-in-from-bottom-4': { '--tw-enter-translate-y': '16px' },
      })
    }),
  ],
}

export default config
