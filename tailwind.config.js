/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Apple SD Gothic Neo', 'Noto Sans KR', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(16, 185, 129, 0.12)',
      },
    },
  },
  plugins: [],
}
