import React from 'react';
import Section from '@/components/Section';
import Reveal from '@/components/Reveal';

// The one section designed to change. It exists so work in progress has a
// truthful home — an empty slot marked "in progress" costs nothing, where an
// invented one costs the client who asks a follow-up question.
function Lab({ header, intro, entries }: LabProps) {
    if (entries.length === 0) {
        return null;
    }

    return (
        <Section
            id='lab'
            header={header}
            intro={intro}
        >
            {/* The section is meant to grow. With one or two entries a fixed
                three-column grid leaves a conspicuous gap, so the track count
                follows the content. */}
            <div
                className={
                    'grid gap-4 ' +
                    (entries.length === 1
                        ? 'max-w-xl'
                        : entries.length === 2
                            ? 'sm:grid-cols-2'
                            : 'sm:grid-cols-2 lg:grid-cols-3')
                }
            >
                {
                    entries.map((entry: LabEntry) => {
                        const live = entry.status === 'live';

                        return (
                            <Reveal key={entry.title}>
                                <article className='card card-interactive group flex h-full flex-col gap-3 p-6'>
                                    <p
                                        className={
                                            'eyebrow w-fit rounded-full px-2.5 py-1 text-[10px] ' +
                                            (live
                                                ? 'bg-shell-accent/10 text-shell-accent'
                                                : 'bg-warm/15 text-warm')
                                        }
                                    >
                                        {entry.statusLabel}
                                    </p>

                                    <h3 className='text-lg font-semibold leading-snug'>
                                        {entry.title}
                                    </h3>

                                    <p className='text-sm leading-relaxed text-shell-muted'>
                                        {entry.text}
                                    </p>

                                    {
                                        entry.href &&
                                        <a
                                            href={entry.href}
                                            className='mt-auto inline-flex w-fit items-center gap-1.5 pt-1 font-mono text-xs font-medium text-shell-accent hover:underline'
                                        >
                                            Take a look
                                            <span
                                                aria-hidden='true'
                                                className='card-arrow'
                                            >
                                                →
                                            </span>
                                        </a>
                                    }
                                </article>
                            </Reveal>
                        );
                    })
                }
            </div>
        </Section>
    );
}

export default Lab;
