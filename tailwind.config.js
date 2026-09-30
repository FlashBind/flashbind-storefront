/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        // Header: from this width the full menu is shown; below it, the hamburger.
        // Measured 2026-09-28: at 1024px there is ~32px clear space on each side
        // of the menu (social icons hidden and smaller logo below xl/1280px).
        nav: '1024px',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
