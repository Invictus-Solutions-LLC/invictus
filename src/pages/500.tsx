import Head from 'next/head';
import Link from 'next/link';
import TerminalWindow from '@/components/TerminalWindow';

// Next's stock 500 is an unstyled white page, which is jarring against the rest
// of the site. This mirrors 404.tsx so a server error still looks like the
// terminal. It deliberately says nothing about the cause — the detail belongs in
// the server log, not in the response.
export default function ServerError() {
    return (
        <>
            <Head>
                <title>500 — internal server error</title>
            </Head>
            <div
                className='bg-[rgb(36,36,36)] text-white w-full h-dvh flex items-center justify-center px-6 md:px-10'
            >
                <TerminalWindow
                    path='~/500'
                    className='w-full max-w-2xl'
                >
                    <div
                        className='space-y-3 text-left text-sm md:text-base'
                    >
                        <p
                            className='text-gray-400'
                        >
                            <span
                                className='text-terminal-red'
                            >
                                guest@invictus
                            </span>
                            :~$ ./serve.sh
                        </p>

                        <p>
                            segmentation fault (core dumped)
                            <span
                                className='text-gray-400'
                            >
                                {' (500)'}
                            </span>
                        </p>

                        <p
                            className='text-gray-400'
                        >
                            the server hit an error handling that request. it has been logged.
                        </p>

                        <p
                            className='text-gray-400'
                        >
                            <span
                                className='text-terminal-red'
                            >
                                guest@invictus
                            </span>
                            :~${' '}
                            <Link
                                href='/'
                                className='underline decoration-terminal-red/50 hover:text-terminal-red transition-colors'
                            >
                                cd ~
                            </Link>
                            <span
                                className='terminalCursor'
                                aria-hidden='true'
                            />
                        </p>
                    </div>
                </TerminalWindow>
            </div>
        </>
    );
}
