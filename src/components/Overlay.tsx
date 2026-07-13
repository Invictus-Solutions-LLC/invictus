import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { SocialIcon } from 'react-social-icons';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

function Overlay({ socials }: SocialsProps) {
    const elementRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handleClickAway = (event: MouseEvent) => {
            if (elementRef.current && event.target instanceof Node && !elementRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('click', handleClickAway);

        return () => {
            document.removeEventListener('click', handleClickAway);
        };
    }, []);

    const handleClick = (event: React.MouseEvent) => {
        setOpen(true);
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
                {
                    open ?
                        <motion.div
                            initial={{
                                x: 0,
                                opacity: 1,
                                scale: .5,
                            }}
                            animate={{
                                x: 0,
                                opacity: 1,
                                scale: 1,
                            }}
                            transition={{
                                duration: 1.5,
                            }}
                            className='flex space-x-2 flex-row justify-center cursor-pointer'
                            ref={elementRef}
                        >
                            {
                                socials.map((social: string, index: number) => {
                                    return (
                                        <SocialIcon
                                            key={index}
                                            url={social}
                                            fgColor='white'
                                            bgColor='none'
                                        />
                                    );
                                })
                            }
                        </motion.div>
                        :
                        <div
                            className='flex flex-row justify-center cursor-pointer'
                        >
                            <SocialIcon
                                fgColor='white'
                                bgColor='none'
                                onMouseUp={handleClick}
                            />
                        </div>
                }
            </footer>
        </>
    );
}

export default Overlay;
