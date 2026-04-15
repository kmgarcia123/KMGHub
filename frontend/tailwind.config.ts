// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fefce8',
          100: '#fef9c3',
          400: '#facc15',
          500: '#e8c547',  // accent principal
          600: '#ca8a04',
          900: '#713f12',
        },
        dark: {
          50:  '#f5f2ee',
          100: '#e2ddd5',
          800: '#1c1c1c',
          900: '#0e0e0e',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body:    ['var(--font-body)',    'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
