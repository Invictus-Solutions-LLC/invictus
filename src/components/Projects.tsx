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
            className='relative flex flex-col overflow-hidden min-h-screen md:h-screen text-center max-w-full mx-auto px-10 pb-36 md:pb-5 items-center'
        >
            <h3
                className='static uppercase tracking-[20px] text-gray-500 text-2xl pt-32 pb-4 md:pt-16 md:pb-8 xl:pt-20 xl:pb-12 z-20'
            >
                Projects
            </h3>

            <div
                className='static flex w-full h-full overflow-x-scroll snap-x snap-mandatory scrollbar-thin scroll-smooth scrollbar-track-gray-400/20 scrollbar-thumb-[#FF0000]/80 z-10'
            >
                {
                    projects.map((project, index) => {
                        return (
                            <div
                                key={index}
                                className='flex flex-col w-full flex-shrink-0 snap-center space-y-5 items-center justify-center'
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
                                        className='text-2xl md:text-4xl font-semibold text-center'
                                    >
                                        <span
                                            className='underline decoration-[#FF0000]/50'
                                        >
                                            Case Study {index + 1} of {projects.length}:
                                        </span>
                                        &nbsp;Project
                                    </h4>

                                    <p
                                        className='text-md md:text-lg text-center md:text-left'
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
                className='w-full absolute top-[30%] bg-[#FF0000]/10 left-0 h-[500px] -skew-y-12 z-0'
            />
        </motion.div>
    );
}

export default Projects;
