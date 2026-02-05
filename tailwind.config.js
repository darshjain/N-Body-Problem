/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Space Grotesk', 'sans-serif'],
            },
            colors: {
                space: {
                    950: '#030305',
                    900: '#050510',
                    800: '#0a0a20',
                },
                primary: {
                    DEFAULT: '#00f3ff',
                    glow: 'rgba(0, 243, 255, 0.5)',
                },
                secondary: {
                    DEFAULT: '#7000ff',
                    glow: 'rgba(112, 0, 255, 0.5)',
                },
                surface: 'rgba(255, 255, 255, 0.03)',
                glass: 'rgba(0, 0, 0, 0.2)',
            },
            backgroundImage: {
                'radial-gradient': 'radial-gradient(circle, var(--tw-gradient-stops))',
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
}
