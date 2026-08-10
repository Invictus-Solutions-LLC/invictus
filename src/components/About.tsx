import React from 'react';
import { motion } from 'framer-motion';
import AnimatedImage from '@/components/AnimatedImage';
import TerminalWindow from '@/components/TerminalWindow';
import SectionPrompt from '@/components/SectionPrompt';
import RichText from '@/components/RichText';

function About({ header, image, text }: AboutProps) {
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
            className='relative flex flex-col overflow-hidden min-h-dvh md:h-dvh text-center max-w-7xl mx-auto px-10 pt-16 md:pt-20 lg:pt-24 pb-36 md:pb-5 items-center'
        >
            <SectionPrompt
                label='About'
                command='cd ./about'
                className='pb-4 md:pb-6'
            />

            <TerminalWindow
                path='~/about'
                className='w-full flex-1 min-h-0'
            >
                <div
                    className='flex flex-col md:flex-row min-h-full'
                >
                    <AnimatedImage
                        src={image}
                        alt='about profile picture'
                        width={640}
                        height={960}
                        sizes={'(min-width: 1280px) min(24vw, 20rem), (min-width: 768px) min(20vw, 16rem), 160px'}
                        initial={{
                            x: -40,
                            opacity: 0,
                        }}
                        animate={{
                            x: 0,
                            opacity: 1,
                        }}
                        transition={{
                            duration: 1.2,
                        }}
                        className='static m-auto md:self-center flex-shrink-0 w-40 h-40 rounded-full object-cover md:rounded-lg md:w-[clamp(5rem,min(24vh,20vw),16rem)] md:h-[clamp(7.5rem,min(36vh,30vw),24rem)] xl:w-[clamp(6rem,min(30vh,24vw),20rem)] xl:h-[clamp(9rem,min(45vh,36vw),30rem)]'
                    />

                    <div
                        className='static flex flex-col flex-1 min-w-0 px-0 md:px-10 pt-6 md:pt-0 z-20'
                    >
                        <h3
                            className='flex-shrink-0 text-[clamp(1.375rem,4vh,2.25rem)] font-semibold py-2'
                        >
                            {header}
                        </h3>

                        <div
                            className='flex flex-col gap-y-[clamp(0.5rem,1.5vh,1rem)] my-auto'
                        >
                            {
                                text.map((paragraph: string, index: number) => {
                                    return (
                                        <p
                                            key={index}
                                            className='text-[clamp(0.8125rem,2vh,1rem)] md:text-left'
                                        >
                                            <RichText
                                                text={paragraph}
                                            />
                                        </p>
                                    );
                                })
                            }
                        </div>
                    </div>
                </div>
            </TerminalWindow>
        </motion.div>
    );
}

export default About;
