/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

const cardTransitions = plugin(function ({ addUtilities }) {
  addUtilities({
    ".backface-visible": {
      "backface-visibility": "visible",
    },
    ".backface-hidden": {
      "backface-visibility": "hidden",
    },
    ".flipped": {
      transform: "rotateY(180deg)",
    },
  });
});

module.exports = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("@headlessui/tailwindcss"), cardTransitions],
};
