import React from 'react';
import Link from 'next/link';
import { SocialIcon } from 'react-social-icons';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';

type Props = FooterProps & SocialsProps & {
    // Site identity lives in seo.json, not baked into this component.
    name: string;
};

function Footer({ text, socials, name }: Props) {
    const year = new Date().getFullYear();

    return (
        <footer className='border-t border-line'>
            <div className='mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-10'>
                <Link
                    href='#hero'
                    className='flex items-center gap-2.5 text-fg'
                >
                    <Logo className='h-5 w-5' />
                    <span className='text-sm font-bold tracking-tight'>{name}</span>
                </Link>

                <nav aria-label='Social profiles'>
                    <ul className='flex flex-wrap items-center gap-1'>
                        {
                            socials.map((social: string) => {
                                return (
                                    <li key={social}>
                                        <SocialIcon
                                            url={social}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            fgColor='currentColor'
                                            bgColor='transparent'
                                            style={{ height: 36, width: 36 }}
                                            className='text-muted transition-colors hover:text-accent'
                                        />
                                    </li>
                                );
                            })
                        }
                    </ul>
                </nav>

                <div className='flex items-center gap-4'>
                    {/* The header hides the toggle below sm to protect the CTA;
                        this keeps it reachable on a phone. */}
                    <ThemeToggle className='sm:hidden' />
                    <p className='font-mono text-xs text-muted'>
                        {`© ${year} ${text}`}
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
