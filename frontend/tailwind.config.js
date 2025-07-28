/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        spiritual: {
          purple: '#8b5cf6',
          cyan: '#06b6d4', 
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          indigo: '#6366f1',
          violet: '#8b5cf6',
          fuchsia: '#d946ef'
        },
        cosmic: {
          dark: '#0f0f23',
          purple: '#1a0c2e',
          blue: '#0c1e3e',
          green: '#0c3e1e'
        }
      },
      gridTemplateColumns: {
        '20': 'repeat(20, minmax(0, 1fr))',
      },
      gridTemplateRows: {
        '20': 'repeat(20, minmax(0, 1fr))',
      },
      animation: {
        'gradient-xy': 'gradient-xy 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        'float-slower': 'float-slower 10s ease-in-out infinite',
        'scan-vertical': 'scan-vertical 3s linear infinite',
        'scan-horizontal': 'scan-horizontal 4s linear infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'holographic': 'holographic 3s ease infinite',
        'neon-flicker': 'neon-flicker 2s ease-in-out infinite'
      },
      backgroundImage: {
        'holographic': 'linear-gradient(45deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
        'cyber-grid': 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)'
      }
    },
  },
  plugins: [],
};