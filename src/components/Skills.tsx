import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Skill from '@/components/Skill';
import TerminalWindow from '@/components/TerminalWindow';
import SectionPrompt from '@/components/SectionPrompt';

// Counterpoint to Experience/Projects: the heading stays stacked on top at every
// width, and from md the content beneath splits into certifications (narrow) and
// the skills grid (fills the rest). Everything collapses to one column below md.
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
            className='relative flex flex-col overflow-hidden min-h-dvh md:h-dvh text-center max-w-[2000px] px-10 pt-16 md:pt-20 lg:pt-24 pb-36 md:pb-5 mx-auto items-center'
        >
            <div
                className='w-full flex-shrink-0'
            >
                <SectionPrompt
                    label='Skills'
                    command='ls ./skills'
                    className='pb-3 md:pb-4'
                />

                <p
                    className='commentCaption static tracking-[3px] text-sm'
                >
                    {header}
                </p>
            </div>

            <div
                className='w-full flex-1 min-h-0 flex flex-col md:flex-row items-center md:items-stretch gap-6 md:gap-8 mt-6 md:mt-8'
            >
                {
                    certifications.length > 0 &&
                    <TerminalWindow
                        path='~/certifications'
                        className='w-fit flex-shrink-0 md:self-start'
                    >
                        <div
                            className='flex flex-row flex-wrap gap-4 justify-center'
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
                                            className='block rounded-full transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0000]'
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
                    </TerminalWindow>
                }

                <TerminalWindow
                    path='~/skills'
                    className='w-full flex-1 min-h-0 min-w-0'
                >
                    <div
                        className='grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-5 mx-auto'
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
            </div>
        </motion.div>
    );
}

export default Skills;
