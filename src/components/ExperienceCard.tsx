import React from 'react';
import { motion } from 'framer-motion';

type Props = {};

function ExperienceCard({ }: Props) {
    return (
        <article
            className='flex flex-col rounded-lg items-center space-y-7 flex-shrink-0 w-[500px] md:w-[600px] xl:w-[900px] snap-center bg-[#292929] p-10 opacity-40 hover:opacity-100 cursor-pointer transition-opacity duration-200 overflow-hidden'
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
                className='w-32 h-32 rounded-full xl:w-[200px] xl:h-[200px] object-cover object-center'
            />

            <div
                className='text-center md:text-left px-0 md:px-10'
            >
                <h4
                    className='text-2xl md:text-4xl font-light'
                >
                    JOB TITLE
                </h4>
                <p
                    className='text-1xl md:text-2xl font-bold mt-1'
                >
                    COMPANY
                </p>
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
                    className='uppercase py-5 text-gray-300'
                >
                    START DATE - END DATE
                </p>
                <div
                    className=''
                >
                    <ul
                        className='list-disc text-left text-sm md:text-lg space-y-4 ml-5 px-16'
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
            </div>
        </article>
    );
}

export default ExperienceCard;
