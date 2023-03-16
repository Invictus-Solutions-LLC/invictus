/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,jsx,ts,tsx}',
        './src/components/**/*.{js,jsx,ts,tsx}',
    ],
    mode: 'jit',
    dark: 'class',
    theme: {
        extend: {},
    },
    plugins: [],
}
