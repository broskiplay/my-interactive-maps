/** Главная: нейтральная палитра + один акцент (лаймовый цвет канала). Цвета — CSS-переменные из src/index.css,
 *  чтобы светлая и тёмная тема переключались атрибутом data-theme без дублирования dark:-классов. */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: [__dirname + "/index.html", __dirname + "/src/**/*.{ts,tsx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        canvas: token("canvas"),
        surface: token("surface"),
        raised: token("raised"),
        line: token("line"),
        ink: token("ink"),
        muted: token("muted"),
        subtle: token("subtle"),
        accent: token("accent"),
        "accent-ink": token("accent-ink"),
        danger: token("danger"),
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["Unbounded", "Manrope", "system-ui", "sans-serif"],
      },
      maxWidth: { page: "76rem" },
      screens: { xs: "400px" },
      keyframes: { "bp-load": { "0%": { transform: "translateX(-100%)" }, "100%": { transform: "translateX(300%)" } } },
    },
  },
  plugins: [],
};
