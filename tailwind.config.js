/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        utzmg: {
          green: '#006837',
          darkgreen: '#004d28',
          lightgreen: '#00A859',
          mint: '#E8F5E9',
          teal: '#008060',
          accent: '#10B981',
          gold: '#C5A059',
          surface: '#F8FAFC',
          card: '#FFFFFF',
          dark: '#111827',
          gray: '#4B5563',
          border: '#E2E8F0'
        }
      },
      boxShadow: {
        'utzmg': '0 4px 20px -2px rgba(0, 104, 55, 0.08), 0 2px 6px -1px rgba(0, 104, 55, 0.04)',
        'utzmg-hover': '0 12px 30px -4px rgba(0, 104, 55, 0.16), 0 4px 12px -2px rgba(0, 104, 55, 0.08)',
      }
    },
  },
  plugins: [],
}
