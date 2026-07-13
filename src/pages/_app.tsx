import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { JetBrains_Mono } from 'next/font/google'

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
    display: 'swap',
})

export default function App({ Component, pageProps }: AppProps) {
    return (
        <div className={`${jetbrainsMono.variable} font-mono`}>
            <Component {...pageProps} />
        </div>
    )
}
