/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#078FEA',
        'brand-blue-light': '#EAF6FF',
        'brand-navy': '#172B40',
        'brand-navy-secondary': '#294A68',
        'brand-red': '#E93D38',
        'brand-red-hover': '#CC2E2A',
        'brand-grey': '#F5F8FB',
        'brand-border': '#D9E5EF',
        brand: {
          50: '#EAF6FF',
          100: '#D4ECFE',
          200: '#A3D9FD',
          300: '#64C0FC',
          400: '#27A4FB',
          500: '#078FEA',
          600: '#0574C2',
          700: '#045A9A',
          800: '#294A68',
          900: '#172B40',
          950: '#0E1C2B',
        },
        cta: {
          DEFAULT: '#E93D38',
          hover: '#CC2E2A',
        },
        surface: {
          light: '#FFFFFF',
          offwhite: '#F5F8FB',
          muted: '#EAF6FF',
          border: '#D9E5EF',
          borderHover: '#078FEA',
        },
        heading: '#172B40',
        body: '#294A68',
        subtle: '#64748B',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        subtle: '0 4px 20px -2px rgba(23, 43, 64, 0.05)',
        card: '0 10px 30px -5px rgba(23, 43, 64, 0.06), 0 2px 6px -1px rgba(23, 43, 64, 0.03)',
        glow: '0 0 25px -5px rgba(7, 143, 234, 0.25)',
      },
    },
  },
  plugins: [],
};
