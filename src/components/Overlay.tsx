import React from 'react';
import { SocialIcon } from 'react-social-icons';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import socials from '@/constants/socials';

type Props = {};

function Overlay({ }: Props) {
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
                className='absolute left-0 right-0 bottom-5 mx-auto z-50'
            >
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
                    className='flex space-x-2 items-center justify-center cursor-pointer'
                >

                    {
                        socials.map((social: string, index: number) => {
                            return (
                                <SocialIcon
                                    key={index}
                                    url={social}
                                    fgColor='gray'
                                    bgColor='white'
                                />
                            );
                        })
                    }
                </motion.div>
            </footer>
        </>
    );
}

export default Overlay;
