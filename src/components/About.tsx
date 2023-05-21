import React from 'react';
import { motion } from 'framer-motion';

function About({ header, text }: APIAbout) {
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
            className='relative flex flex-col overflow-hidden min-h-screen text-center max-w-7xl mx-auto px-10 pb-36 md:pb-0 items-center'
        >
            <h3
                className='static uppercase tracking-[20px] text-gray-500 text-2xl pt-28 pb-4 md:pb-8 xl:pb-12 z-20'
            >
                About
            </h3>

            <div
                className='flex flex-col md:flex-row'
            >
                <motion.img
                    src='https://gitlab.com/uploads/-/system/user/avatar/11223647/avatar.png?width=400'
                    alt='profile picture'
                    initial={{
                        x: -200,
                        opacity: 0,
                    }}
                    whileInView={{
                        x: 0,
                        opacity: 1,
                    }}
                    viewport={{
                        once: true,
                    }}
                    transition={{
                        duration: 1.2,
                    }}
                    className='static m-auto md:mb-0 flex-shrink-0 w-56 h-56 rounded-full object-cover md:rounded-lg md:w-64 md:h-96 lg:w-64 lg:h-96 xl:w-[500px] xl:h-[600px]'
                />

                <div
                    className='static space-y-10 px-10 z-20'
                >
                    <h4
                        className='text-4xl font-semibold py-4'
                    >
                        {header}
                    </h4>
                    {
                        text.map((paragraph: string, index: number) => {
                            return (
                                <p
                                    key={index}
                                    className='text-base md:text-left'
                                >
                                    {paragraph}
                                </p>
                            );
                        })
                    }
                </div>
            </div>
        </motion.div>
    );
}

export default About;
