import React from 'react';
import { motion } from 'framer-motion';

function Skill({ image, level, name }: Skill) {
    return (
        <div
            tabIndex={0}
            role='img'
            aria-label={`${name}: ${level}% proficiency`}
            className='group relative flex cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#FF0000]/60 rounded-full'
        >
            <motion.img
                src={image}
                alt={name}
                initial={{
                    x: 24,
                    opacity: 0,
                }}
                whileInView={{
                    x: 0,
                    opacity: 1,
                }}
                transition={{
                    duration: 1,
                }}
                className='rounded-full border border-gray-500 object-cover w-full h-auto aspect-square max-w-32 filter group-hover:grayscale transition duration-300 ease-in-out'
            />

            <motion.div
                initial={{
                    x: 24,
                }}
                whileInView={{
                    x: 0,
                }}
                transition={{
                    duration: 1,
                }}
                className='absolute opacity-0 group-hover:opacity-80 group-focus:opacity-80 transition duration-300 ease-in-out group-hover:bg-white group-focus:bg-white w-full h-full rounded-full z-0'
            >
                <div
                    className='flex items-center justify-center h-full'
                >
                    <p
                        className='font-mono text-sm md:text-xl xl:text-2xl font-bold text-black opacity-100'
                    >
                        {`// ${level}%`}
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

export default Skill;
