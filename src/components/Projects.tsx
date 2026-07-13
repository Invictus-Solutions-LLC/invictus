import React from 'react';
import { motion } from 'framer-motion';
import TerminalWindow from '@/components/TerminalWindow';

function Projects({ projects }: ProjectsProps) {
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
                className='static uppercase tracking-[20px] text-gray-500 text-2xl pt-16 md:pt-20 lg:pt-28 pb-4 md:pb-8 xl:pb-12 z-20'
            >
                Projects
            </h3>

            <TerminalWindow
                path='~/projects'
                className='relative w-full h-full z-10'
            >
                <div
                    className='relative flex w-full h-full overflow-x-scroll snap-x snap-mandatory scrollbar-thin scroll-smooth scrollbar-track-gray-400/20 scrollbar-thumb-[#FF0000]/80'
                >
                    {
                        projects.map((project: Project, index: number) => {
                            return (
                                <div
                                    key={index}
                                    className='flex flex-col flex-shrink-0 w-full snap-center space-y-5 items-center'
                                >
                                    <a
                                        href={project.url}
                                    >
                                        <motion.img
                                            src={project.image}
                                            alt={project.name}
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
                                            className='w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64'
                                        />
                                    </a>

                                    <div
                                        className='relative space-y-4 px-0 md:px-10 max-w-6xl'
                                    >
                                        <h4
                                            className='text-2xl md:text-4xl font-semibold text-center'
                                        >
                                            <span
                                                className='underline decoration-[#FF0000]/50'
                                            >
                                                {project.name}
                                            </span>
                                        </h4>

                                        <p
                                            className='text-md md:text-lg text-center md:text-left max-h-[35vh] overflow-y-auto scrollbar-thin scroll-smooth scrollbar-track-gray-400/20 scrollbar-thumb-[#FF0000]/80 px-2'
                                        >
                                            {project.description}
                                        </p>

                                        <p
                                            className='commentCaption text-center md:text-left'
                                        >
                                            {`open ${project.url}`}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
            </TerminalWindow>

            <div
                className='w-full absolute top-[30%] bg-[#FF0000]/10 left-0 h-[500px] -skew-y-12 z-0'
            />
        </motion.div>
    );
}

export default Projects;
