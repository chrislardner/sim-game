/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4F46E5', // Light mode primary color
          dark: '#fb6c9f', // Dark mode primary color
        },
        secondary: {
          light: '#7F95D1', // Light mode secondary color
          dark: '#96A8D9', // Dark mode secondary color
        },  
        background: {
          light: '#F3F4F6',
          dark: '#1F2937',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#111827',
        },
        text: {
          light: '#111827',
          dark: '#F9FAFB',
        },
        accent: '#10B981',
      },
    },
  },
  plugins: [],
}
