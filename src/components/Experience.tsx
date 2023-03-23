import React from 'react';
import { motion } from 'framer-motion';
import ExperienceCard from '@/components/ExperienceCard';

type Props = {};

function Experience({ }: Props) {
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
            className='relative flex flex-col min-h-screen md:h-screen overflow-hidden text-left md:flex:row max-w-full mx-auto px-10 pb-36 md:pb-10 items-center'
        >
            <h3
                className='static uppercase tracking-[20px] text-gray-500 text-2xl pt-32 md:pt-16 xl:pt-20 z-20'
            >
                Experience
            </h3>

            <div
                className='w-full flex space-x-5 overflow-x-scroll p-10 snap-x snap-mandatory scrollbar-thin scroll-smooth scrollbar-track-gray-400/20 scrollbar-thumb-[#FF0000]/80'
            >
                <ExperienceCard />
                <ExperienceCard />
                <ExperienceCard />
                <ExperienceCard />
            </div>
        </motion.div>
    );
}

export default Experience;
