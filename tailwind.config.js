/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,jsx,ts,tsx}',
        './src/components/**/*.{js,jsx,ts,tsx}',
        './src/app/**/*.{js,jsx,ts,tsx}',
    ],
    // The theme script on <html> always resolves to an explicit class, so the
    // palette is driven entirely by CSS variables (see globals.css) rather than
    // by doubling every colour utility with a dark: variant.
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
            },
            colors: {
                // Every pair below is measured against WCAG AA in
                // e2e/accessibility.spec.ts — change a value, re-run that spec.
                bg: 'rgb(var(--color-bg) / <alpha-value>)',
                surface: 'rgb(var(--color-surface) / <alpha-value>)',
                line: 'rgb(var(--color-line) / <alpha-value>)',
                fg: 'rgb(var(--color-fg) / <alpha-value>)',
                muted: 'rgb(var(--color-muted) / <alpha-value>)',
                warm: 'rgb(var(--color-warm) / <alpha-value>)',
                accent: {
                    DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
                    soft: 'rgb(var(--color-accent-soft) / <alpha-value>)',
                    ink: 'rgb(var(--color-accent-ink) / <alpha-value>)',
                },
                // Shell white — the cards that sit on the water. These stay
                // light in both themes, so they carry their own text tokens.
                shell: {
                    DEFAULT: 'rgb(var(--color-shell) / <alpha-value>)',
                    fg: 'rgb(var(--color-shell-fg) / <alpha-value>)',
                    muted: 'rgb(var(--color-shell-muted) / <alpha-value>)',
                    line: 'rgb(var(--color-shell-line) / <alpha-value>)',
                    accent: 'rgb(var(--color-shell-accent) / <alpha-value>)',
                },
            },
            keyframes: {
                // Ambient island motion. Transform and opacity only, so all of
                // it stays on the compositor and never triggers layout.
                swell: {
                    '0%, 100%': { transform: 'scale(1)', opacity: '0.5' },
                    '50%': { transform: 'scale(1.045)', opacity: '1' },
                },
                drift: {
                    from: { transform: 'translateX(0)' },
                    to: { transform: 'translateX(-180px)' },
                },
                caustic: {
                    from: { transform: 'translate3d(0, 0, 0) scale(1)' },
                    to: { transform: 'translate3d(46px, -28px, 0) scale(1.14)' },
                },
                // The caret on the contact form's terminal status line. Opacity
                // only, and stepped rather than eased so it blinks like a real
                // terminal instead of pulsing.
                caret: {
                    '0%, 49%': { opacity: '1' },
                    '50%, 100%': { opacity: '0' },
                },
            },
            animation: {
                swell: 'swell 26s ease-in-out infinite',
                drift: 'drift 16s linear infinite',
                caustic: 'caustic 24s ease-in-out infinite alternate',
                caret: 'caret 1.06s steps(1) infinite',
            },
            transitionTimingFunction: {
                // One shared curve everywhere — quick to start, soft to land.
                // Six animations sharing it is what stops the page feeling like
                // six separate websites.
                shore: 'cubic-bezier(.2, .7, .3, 1)',
            },
        },
    },
    plugins: [],
}
