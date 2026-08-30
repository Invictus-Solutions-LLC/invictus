import React from 'react';
import Section from '@/components/Section';
import Reveal from '@/components/Reveal';

// Colour-only hover feedback on purpose: these steps aren't clickable, so they
// must not lift like the cards do and imply that they are.
function Process({ header, intro, steps }: ProcessProps) {
    return (
        <Section
            id='process'
            header={header}
            intro={intro}
        >
            {/* One Reveal around the whole list: an <ol> may only contain <li>,
                and a per-step wrapper would put a <div> in between. */}
            <Reveal>
                <ol className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                    {
                        steps.map((step: ProcessStep, index: number) => {
                            return (
                                <li
                                    key={step.title}
                                    className='process-step group/step h-full list-none'
                                >
                                    <span className='block font-mono text-xs text-muted transition-colors duration-200 group-hover/step:text-accent'>
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <h3 className='mt-2.5 text-lg font-semibold leading-snug'>
                                        {step.title}
                                    </h3>
                                    <p className='mt-2 text-sm leading-relaxed text-muted'>
                                        {step.text}
                                    </p>
                                </li>
                            );
                        })
                    }
                </ol>
            </Reveal>
        </Section>
    );
}

export default Process;
