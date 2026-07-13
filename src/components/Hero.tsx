import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Cursor, useTypewriter } from 'react-simple-typewriter';
import BackgroundCircles from '@/components/BackgroundCircles';

function Hero({ image, prefix, titles, words }: HeroProps) {
    const [text, count] = useTypewriter({
        words: words,
        loop: true,
        delaySpeed: 2000,
    });

    return (
        <div
            className='flex flex-col overflow-hidden h-screen space-y-8 items-center justify-center text-center'
        >
            <BackgroundCircles />

            <Image
                src={image}
                alt='hero profile picture'
                width={128}
                height={128}
                quality={100}
                priority={true}
                className='relative rounded-full h-32 w-32 mx-auto object-cover'
            />
            <div
                className='z-20'
            >
                {
                    titles.map((title: string, index: number) => {
                        return (
                            <h2
                                key={index}
                                className='text-sm uppercase text-gray-500 pb-2 tracking-[10px] md:tracking-[15px]'
                            >
                                {'// ' + title}
                            </h2>
                        );
                    })
                }
                <h1
                    className='text-xl lg:text-3xl font-semibold scroll-px-10'
                >
                    <span
                        className='mr-1'
                    >
                        {prefix + text}
                    </span>
                    <Cursor
                        cursorColor='#FFFFFF'
                        cursorBlinking
                    />
                </h1>
                <div
                    className='pt-5'
                >
                    <Link
                        href='#about'
                    >
                        <button className='heroButton'>
                            About
                        </button>
                    </Link>
                    <Link
                        href='#experience'
                    >
                        <button className='heroButton'>
                            Experience
                        </button>
                    </Link>
                    <Link
                        href='#skills'
                    >
                        <button className='heroButton'>
                            Skills
                        </button>
                    </Link>
                    <Link
                        href='#projects'
                    >
                        <button className='heroButton'>
                            Projects
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Hero;
