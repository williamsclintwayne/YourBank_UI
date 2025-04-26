const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'light-grey-bg': '#F7F9FA',
        'light-grey-border': '#E0E0E0',
        mint: '#A8E6CF',
        'deep-teal': '#2D7A8A', // Or '#0D4C5A'
        'warm-peach': '#FFD3B6',
        charcoal: '#333333',
        'medium-grey': '#666666',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        heading: ['Montserrat', ...defaultTheme.fontFamily.sans], // Added Montserrat for headings
      },
      borderRadius: {
        sm: '4px', // Slightly rounded corners
      },
    },
  },
  plugins: [],
};
