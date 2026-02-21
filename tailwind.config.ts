import type { Config } from 'tailwindcss'

export default {
  content: [
    'src/**/*.{ts,tsx,html}',
  ],
  theme: {
    extend: {
      colors: {
        // SynaptixLabs brand tokens
        refine: {
          orange: '#F97316',
          blue: '#3B82F6',
          dark: '#1E293B',
          light: '#F8FAFC',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
