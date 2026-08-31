import React from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';

// Navigation labels are site chrome, not portfolio content: they're short forms
// chosen to fit a header bar, where the sections' real headings are full
// sentences. The destinations are the section ids rendered in index.tsx.
const NAV = [
    { href: '#work', label: 'Work' },
    { href: '#experience', label: 'Experience' },
    { href: '#skills', label: 'Skills' },
    { href: '#process', label: 'How it goes' },
];

type Props = {
    ctaLabel: string;
    askLabel: string;
    onOpenPalette: () => void;
};

function Header({ ctaLabel, askLabel, onOpenPalette }: Props) {
    return (
        <header className='sticky top-0 z-40 border-b border-line/60 bg-bg/85 backdrop-blur-md'>
            <div className='mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3 md:px-10'>
                <Link
                    href='#hero'
                    aria-label='Home'
                    className='flex items-center rounded-md text-fg transition-colors duration-200 hover:text-accent'
                >
                    <Logo className='h-7 w-7' />
                </Link>

                <nav
                    aria-label='Sections'
                    className='hidden items-center gap-6 lg:flex'
                >
                    {
                        NAV.map(({ href, label }) => {
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className='nav-link'
                                >
                                    {label}
                                </Link>
                            );
                        })
                    }
                </nav>

                <div className='flex items-center gap-2 md:gap-3'>
                    {/* The palette is the small-screen navigation too, which is
                        why there is no hamburger: one affordance, both jobs. */}
                    {/* Square and finger-sized while the label is hidden; once the
                        label appears there is width to spare, so it relaxes to the
                        same bar height as the nav links beside it. */}
                    <button
                        type='button'
                        onClick={onOpenPalette}
                        className='flex items-center gap-2 rounded-lg border border-line p-2.5 text-muted
                                   transition-colors duration-200 hover:border-accent hover:text-fg
                                   sm:px-2.5 sm:py-1.5'
                    >
                        {/* A magnifier, not the shortcut glyph: "⌘K" on a phone
                            names a key combination the visitor does not have.
                            The glyph returns at lg, where a keyboard is likely. */}
                        <svg
                            aria-hidden='true'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='1.9'
                            strokeLinecap='round'
                            className='h-4 w-4 shrink-0'
                        >
                            <circle cx='11' cy='11' r='7' />
                            <path d='m20 20-3.5-3.5' />
                        </svg>
                        <span className='hidden text-xs sm:inline'>
                            {askLabel}
                        </span>
                        <span
                            aria-hidden='true'
                            className='hidden font-mono text-[11px] lg:inline'
                        >
                            ⌘K
                        </span>
                        <span className='sr-only'>
                            Open search and navigation
                        </span>
                    </button>

                    <ThemeToggle className='hidden sm:flex' />

                    {/* The shared primary-button class with a smaller, rounder
                        shape for the bar. It duplicated every one of those
                        declarations inline before, which meant a rule written
                        against .btn-primary — the forced-colours border, for one —
                        silently skipped the most prominent button on the page.
                        Tailwind's utilities layer wins over @apply, so the radius
                        and padding here still override. */}
                    <Link
                        href='#contact'
                        className='btn-primary whitespace-nowrap rounded-full px-4 py-2'
                    >
                        {ctaLabel}
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default Header;
