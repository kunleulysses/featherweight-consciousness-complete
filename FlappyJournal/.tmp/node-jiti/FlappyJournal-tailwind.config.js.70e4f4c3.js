"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _typography = require('@tailwindcss/typography'); var _typography2 = _interopRequireDefault(_typography);

/** @type {import('tailwindcss').Config} */
exports. default = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        accent: '#00BFFF',
        offwhite: '#F0F0F0',
      },
      fontFamily: {
        heading: ['Lora', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at center, #000000 0%, #000022 100%)',
      },
    },
  },
  plugins: [_typography2.default],
}
 /* v7-a4d7d974289a4a68 */