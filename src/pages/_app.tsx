import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import Head from 'next/head'
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import ErrorBoundary from '@/components/ErrorBoundary'

// Self-hosted by next/font, so the strict CSP needs no font-src exception.
const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap',
})

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

// Module-level guard so React strict-mode's double mount logs it once.
let bannerLogged = false;

export default function App({ Component, pageProps }: AppProps) {
    useEffect(() => {
        if (bannerLogged) {
            return;
        }
        bannerLogged = true;
        console.log(`%c${CONSOLE_BANNER}`, 'color: #22D3EE; font-family: monospace;');
        console.log('%cguest@invictus:~$ whoami', 'color: #7DE8F0; font-family: monospace;');
        console.log('%ccurious. we like that. → /#contact', 'color: #8FB3BC; font-family: monospace;');
        console.log('%cor press ⌘K and just ask me.', 'color: #FF9B5A; font-family: monospace;');
    }, []);

    return (
        <div className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans`}>
            <Head>
                {/* viewport-fit=cover lets the background fill the full screen on
                    notched iPhones — including the safe-area bars in landscape. */}
                <meta
                    name='viewport'
                    content='width=device-width, initial-scale=1, viewport-fit=cover'
                />
            </Head>
            {/* A render error would otherwise unmount the tree and leave a
                blank page, which is the worst outcome for a site meant to be
                read. Reduced motion is honoured in CSS, everywhere. */}
            <ErrorBoundary>
                <Component {...pageProps} />
            </ErrorBoundary>
        </div>
    )
}
