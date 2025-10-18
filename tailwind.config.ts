import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Tema C: Sand & Ink
        sand: {
          50:  '#faf6ef',
          100: '#f3ead6',
          200: '#e7d3a8',
          300: '#dcb97c',
          400: '#cfa157',
          500: '#b9863a',
          600: '#94682d',
          700: '#6e4c22',
          800: '#4a3318',
          900: '#2f2010'
        },
        ink: {
          50:  '#f5f6f7',
          100: '#e6e8ea',
          200: '#c9ced3',
          300: '#a6adb5',
          400: '#7b848e',
          500: '#565e66',
          600: '#40474e',
          700: '#2e343a',
          800: '#1f2429',
          900: '#14181c'
        },
        // Varm koppar/guld – i sync med sepia-variablerna i CSS
        accent: {
          300: '#e6ba74',
          400: '#d7a557', // används för text (chips i mörkt läge)
          500: '#c18a47', // huvudaccent (primärknappar m.m.)
          600: '#a97430'
        }
      },
      boxShadow: {
        card: '0 8px 30px rgba(0,0,0,.12)'
      },
      borderRadius: {
        '2xl': '1.25rem'
      }
    }
  },
  plugins: []
} satisfies Config