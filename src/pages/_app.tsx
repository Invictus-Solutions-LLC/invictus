import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { JetBrains_Mono } from 'next/font/google'
import { MotionConfig } from 'framer-motion'

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
    display: 'swap',
})

const CONSOLE_BANNER = `
██╗███╗   ██╗██╗   ██╗██╗ ██████╗████████╗██╗   ██╗███████╗
██║████╗  ██║██║   ██║██║██╔════╝╚══██╔══╝██║   ██║██╔════╝
██║██╔██╗ ██║██║   ██║██║██║        ██║   ██║   ██║███████╗
██║██║╚██╗██║╚██╗ ██╔╝██║██║        ██║   ██║   ██║╚════██║
██║██║ ╚████║ ╚████╔╝ ██║╚██████╗   ██║   ╚██████╔╝███████║
╚═╝╚═╝  ╚═══╝  ╚═══╝  ╚═╝ ╚═════╝   ╚═╝    ╚═════╝ ╚══════╝
`;

// Module-level guard so React 18 strict-mode double-mount logs it once.
let bannerLogged = false;

export default function App({ Component, pageProps }: AppProps) {
    useEffect(() => {
        if (bannerLogged) {
            return;
        }
        bannerLogged = true;
        /* eslint-disable no-console */
        console.log(`%c${CONSOLE_BANNER}`, 'color: #FF0000; font-family: monospace;');
        console.log('%cguest@invictus:~$ whoami', 'color: #39FF88; font-family: monospace;');
        console.log('%ccurious. we like that. → /#contact', 'color: #9CA3AF; font-family: monospace;');
        /* eslint-enable no-console */
    }, []);

    return (
        <div className={`${jetbrainsMono.variable} font-mono`}>
            {/* Disables transform/slide animations (keeps opacity) for users with
                prefers-reduced-motion, matching MatrixRain's static fallback. */}
            <MotionConfig reducedMotion='user'>
                <Component {...pageProps} />
            </MotionConfig>
        </div>
    )
}
