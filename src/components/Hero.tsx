import React from 'react';
import { Cursor, useTypewriter } from 'react-simple-typewriter';
import BackgroundCircles from '@/components/BackgroundCircles';
import Image from 'next/image';
import profilePicture from '../../public/profile-picture.png';
import Link from 'next/link';

type Props = {};

function Hero({ }: Props) {
    const prefix = "root@invictus:~# ";
    const [text, count] = useTypewriter({
        words: [
            "Hi, I'm [REDACTED]",
            "./ethical-hacker.sh",
            "PWN3D !!!",
        ],
        loop: true,
        delaySpeed: 2000,
    });

    return (
        <div
            className='h-screen flex flex-col space-y-8 items-center justify-center text-center overflow-hidden'
        >
            <BackgroundCircles />

            <Image
                className='relative rounded-full h-32 w-32 mx-auto object-cover'
                src={profilePicture}
                alt='profile picture'
                placeholder='blur'
                width='200'
                height='200'
            />
            <div
                className='z-20'
            >
                <h2
                    className='text-sm uppercase text-gray-500 pb-2 tracking-[10px] md:tracking-[15px]'
                >
                    // Software Engineer
                </h2>
                <h2
                    className='text-sm uppercase text-gray-500 pb-2 tracking-[10px] md:tracking-[15px]'
                >
                    // Ethical Hacker
                </h2>
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
