import React from 'react';
import { motion } from 'framer-motion';
import Skill from '@/components/Skill';

function Skills({ header, skills }: SkillsProps) {
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
            className='relative flex flex-col overflow-hidden min-h-screen md:h-screen text-center md:text-left md:flex-row max-w-[2000px] px-10 pb-36 md:pb-10 mx-auto justify-evenly items-center'
        >
            <div>
                <h3
                    className='static uppercase tracking-[20px] text-gray-500 text-2xl pt-16 md:pt-20 lg:pt-28 pb-4 md:pb-8 xl:pb-12 z-20'
                >
                    Skills
                </h3>

                <h3
                    className='static uppercase tracking-[3px] text-gray-500 text-sm'
                >
                    {header}
                </h3>
            </div>

            <div
                className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 mt-10 mx-auto'
            >
                {
                    skills.map((skill, index) => {
                        return (
                            <Skill
                                key={index}
                                {...skill}
                            />
                        );
                    })
                }
            </div>
        </motion.div>
    );
}

export default Skills;
