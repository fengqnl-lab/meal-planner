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
        },
        surface: '#f8f7f5',
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
