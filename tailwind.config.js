/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f5f4',
          100: '#dae8e5',
          200: '#b8d4ce',
          300: '#9ac4bb',
          400: '#7db3a8',
          500: '#6a9e94',
          600: '#578679',
          700: '#486d63',
          800: '#3a5850',
          900: '#2d4640',
        },
        surface: '#f8f7f5',
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 2px 8px rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.07)',
        'elevated': '0 4px 12px rgba(0,0,0,0.05), 0 16px 48px rgba(0,0,0,0.08)',
        'glow': '0 0 0 3px rgba(106,158,148,0.15), 0 4px 16px rgba(106,158,148,0.1)',
      },
    },
  },
  plugins: [],
}
