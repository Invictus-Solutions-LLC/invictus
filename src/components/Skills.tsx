import React from 'react';
import { motion } from 'framer-motion';
import Skill from '@/components/Skill';

type Props = {};

function Skills({ }: Props) {
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
            className='relative flex flex-col min-h-screen md:h-screen text-center md:text-left md:flex-row max-w-[2000px] px-10 pb-36 mx-auto justify-evenly items-center'
        >
            <div>
                <h3
                    className='static uppercase tracking-[20px] text-gray-500 text-2xl pt-32 pb-4 md:pt-16 md:pb-8 xl:pt-20 xl:pb-12 z-20'
                >
                    Skills
                </h3>

                <h3
                    className='static uppercase tracking-[3px] text-gray-500 text-sm'
                >
                    Hover over a skill for current proficiency
                </h3>
            </div>

            <div
                className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 mt-10 mx-auto'
            >
                <Skill />
                <Skill />
                <Skill />
                <Skill />
                <Skill />
                <Skill />
                <Skill />
                <Skill />
                <Skill />
                <Skill />
                <Skill />
                <Skill />
                <Skill />
                <Skill />
            </div>
        </motion.div>
    );
}

export default Skills;
