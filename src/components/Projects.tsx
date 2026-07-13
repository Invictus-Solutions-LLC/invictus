import React from 'react';
import { motion } from 'framer-motion';
import TerminalWindow from '@/components/TerminalWindow';
import ProjectCard from '@/components/ProjectCard';
import CardCarousel from '@/components/CardCarousel';

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
                className='static flex-shrink-0 uppercase tracking-[20px] text-gray-500 text-2xl pt-16 md:pt-20 lg:pt-28 pb-4 md:pb-8 xl:pb-12 z-20'
            >
                Projects
            </h3>

            <TerminalWindow
                path='~/projects'
                className='relative w-full flex-1 min-h-0 z-10'
            >
                <CardCarousel>
                    {
                        projects.map((project: Project, index: number) => {
                            return (
                                <ProjectCard
                                    key={index}
                                    {...project}
                                />
                            );
                        })
                    }
                </CardCarousel>
            </TerminalWindow>

            <div
                className='w-full absolute top-[30%] bg-[#FF0000]/10 left-0 h-[500px] -skew-y-12 z-0'
            />
        </motion.div>
    );
}

export default Projects;
