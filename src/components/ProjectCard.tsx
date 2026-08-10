import React from 'react';
import { motion } from 'framer-motion';
import AnimatedImage from '@/components/AnimatedImage';
import { useResetScrollOnLeave } from '@/hooks/useResetScrollOnLeave';

function ProjectCard({ name, image, url, description }: Project) {
    const ref = useResetScrollOnLeave<HTMLDivElement>();

    return (
        <div
            ref={ref}
            className='flex flex-col h-full flex-shrink-0 w-full snap-center space-y-5 items-center overflow-y-auto scrollbar-thin scroll-smooth scrollbar-track-transparent scrollbar-thumb-[#FF0000]/70 scrollbar-thumb-rounded-full'
        >
            <a
                href={url}
                target='_blank'
                rel='noopener noreferrer'
                aria-label={`Open ${name} project`}
            >
                <AnimatedImage
                    src={image}
                    alt={name}
                    width={512}
                    height={512}
                    sizes={'(min-width: 1024px) 256px, (min-width: 768px) 192px, 128px'}
                    initial={{
                        y: -100,
                        opacity: 0,
                    }}
                    animate={{
                        y: 0,
                        opacity: 1,
                    }}
                    transition={{
                        duration: 1.2,
                    }}
                    className='w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 object-contain'
                />
            </a>

            <div
                className='relative w-full space-y-4 px-0 md:px-10 max-w-6xl'
            >
                <h3
                    className='text-2xl md:text-4xl font-semibold text-center'
                >
                    <a
                        href={url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='underline decoration-terminal-red/50 hover:text-terminal-red transition-colors'
                    >
                        {name}
                    </a>
                </h3>

                <p
                    className='text-md md:text-lg text-center md:text-left px-2'
                >
                    {description}
                </p>

                <p
                    className='commentCaption text-center md:text-left'
                >
                    <a
                        href={url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='hover:text-terminal-red transition-colors'
                    >
                        {`open ${url}`}
                    </a>
                </p>
            </div>
        </div>
    );
}

export default ProjectCard;
