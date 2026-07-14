import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const WINDOWS = [
    { index: 0, name: 'hero', href: '#hero' },
    { index: 1, name: 'about', href: '#about' },
    { index: 2, name: 'experience', href: '#experience' },
    { index: 3, name: 'skills', href: '#skills' },
    { index: 4, name: 'projects', href: '#projects' },
    { index: 5, name: 'contact', href: '#contact' },
];

// tmux-style status line: session name on the left, section "windows" as nav
// in the middle, clock + copyright on the right.
function Footer({ text }: FooterProps) {
    const year = new Date().getFullYear();
    // Clock is client-only to avoid a hydration mismatch; updates each minute.
    const [time, setTime] = useState('--:--');

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            setTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
        };
        tick();
        const interval = setInterval(tick, 30_000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div
            className='relative flex flex-row items-center justify-between gap-x-4 bg-black px-3 md:px-5 py-3 text-xs md:text-sm overflow-x-auto whitespace-nowrap scrollbar-none'
        >
            <p
                className='bg-[#FF0000]/80 text-black font-bold px-2 flex-shrink-0'
            >
                [invictus808]
            </p>

            <nav
                aria-label='Section shortcuts'
                className='hidden md:flex flex-row gap-x-3 text-gray-500'
            >
                {
                    WINDOWS.map((window) => {
                        return (
                            <Link
                                key={window.index}
                                href={window.href}
                                className='hover:text-[#FF0000] transition-colors'
                            >
                                {`${window.index}:${window.name}`}
                            </Link>
                        );
                    })
                }
            </nav>

            <p
                className='text-gray-400 flex-shrink-0'
            >
                {`© ${year} ${text} `}
                <span
                    className='text-[#FF0000]/80'
                >
                    {time}
                </span>
            </p>
        </div>
    );
}

export default Footer;
