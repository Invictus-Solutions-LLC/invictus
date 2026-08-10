import React from 'react';
import { motion } from 'framer-motion';
import AnimatedImage from '@/components/AnimatedImage';

function Skill({ image, level, name }: Skill) {
    return (
        <div
            tabIndex={0}
            role='img'
            aria-label={`${name}: ${level}% proficiency`}
            className='group relative flex mx-auto w-full max-w-32 md:max-w-[clamp(2.5rem,calc((100dvh-400px)/4),8rem)] lg:max-w-[clamp(2.5rem,calc((100dvh-390px)/3),8rem)] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#FF0000] rounded-full'
        >
            <AnimatedImage
                src={image}
                alt={name}
                width={256}
                height={256}
                sizes={'clamp(2.5rem, calc((100dvh - 390px) / 3), 8rem)'}
                initial={{
                    x: 24,
                    opacity: 0,
                }}
                animate={{
                    x: 0,
                    opacity: 1,
                }}
                transition={{
                    duration: 1,
                }}
                className='rounded-full border border-gray-500 object-cover w-full h-auto aspect-square filter group-hover:grayscale transition duration-300 ease-in-out'
            />

            <motion.div
                initial={{
                    x: 24,
                }}
                animate={{
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
