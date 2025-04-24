/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html", 
    "./*.js",
    "./src/**/*.{html,js}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    // require('tailwindcss'),
    // require('autoprefixer'),
    require('flowbite/plugin')
  ],
}