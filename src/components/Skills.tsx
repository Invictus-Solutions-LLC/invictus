import React from 'react';
import { motion } from 'framer-motion';
import Skill from '@/components/Skill';
import TerminalWindow from '@/components/TerminalWindow';
import SectionPrompt from '@/components/SectionPrompt';

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
            className='relative flex flex-col overflow-hidden min-h-screen md:h-screen text-center md:text-left md:flex-row max-w-[2000px] px-10 pb-36 md:pb-5 mx-auto justify-evenly items-center'
        >
            <div>
                <SectionPrompt
                    label='Skills'
                    command='ls ./skills'
                    className='pt-16 md:pt-20 lg:pt-28 pb-4 md:pb-8 xl:pb-12'
                />

                <p
                    className='commentCaption static tracking-[3px] text-sm'
                >
                    {header}
                </p>
            </div>

            <TerminalWindow
                path='~/skills'
                className='mt-10 md:self-stretch'
            >
                <div
                    className='grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5 mx-auto'
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
            </TerminalWindow>
        </motion.div>
    );
}

export default Skills;
