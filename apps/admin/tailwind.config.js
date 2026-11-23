/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cdw: {
          red: '#DC2626',
        },
        status: {
          available: '#14B8A6', // Teal
          pickedup: '#6366F1',  // Indigo/Blue
          booked: '#F97316',    // Orange
          service: '#EAB308',   // Yellow
          issue: '#EF4444',     // Red
        }
      }
    },
  },
  plugins: [],
};