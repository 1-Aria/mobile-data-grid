// postcss.config.js
module.exports = {
  plugins: {
    // Change 'tailwindcss' to the new explicit package if it's currently listed as a string
    'tailwindcss/postcss': {}, 
    'autoprefixer': {},
  },
}