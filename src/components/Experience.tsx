import React from 'react';
import { motion } from 'framer-motion';
import ExperienceCard from '@/components/ExperienceCard';

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
            className='relative flex flex-col md:flex:row overflow-hidden max-w-full min-h-screen md:h-screen text-left mx-auto px-10 pb-36 md:pb-5 items-center'
        >
            <h3
                className='static uppercase tracking-[20px] text-gray-500 text-2xl pt-28 z-20'
            >
                Experience
            </h3>

            <div
                className='w-full flex space-x-5 overflow-x-scroll p-10 snap-x snap-mandatory scrollbar-thin scroll-smooth scrollbar-track-gray-400/20 scrollbar-thumb-[#FF0000]/80'
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
            </div>
        </motion.div>
    );
}

export default Experience;
