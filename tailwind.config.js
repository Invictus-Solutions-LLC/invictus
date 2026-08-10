/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,jsx,ts,tsx}',
        './src/components/**/*.{js,jsx,ts,tsx}',
        './src/app/**/*.{js,jsx,ts,tsx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
            },
            colors: {
                terminal: {
                    green: '#39FF88',
                    // Readable-on-dark accent for anything the user reads (text and
                    // icons): 4.75:1 on the page background, so it clears WCAG AA.
                    // Raw #FF0000 is only 3.88:1 and fails for normal-size text, so
                    // it stays reserved for non-text affordances — focus rings,
                    // borders, the cursor block, the submit fill and the glow.
                    red: '#FF4D4D',
                },
            },
            keyframes: {
                scanline: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100%)' },
                },
                blink: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0' },
                },
            },
            animation: {
                scanline: 'scanline 8s linear infinite',
                cursor: 'blink 1.1s step-end infinite',
            },
            boxShadow: {
                glow: '0 0 20px rgba(255,0,0,0.15)',
            },
        },
    },
    plugins: [
        // nocompatible unlocks scrollbar-thumb-rounded-* (WebKit-only; Firefox
        // still gets the correct color via the standard scrollbar-color
        // property, it just can't round the thumb).
        require('tailwind-scrollbar')({ nocompatible: true }),
    ],
}
