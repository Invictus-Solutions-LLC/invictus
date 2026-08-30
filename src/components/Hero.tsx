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

            <div className='relative mx-auto grid max-w-6xl gap-x-12 gap-y-10 px-6 pb-16 pt-12 md:px-10
                            md:pb-24 md:pt-20 lg:grid-cols-[1fr_380px] lg:items-start lg:gap-y-0'>
                {/* Heading block. Split from the prose so that the portrait can
                    fall between them once the two columns stack. */}
                <div className='order-1 lg:order-none'>
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
                </div>

                {/* Second on a stacked layout, so a visitor meets the person
                    before reading four paragraphs about him — on a phone the
                    portrait previously sat below the prose AND both calls to
                    action, about 1,100px down. On lg it returns to the right
                    column and spans both rows, unchanged. */}
                <div className='order-2 flex w-full max-w-sm flex-col gap-4 lg:order-none lg:max-w-none
                                lg:row-span-2 lg:sticky lg:top-24'>
                    <ContentImage
                        src={image}
                        alt={imageAlt}
                        width={760}
                        height={1013}
                        priority={true}
                        sizes='(min-width: 1024px) 380px, (min-width: 448px) 384px, 90vw'
                        className='aspect-[3/4] w-full rounded-3xl border border-line object-cover'
                    />

                    {
                        certification &&
                        <CertificationCard {...certification} />
                    }
                </div>

                <div className='order-3 lg:order-none'>
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
            </div>
        </div>
    );
}

export default Hero;
