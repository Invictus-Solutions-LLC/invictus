import React from 'react';
import { motion } from 'framer-motion';

type Props = {};

function ExperienceCard({ }: Props) {
    return (
        <article
            className='flex flex-col rounded-lg items-center space-y-2  flex-shrink-0 w-[300px] md:w-[600px] xl:w-[900px] snap-center bg-[#292929] p-10 opacity-40 hover:opacity-100 cursor-pointer transition-opacity duration-200 overflow-hidden'
        >
            <div
                className='flex flex-row xl:flex-col w-full md:px-10'
            >
                <motion.img
                    src='https://gitlab.com/uploads/-/system/user/avatar/11223647/avatar.png?width=400'
                    alt='experience picture'
                    initial={{
                        y: -100,
                        opacity: 0,
                    }}
                    whileInView={{
                        y: 0,
                        opacity: 1,
                    }}
                    transition={{
                        duration: 1.2,
                    }}
                    viewport={{
                        once: true,
                    }}
                    className='rounded-full object-cover object-center w-24 h-24 md:w-32 md:h-32 xl:w-36 xl:h-36 xl:m-auto'
                />

                <div
                    className='flex flex-col text-left md:m-auto xl:m-0 pl-2 md:pl-0'
                >
                    <h4
                        className='text-2xl md:text-4xl font-light my-auto pb-3 md:mt-0 md:pb-0'
                    >
                        JOB TITLE
                    </h4>
                    <p
                        className='text-1xl md:text-2xl font-bold hidden md:inline mt-1'
                    >
                        COMPANY
                    </p>
                </div>
                
            </div>
            <div
                className='md:hidden'
            >
                <p
                    className='text-1xl md:text-2xl font-bold mt-1'
                >
                    COMPANY
                </p>
            </div>
            <div
                className='w-full md:px-10'
            >
                <div
                    className='flex flex-row justify-center md:justify-start space-x-2 my-2'
                >
                    <img
                        src='https://gitlab.com/uploads/-/system/user/avatar/11223647/avatar.png?width=400'
                        alt='technology picture'
                        className='h-10 w-10 rounded-full'
                    />
                    <img
                        src='https://gitlab.com/uploads/-/system/user/avatar/11223647/avatar.png?width=400'
                        alt='technology picture'
                        className='h-10 w-10 rounded-full'
                    />
                    <img
                        src='https://gitlab.com/uploads/-/system/user/avatar/11223647/avatar.png?width=400'
                        alt='technology picture'
                        className='h-10 w-10 rounded-full'
                    />
                </div>
                <p
                    className='uppercase text-gray-300 py-2 text-center md:text-left'
                >
                    START DATE - END DATE
                </p>
            </div>
            <div
                className='overflow-y-scroll text-center md:text-left px-0 md:px-10 scrollbar-thin scroll-smooth scrollbar-track-gray-400/20 scrollbar-thumb-[#FF0000]/80'
            >
                <ul
                    className='list-disc text-left text-sm md:text-lg space-y-4 ml-5'
                >
                    <li>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </li>
                    <li>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </li>
                    <li>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </li>
                </ul>
            </div>
        </article>
    );
}

export default ExperienceCard;
