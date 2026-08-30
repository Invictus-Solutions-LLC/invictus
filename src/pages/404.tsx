import Head from 'next/head';
import Link from 'next/link';
import Logo from '@/components/Logo';
import SwellDivider from '@/components/SwellDivider';

export default function NotFound() {
    return (
        <>
            <Head>
                <title>404 — page not found</title>
            </Head>
            <main className='flex min-h-dvh w-full items-center justify-center px-6 py-16 md:px-10'>
                <div className='w-full max-w-xl text-center'>
                    <Logo className='mx-auto h-8 w-8 text-fg' />

                    <p className='eyebrow mt-8 text-warm'>
                        404
                    </p>

                    <h1 className='mt-3 text-3xl font-semibold tracking-tight md:text-4xl'>
                        This one drifted off the map.
                    </h1>

                    <p className='mt-4 text-base leading-relaxed text-muted'>
                        That page doesn&apos;t exist — it may have moved, or the link may have been mistyped.
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
