/**
 * tailwind.config.js — Tailwind v4 Compatibility Shim & IDE Intellisense
 *
 * Design tokens follow Techspear Brand Guidelines (Nov 2026).
 * Primary: Brand Blue #04436E, Secondary: Brand Green #2F833A, Accent: Brand Lime #84B424
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
                mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'Cascadia Code', 'ui-monospace', 'monospace'],
                display: ['Newsreader', 'Georgia', 'serif'],
            },
            colors: {
                'brand-blue': {
                    DEFAULT: '#04436E',
                    deep: '#032D5E',
                    50: '#E6EFF6',
                    500: '#04436E',
                    600: '#032D5E',
                },
                'brand-green': {
                    DEFAULT: '#2F833A',
                    deep: '#1F6B2E',
                    50: '#E8F3EA',
                    500: '#2F833A',
                    600: '#1F6B2E',
                },
                'brand-lime': {
                    DEFAULT: '#84B424',
                    deep: '#6D9A1F',
                    50: '#f7fee7',
                    500: '#84B424',
                    600: '#6D9A1F',
                },
                'brand-teal': {
                    DEFAULT: '#068799',
                    deep: '#04707F',
                    50: '#E6EFF6',
                    500: '#04436E',
                    600: '#032D5E',
                },
                ink: '#0B1F33',
                slate: '#5B6B7C',
                border: '#E3E9E6',
                mist: '#F5F8F6',
                'blue-tint': '#E6EFF6',
                'green-tint': '#E8F3EA',
                warning: '#B45309',
                danger: '#C62828',
            },
            borderRadius: {
                'card': '8px',
                'sm':   '4px',
                'md':   '6px',
                'lg':   '8px',
                'xl':   '12px',
            },
            boxShadow: {
                'card':       '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
                'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
                'elevated':   '0 10px 40px rgba(0,0,0,0.10)',
                'modal':      '0 20px 60px rgba(0,0,0,0.16), 0 8px 24px rgba(0,0,0,0.10)',
            },
        },
    },
    plugins: [],
};
