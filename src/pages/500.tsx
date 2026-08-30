import Head from 'next/head';
import Link from 'next/link';
import Logo from '@/components/Logo';
import SwellDivider from '@/components/SwellDivider';

// Next's stock 500 is an unstyled white page, which is jarring against the rest
// of the site. This mirrors 404.tsx so a server error still looks like the site.
// It deliberately says nothing about the cause — that detail belongs in the
// server log, not in the response, where it would be free reconnaissance.
export default function ServerError() {
    return (
        <>
            <Head>
                <title>500 — internal server error</title>
            </Head>
            <main className='flex min-h-dvh w-full items-center justify-center px-6 py-16 md:px-10'>
                <div className='w-full max-w-xl text-center'>
                    <Logo className='mx-auto h-8 w-8 text-fg' />

                    <p className='eyebrow mt-8 text-warm'>
                        500
                    </p>

                    <h1 className='mt-3 text-3xl font-semibold tracking-tight md:text-4xl'>
                        Something broke on my end.
                    </h1>

                    <p className='mt-4 text-base leading-relaxed text-muted'>
                        The server hit an error handling that request. It has been logged, and it wasn&apos;t your fault.
                    </p>

                    <SwellDivider className='mt-8' />

                    <Link
                        href='/'
                        className='btn-primary mt-8'
                    >
                        Back to the start
                    </Link>
                </div>
            </main>
        </>
    );
}
