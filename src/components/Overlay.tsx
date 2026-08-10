import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { SocialIcon } from 'react-social-icons';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const SOCIAL_PANEL_ID = 'social-links';

function Overlay({ socials }: SocialsProps) {
    const elementRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handleClickAway = (event: MouseEvent) => {
            if (elementRef.current && event.target instanceof Node && !elementRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        // Click-away only fires for pointers; without this a keyboard user
        // could open the panel and have no way to dismiss it.
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen((wasOpen) => {
                    if (wasOpen) {
                        triggerRef.current?.focus();
                    }
                    return false;
                });
            }
        };

        document.addEventListener('click', handleClickAway);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('click', handleClickAway);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    const handleClick = (event: React.MouseEvent) => {
        // Keep the activating click from reaching the document-level
        // click-away listener, which would immediately close the menu again.
        event.stopPropagation();
        setOpen((wasOpen) => !wasOpen);
    };

    return (
        <>
            <header
                className='sticky top-0 p-5 md:p-10 flex items-start justify-between max-w-7xl mx-auto z-50 xl:items-center'
            >
                {/* socials */}
                <motion.div
                    initial={{
                        x: -500,
                        opacity: 0,
                        scale: 0.5,
                    }}
                    animate={{
                        x: 0,
                        opacity: 1,
                        scale: 1,
                    }}
                    transition={{
                        duration: 1.5,
                    }}
                    className='flex flex-row items-center'
                >
                    <Link
                        href="#hero"
                    >
                        <Image
                            src='/invictus-white.svg'
                            alt='invictus logo'
                            width='40'
                            height='40'
                        />
                    </Link>
                </motion.div>

                {/* contact */}
                <motion.div
                    initial={{
                        x: 500,
                        opacity: 0,
                        scale: 0.5,
                    }}
                    animate={{
                        x: 0,
                        opacity: 1,
                        scale: 1,
                    }}
                    transition={{
                        duration: 1.5,
                    }}
                    className='flex flex-row items-center cursor-pointer'
                >
                    <SocialIcon
                        url='#contact'
                        network='email'
                        fgColor='white'
                        bgColor='transparent'
                        className='cursor-pointer'
                    />
                    <Link
                        href='#contact'
                        className='hidden md:inline-flex w-auto h-[50px]'
                    >
                        <p
                            className='m-auto uppercase text-sm text-white'
                        >
                            Contact Me
                        </p>
                    </Link>
                </motion.div>
            </header>

            <footer
                className='absolute bottom-0 left-1/2 -translate-x-1/2 justify-center items-center max-w-7xl mx-auto p-5 md:p-10 z-50'
            >
                {/* The trigger stays mounted whether or not the panel is open.
                    Swapping it out for the links destroyed focus on activation,
                    dropping a keyboard user back to the top of the document. */}
                <div
                    ref={elementRef}
                    className='flex flex-row items-center justify-center gap-x-2'
                >
                    <button
                        ref={triggerRef}
                        type='button'
                        aria-label={open ? 'Hide social links' : 'Show social links'}
                        aria-expanded={open}
                        aria-controls={SOCIAL_PANEL_ID}
                        onClick={handleClick}
                        className='flex flex-row justify-center cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0000]'
                    >
                        <SocialIcon
                            as='div'
                            fgColor='white'
                            bgColor='none'
                        />
                    </button>

                    {
                        open &&
                        <motion.div
                            id={SOCIAL_PANEL_ID}
                            initial={{
                                opacity: 1,
                                scale: .5,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                            }}
                            transition={{
                                duration: 1.5,
                            }}
                            className='flex space-x-2 flex-row justify-center'
                        >
                            {
                                socials.map((social: string, index: number) => {
                                    return (
                                        <SocialIcon
                                            key={index}
                                            url={social}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            fgColor='white'
                                            bgColor='none'
                                        />
                                    );
                                })
                            }
                        </motion.div>
                    }
                </div>
            </footer>
        </>
    );
}

export default Overlay;
