import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                {/* The boot overlay ships in the SSR HTML so it covers the first
                    paint; without JS it would never be dismissed — hide it. */}
                <noscript>
                    <style>{'#boot-sequence { display: none; }'}</style>
                </noscript>
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
