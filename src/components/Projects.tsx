import React from 'react';
import { motion } from 'framer-motion';

type Props = {};

function Projects({ }: Props) {
    const projects = [1, 2, 3, 4, 5];

    return (
        <motion.div
            initial={{
                opacity: 0,
            }}
            whileInView={{
                opacity: 1,
            }}
            transition={{
                duration: 1.5,
            }}
            className='min-h-screen relative flex overflow-hidden flex-col text-left md:flex-row max-w-full justify-evenly mx-auto items-center z-0'
        >
            <h3
                className='absolute top-24 uppercase tracking-[20px] text-gray-500 text-2xl'
            >
                Projects
            </h3>

            <div
                className='relative w-full h-screen flex overflow-x-scroll overflow-y-hidden snap-x snap-mandatory z-20 scrollbar-thin scroll-smooth scrollbar-track-gray-400/20 scrollbar-thumb-[#FF0000]/80'
            >
                {
                    projects.map((project, index) => {
                        return (
                            <div
                                key={index}
                                className='w-screen flex-shrink-0 snap-center flex flex-col space-y-5 items-center justify-center p-20 md:p-44 h-screen'
                            >
                                <motion.img
                                    src='https://gitlab.com/uploads/-/system/user/avatar/11223647/avatar.png?width=400'
                                    alt='project picture'
                                    initial={{
                                        y: -300,
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
                                />

                                <div
                                    className='space-y-10 px-0 md:px-10 max-w-6xl'
                                >
                                    <h4
                                        className='text-4xl font-semibold text-center'
                                    >
                                        <span
                                            className='underline decoration-[#FF0000]/50'
                                        >
                                            Case Study {index + 1} of {projects.length}:
                                        </span>
                                        &nbsp;Project
                                    </h4>

                                    <p
                                        className='text-lg text-center md:text-left'
                                    >
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                                        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                                    </p>
                                </div>
                            </div>
                        );
                    })
                }
            </div>

            <div
                className='w-full absolute top-[30%] bg-[#FF0000]/10 left-0 h-[500px] -skew-y-12'
            />
        </motion.div>
    );
}

export default Projects;
