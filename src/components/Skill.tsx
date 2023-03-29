import React from 'react';
import { motion } from 'framer-motion';

type Props = {
    directionLeft?: boolean;
};

function Skill({ directionLeft }: Props) {
    return (
        <div
            className='group relative flex cursor-pointer'
        >
            <motion.img
                src='https://gitlab.com/uploads/-/system/user/avatar/11223647/avatar.png?width=400'
                alt='skill picture'
                initial={{
                    x: directionLeft ? -100 : 100,
                    opacity: 0,
                }}
                whileInView={{
                    x: 0,
                    opacity: 1,
                }}
                transition={{
                    duration: 1,
                }}
                className='rounded-full border border-gray-500 object-cover w-24 h-24 md:w-28 md:h-28 xl:w-32 xl:h-32 filter group-hover:grayscale transition duration-300 ease-in-out'
            />

            <motion.div
                initial={{
                    x: directionLeft ? -100 : 100,
                }}
                whileInView={{
                    x: 0,
                }}
                transition={{
                    duration: 1,
                }}
                className='absolute opacity-0 group-hover:opacity-80 transition duration-300 ease-in-out group-hover:bg-white w-full h-full rounded-full z-0'
            >
                <div
                    className='flex items-center justify-center h-full'
                >
                    <p
                        className='text-3xl font-bold text-black opacity-100'
                    >
                        100%
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

export default Skill;
