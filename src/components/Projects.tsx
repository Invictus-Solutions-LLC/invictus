import React from 'react';
import { motion } from 'framer-motion';
import TerminalWindow from '@/components/TerminalWindow';
import ProjectCard from '@/components/ProjectCard';
import CardCarousel from '@/components/CardCarousel';
import SectionPrompt from '@/components/SectionPrompt';

// Mirrors Experience: heading stacks above the carousel on narrow viewports and
// moves into a left column from lg, handing the terminal the full section height.
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
            className='relative flex flex-col lg:flex-row overflow-hidden min-h-dvh md:h-dvh text-center lg:text-left max-w-full mx-auto px-10 pt-16 md:pt-20 lg:pt-24 pb-36 md:pb-5 lg:gap-10 items-center lg:items-stretch'
        >
            <SectionPrompt
                label='Projects'
                command='cd ./projects'
                variant='sidebar'
                className='pb-4 md:pb-6 lg:pb-0 lg:w-72 lg:self-center'
            />

            <TerminalWindow
                path='~/projects'
                className='relative w-full flex-1 min-h-0 min-w-0 z-10'
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
