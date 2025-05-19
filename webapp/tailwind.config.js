// tailwind.config.js
/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Or 'media'
  theme: {
    extend: {
      colors: {
        // Google AI Studio Inspired Dark Theme
        'g-primary-bg': '#202124',      // Main background (e.g., Google's dark theme bg)
        'g-secondary-bg': '#303134',    // Slightly lighter bg for cards, sidebars
        'g-hover-bg': '#3C4043',       // Hover state for list items, etc.
        'g-active-bg': '#4A4B4F',      // Active/selected item background
        
        'g-primary-text': '#E8EAED',    // Main text color
        'g-secondary-text': '#BDC1C6',  // Muted/secondary text
        'g-tertiary-text': '#9AA0A6',   // Even more muted text

        'g-border': '#3C4043',          // Borders and dividers
        'g-input-bg': '#202124',        // Input background often matches primary bg
        'g-input-border': '#5F6368',    // Input border
        'g-input-focus-border': colors.blue[500], // Google often uses a blue focus ring

        // Accent for primary actions (like the "Run" button in AI Studio)
        // This can be a specific blue or purple, used sparingly.
        'g-accent-blue': colors.blue[400], // Example:rgb(132, 132, 132)
        'g-accent-blue-hover': colors.blue[700],
        
        // You might not need a strong purple accent everywhere, but for specific call-to-actions:
        // 'g-accent-purple': '#A040E0', 
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'], // Roboto is common in Google UIs, Inter is also good
      },
      boxShadow: {
        'g-card': '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // Subtle shadow for cards if needed
        'g-dialog': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // For modals/dialogs
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}