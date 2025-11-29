import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Màu lá cờ Việt Nam và quân đội - cải thiện
        vietnam: {
          red: '#DC2626', // Đỏ lá cờ Việt Nam - sáng hơn
          gold: '#FBBF24', // Vàng ngôi sao - ấm áp hơn
          'dark-gold': '#F59E0B', // Vàng đậm
        },
        military: {
          green: '#059669', // Xanh emerald - hiện đại và đẹp hơn
          'dark-green': '#047857', // Xanh đậm
          'light-green': '#10B981', // Xanh nhạt
          blue: '#1E40AF', // Xanh dương - sáng hơn
          beige: '#FEF3C7', // Beige vàng nhạt - ấm áp hơn
          khaki: '#D97706', // Màu kaki cam
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
