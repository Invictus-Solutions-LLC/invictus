import React from 'react';
import Link from 'next/link';
import Ambient from '@/components/Ambient';
import ContentImage from '@/components/ContentImage';
import CertificationCard from '@/components/CertificationCard';
import RichText from '@/components/RichText';

type Props = HeroProps & {
    // The prose comes from about.json: there is one place the "who I am" copy
    // lives, written in the owner's own voice, rather than a hero paragraph that
    // says the same thing differently a screen above it.
    paragraphs: Array<string>;
    certification?: Certification;
};

function Hero({ location, greeting, headline, image, imageAlt, ctas, paragraphs, certification }: Props) {
    return (
        <div className='relative overflow-hidden'>
            <Ambient />

            <div className='relative mx-auto grid max-w-6xl gap-12 px-6 pb-16 pt-12 md:px-10 md:pb-24 md:pt-20 lg:grid-cols-[1fr_380px] lg:items-start'>
                <div>
                    <p className='eyebrow mb-6 flex items-center gap-2 text-warm'>
                        <svg
                            aria-hidden='true'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='1.9'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            className='h-4 w-4 shrink-0'
                        >
                            <path d='M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' />
                            <circle cx='12' cy='10' r='3' />
                        </svg>
                        {location}
                    </p>

                    {/* The greeting is what a visitor sees; the name is what a
                        screen reader and a crawler get. Each audience is served
                        the thing that helps it.

                        Hiding the greeting from assistive tech is the point, not
                        a side effect: "\m/" is a pair of metal horns to the eye
                        and unreadable noise read aloud. Leaving the heading as
                        the greeting alone would tell a screen-reader user
                        nothing about whose page they had landed on. */}
                    <h1 className='max-w-[18ch] text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl'>
                        {
                            greeting
                                ? <>
                                    <span aria-hidden='true'>{greeting}</span>
                                    <span className='sr-only'>{headline}</span>
                                </>
                                : headline
                        }
                    </h1>

                    {
                        paragraphs.map((paragraph: string, index: number) => {
                            return (
                                <p
                                    key={index}
                                    className={
                                        'mt-5 max-w-xl leading-relaxed ' +
                                        (index === 0 ? 'text-base text-fg/90 md:text-lg' : 'text-base text-muted')
                                    }
                                >
                                    <RichText text={paragraph} />
                                </p>
                            );
                        })
                    }

                    <div className='mt-8 flex flex-wrap gap-3'>
                        {
                            ctas.map(({ label, href, variant }: CallToAction) => {
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={variant === 'primary' ? 'btn-primary' : 'btn-secondary'}
                                    >
                                        {label}
                                    </Link>
                                );
                            })
                        }
                    </div>
                </div>

                <div className='flex flex-col gap-4 lg:sticky lg:top-24'>
                    <ContentImage
                        src={image}
                        alt={imageAlt}
                        width={760}
                        height={1013}
                        priority={true}
                        sizes='(min-width: 1024px) 380px, (min-width: 640px) 60vw, 90vw'
                        className='aspect-[3/4] w-full rounded-3xl border border-line object-cover'
                    />

                    {
                        certification &&
                        <CertificationCard {...certification} />
                    }
                </div>
            </div>
        </div>
    );
}

export default Hero;
