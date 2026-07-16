import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Skill from '@/components/Skill';
import TerminalWindow from '@/components/TerminalWindow';
import SectionPrompt from '@/components/SectionPrompt';

function Skills({ header, skills, certifications = [] }: SkillsProps) {
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

                {
                    certifications.length > 0 &&
                    <div
                        className='mt-8 md:mt-12'
                    >
                        <p
                            className='commentCaption static tracking-[3px] text-sm pb-4'
                        >
                            certifications
                        </p>
                        <div
                            className='flex flex-row flex-wrap gap-4 justify-center md:justify-start'
                        >
                            {
                                certifications.map((certification: Certification, index: number) => {
                                    return (
                                        <a
                                            key={index}
                                            href={certification.url}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            title={certification.name}
                                            aria-label={`${certification.name} — view verified credential`}
                                            className='block rounded-full transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0000]/60'
                                        >
                                            <Image
                                                src={certification.image}
                                                alt={`${certification.name} verified credential badge`}
                                                width={112}
                                                height={112}
                                                className='w-24 h-24 md:w-28 md:h-28 object-contain'
                                            />
                                        </a>
                                    );
                                })
                            }
                        </div>
                    </div>
                }
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
