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
          light: '#4F46E5',
          dark: '#fb6c9f',
        },
        secondary: {
          light: '#7F95D1',
          dark: '#96A8D9',
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
        accent: {
          light: '#FF80AB',
          dark: '#F50057',
        },
        neutral: {
          light: '#FAFAFA',
          dark: '#424242',
        },
        success: {
          light: '#B9F6CA',
          dark: '#00C853',
        },
        warning: {
          light: '#FFF59D',
          dark: '#FBC02D',
        },
        error: {
          light: '#EF9A9A',
          dark: '#C62828',
        },
        info: {
          light: '#81D4FA',
          dark: '#0277BD',
        },
        hover: {
          light: '#81D4FA',
          dark: '#0277BD',
        },
        click: {
          light: '#81D4FA',
          dark: '#0277BD',
        },
        selected: {
          light: '#81D4FA',
          dark: '#0277BD',
        },
      },
    },
  },
  plugins: [],
}
