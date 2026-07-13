import React from 'react';
import { motion } from 'framer-motion';
import ExperienceCard from '@/components/ExperienceCard';
import TerminalWindow from '@/components/TerminalWindow';
import CardCarousel from '@/components/CardCarousel';

function Experience({ experiences }: ExperienceProps) {
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
            className='relative flex flex-col overflow-hidden max-w-full min-h-screen md:h-screen text-left mx-auto px-10 pb-36 md:pb-5 items-center'
        >
            <h3
                className='static flex-shrink-0 uppercase tracking-[20px] text-gray-500 text-2xl pt-16 md:pt-20 lg:pt-28 z-20'
            >
                Experience
            </h3>

            <TerminalWindow
                path='~/experience'
                className='w-full flex-1 min-h-0'
            >
                <CardCarousel
                    rowClassName='space-x-5'
                >
                    {
                        experiences.map((experience: Experience, index: number) => {
                            return (
                                <ExperienceCard
                                    key={index}
                                    {...experience}
                                />
                            );
                        })
                    }
                </CardCarousel>
            </TerminalWindow>
        </motion.div>
    );
}

export default Experience;
