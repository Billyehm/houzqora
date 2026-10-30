import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        velvet: '#5E1220',
        velvetdark: '#3D0B14',
        strawberry: '#E63B4E',
        cream: '#FFF5F3',
        ink: '#2A1A1D',
        muted: '#6E565A',
        line: '#F0D9D7',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
