import React from 'react';
import { motion } from 'framer-motion';

type Props = {};

function About({ }: Props) {
    return (
        <motion.div
            className='flex flex-col relative h-screen text-center md:text-left md:flex-row max-w-7xl px-10 justify-evenly mx-auto items-center'
            initial={{
                opacity: 0,
            }}
            whileInView={{
                opacity: 1,
            }}
            transition={{
                duration: 1.5,
            }}
        >
            <h3
                className='absolute top-24 uppercase tracking-[20px] text-gray-500 text-2xl'
            >
                About
            </h3>
            <motion.img
                src='https://gitlab.com/uploads/-/system/user/avatar/11223647/avatar.png?width=400'
                alt='profile picture'
                initial={{
                    x: -200,
                    opacity: 0,
                }}
                whileInView={{
                    x: 0,
                    opacity: 1,
                }}
                viewport={{
                    once: true,
                }}
                transition={{
                    duration: 1.2,
                }}
                className='-mb-20 md:mb-0 flex-shrink-0 w-56 h-56 rounded-full object-cover md:rounded-lg md:w-64 md:h-96 xl:w-[500px] xl:h-[600px]'
            />

            <div
                className='space-y-10 px-0 md:px-10'
            >
                <h4
                    className='text-4xl font-semibold'
                >
                    Here is a&nbsp;
                    <span
                        className='underline decoration-[#FF0000]/50'
                    >
                        little
                    </span>
                    &nbsp;background
                </h4>
                <p
                    className='text-base'
                >
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
            </div>
        </motion.div>
    );
}

export default About;
