import React from 'react';
import { SocialIcon } from 'react-social-icons';
import { motion } from 'framer-motion';
import socials from '@/constants/socials';

type Props = {};

function Header({}: Props) {
    return (
        <header
            className='sticky top-0 p-5 flex items-start justify-between max-w-7xl mx-auto z-50 xl:items-center'
        >
            {/* socials */}
            <motion.div
                className='flex flex-row items-center'
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
            >
                {
                    socials.map((social: string, index: number) => {
                        return (
                            <SocialIcon
                                key={index}
                                url={social}
                                fgColor='gray'
                                bgColor='transparent'
                            />
                        );
                    })
                }
            </motion.div>

            {/* contact */}
            <motion.div
                className='flex flex-row items-center text-gray-300 cursor-pointer'
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
            >
                <SocialIcon
                    className='cursor-pointer'
                    network='email'
                    fgColor='gray'
                    bgColor='transparent'
                />
                <p
                    className='uppercase hidden md:inline-flex text-sm text-gray-400'
                >
                    Contact Me
                </p>
            </motion.div>
        </header>
    );
}

export default Header;
