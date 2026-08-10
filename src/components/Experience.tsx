import React from 'react';
import { motion } from 'framer-motion';
import ExperienceCard from '@/components/ExperienceCard';
import TerminalWindow from '@/components/TerminalWindow';
import CardCarousel from '@/components/CardCarousel';
import SectionPrompt from '@/components/SectionPrompt';

// Below lg the heading stacks above the carousel (the narrow-viewport default).
// From lg it moves into a narrow left column so the terminal gets the section's
// full height — more vertical room for each card's content.
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
            className='relative flex flex-col lg:flex-row overflow-hidden max-w-full min-h-dvh md:h-dvh text-left mx-auto px-10 pt-16 md:pt-20 lg:pt-24 pb-36 md:pb-5 lg:gap-10 items-center lg:items-stretch'
        >
            <SectionPrompt
                label='Experience'
                command='cd ./experience'
                variant='sidebar'
                className='pb-4 md:pb-6 lg:pb-0 lg:w-72 lg:self-center'
            />

            <TerminalWindow
                path='~/experience'
                className='w-full flex-1 min-h-0 min-w-0'
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
