import React from 'react';
import Reveal from '@/components/Reveal';

type Props = {
    id: string;
    header: string;
    intro?: string;
    children: React.ReactNode;
    className?: string;
};

// One wrapper so every section shares the same rhythm, max width and heading
// structure. Each gets an <h2> tied to the region by aria-labelledby, which is
// what lets a screen reader list the page's sections by name.
function Section({ id, header, intro, children, className = '' }: Props) {
    const headingId = `${id}-heading`;

    return (
        <section
            id={id}
            aria-labelledby={headingId}
            className={`mx-auto w-full max-w-6xl px-6 py-16 md:px-10 md:py-24 ${className}`}
        >
            <Reveal className='mb-10 md:mb-12'>
                <h2
                    id={headingId}
                    className='text-3xl font-semibold tracking-tight md:text-4xl'
                >
                    {header}
                </h2>
                {
                    intro &&
                    <p className='mt-3 max-w-xl text-base leading-relaxed text-muted md:text-lg'>
                        {intro}
                    </p>
                }
            </Reveal>

            {children}
        </section>
    );
}

export default Section;
