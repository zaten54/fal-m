/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Apple-inspired color palette
        apple: {
          gray: {
            50: '#fafafa',
            100: '#f5f5f5', 
            200: '#e5e5e5',
            300: '#d4d4d4',
            400: '#a3a3a3',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#262626',
            900: '#171717'
          },
          blue: '#007AFF',
          green: '#34C759', 
          orange: '#FF9500',
          red: '#FF3B30',
          purple: '#AF52DE',
          pink: '#FF2D92',
          yellow: '#FFCC00'
        },
        // Legacy spiritual colors (keeping for backward compatibility)
        spiritual: {
          purple: '#8b5cf6',
          cyan: '#06b6d4', 
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          indigo: '#6366f1',
          violet: '#8b5cf6',
          fuchsia: '#d946ef'
        }
      },
      fontFamily: {
        'apple': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
        'apple-mono': ['SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'monospace']
      },
      fontSize: {
        'apple-xs': ['11px', { lineHeight: '1.45' }],
        'apple-sm': ['14px', { lineHeight: '1.43' }], 
        'apple-base': ['17px', { lineHeight: '1.47' }],
        'apple-lg': ['20px', { lineHeight: '1.4' }],
        'apple-xl': ['24px', { lineHeight: '1.33' }],
        'apple-2xl': ['32px', { lineHeight: '1.25' }],
        'apple-3xl': ['40px', { lineHeight: '1.2' }],
        'apple-4xl': ['48px', { lineHeight: '1.17' }],
        'apple-5xl': ['64px', { lineHeight: '1.1' }]
      },
      spacing: {
        'apple-xs': '8px',
        'apple-sm': '16px',
        'apple-md': '24px', 
        'apple-lg': '32px',
        'apple-xl': '48px',
        'apple-2xl': '64px',
        'apple-3xl': '96px'
      },
      borderRadius: {
        'apple': '12px',
        'apple-lg': '16px',
        'apple-xl': '24px'
      },
      boxShadow: {
        'apple': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'apple-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'apple-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'apple-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      },
      animation: {
        // Subtle Apple-style animations
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'float-subtle': 'floatSubtle 6s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        floatSubtle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    },
  },
  plugins: [],
};