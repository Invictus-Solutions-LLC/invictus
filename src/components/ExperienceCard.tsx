import React from 'react';
import { motion } from 'framer-motion';

function ExperienceCard({ title, company, logo, start, end, technologies, description }: Experience) {
    return (
        <article
            className='flex flex-col rounded-lg items-center space-y-1 md:space-y-2 flex-shrink-0 w-[300px] md:w-[600px] xl:w-[900px] h-[75vh] max-h-[600px] snap-center bg-[#292929] p-4 md:p-10 opacity-40 hover:opacity-100 cursor-pointer transition-opacity duration-200 overflow-hidden'
        >
            <div
                className='flex flex-row xl:flex-col w-full md:px-10 flex-shrink-0'
            >
                <motion.img
                    src={logo}
                    alt={company}
                    initial={{
                        y: -100,
                        opacity: 0,
                    }}
                    whileInView={{
                        y: 0,
                        opacity: 1,
                    }}
                    transition={{
                        duration: 1.2,
                    }}
                    viewport={{
                        once: true,
                    }}
                    className='rounded-full object-cover object-center w-14 h-14 md:w-32 md:h-32 xl:w-36 xl:h-36 xl:m-auto flex-shrink-0'
                />

                <div
                    className='flex flex-col text-left md:m-auto xl:m-0 ml-2 md:ml-4 min-w-0'
                >
                    <h4
                        className='text-base md:text-4xl font-light my-auto pb-1 md:mt-0 md:pb-0'
                    >
                        {title}
                    </h4>
                    <p
                        className='text-base md:text-2xl font-bold hidden md:inline mt-1'
                    >
                        {company}
                    </p>
                </div>

            </div>
            <div
                className='md:hidden flex-shrink-0'
            >
                <p
                    className='text-sm font-bold'
                >
                    {company}
                </p>
            </div>
            <div
                className='w-full md:px-10 flex-shrink-0'
            >
                <div
                    className='flex flex-row justify-center md:justify-start space-x-2 my-1 md:my-2'
                >
                    {
                        technologies.map((technology: Technology, index: number) => {
                            return (
                                <img
                                    key={index}
                                    src={technology.image}
                                    alt={technology.name}
                                    className='h-6 w-6 md:h-10 md:w-10 rounded-full'
                                />
                            );
                        })
                    }
                </div>
                <p
                    className='uppercase text-gray-300 text-xs md:text-base py-1 md:py-2 text-center md:text-left'
                >
                    {start} - {end}
                </p>
            </div>
            <div
                className='flex-1 min-h-0 w-full overflow-y-auto text-center md:text-left px-0 md:px-10 scrollbar-thin scroll-smooth scrollbar-track-gray-400/20 scrollbar-thumb-[#FF0000]/80'
            >
                <ul
                    className='list-none text-left text-sm md:text-lg space-y-4'
                >
                    {
                        description.map((note: string, index: number) => {
                            return (
                                <li
                                    key={index}
                                    className='flex'
                                >
                                    <span
                                        className='text-[#FF0000]/70 mr-2 flex-shrink-0'
                                    >
                                        {'>'}
                                    </span>
                                    <span>
                                        {note}
                                    </span>
                                </li>
                            );
                        })
                    }
                </ul>
            </div>
        </article>
    );
}

export default ExperienceCard;
