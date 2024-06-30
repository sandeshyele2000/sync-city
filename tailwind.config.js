/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        background: {
          light: "#2D2D2D",
          DEFAULT: "#121212",
          dark: "#0A0A0A",
          cyanDark: '#0826261f',
          cyanMedium: '#00ffff4c',
          cyanLight: 'rgba(13, 59, 59,0.5)'
        },
        text: {
          light: "#b0b0b0",
          DEFAULT: "#C0C0C0",
          dark: "#A0A0A0",
        },
        accent: {
          light: "#6D83F2",
          DEFAULT: "#00D1FF",
          dark: "#2C49B8",
        },
        primary: "#1E1E1E",
        secondary: "#2D2D2D",
        neutral: "#121212",
        
      },
    },
  },
  plugins: [],
};
