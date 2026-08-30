import { Html, Head, Main, NextScript } from 'next/document'
import { THEME_SCRIPT } from '@config/themeScript'

export default function Document() {
    return (
        <Html lang='en'>
            <Head>
                {/* Resolves the stored theme onto <html> before first paint.
                    Allowed by an explicit CSP hash rather than 'unsafe-inline'
                    — see next.config.js. */}
                <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />

                {/* Declared rather than left to auto-discovery, so the PNG
                    variants and the manifest are actually used. */}
                <link rel='icon' href='/favicon.ico' sizes='any' />
                <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
                <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
                <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
                <link rel='manifest' href='/site.webmanifest' />

                {/* The intro ships in the SSR HTML so it covers the first paint.
                    Nothing would ever dismiss it without JavaScript, so hide it
                    outright in that case rather than trapping the visitor. */}
                <noscript>
                    <style>{'#boot-sequence { display: none !important; }'}</style>
                </noscript>
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
