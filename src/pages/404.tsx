import Head from 'next/head';
import Link from 'next/link';
import TerminalWindow from '@/components/TerminalWindow';

export default function NotFound() {
    return (
        <>
            <Head>
                <title>404 — no such file or directory</title>
            </Head>
            <div
                className='bg-[rgb(36,36,36)] text-white w-screen h-screen flex items-center justify-center px-6 md:px-10'
            >
                <TerminalWindow
                    path='~/404'
                    className='w-full max-w-2xl'
                >
                    <div
                        className='space-y-3 text-left text-sm md:text-base'
                    >
                        <p
                            className='text-gray-400'
                        >
                            <span
                                className='text-[#FF0000]/70'
                            >
                                guest@invictus
                            </span>
                            :~$ cd requested/page
                        </p>

                        <p>
                            bash: cd: requested/page: No such file or directory
                            <span
                                className='text-gray-500'
                            >
                                {' (404)'}
                            </span>
                        </p>

                        <p
                            className='text-gray-400'
                        >
                            <span
                                className='text-[#FF0000]/70'
                            >
                                guest@invictus
                            </span>
                            :~${' '}
                            <Link
                                href='/'
                                className='underline decoration-[#FF0000]/50 hover:text-[#FF0000] transition-colors'
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
