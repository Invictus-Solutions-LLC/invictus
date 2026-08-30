import React from 'react';
import Section from '@/components/Section';
import Reveal from '@/components/Reveal';
import ExperienceCard from '@/components/ExperienceCard';

function Experience({ header, intro, experiences }: ExperienceProps) {
    return (
        <Section
            id='experience'
            header={header}
            intro={intro}
        >
            <div className='flex flex-col gap-5'>
                {
                    experiences.map((experience: Experience) => {
                        return (
                            <Reveal key={`${experience.company}-${experience.title}-${experience.start}`}>
                                <ExperienceCard {...experience} />
                            </Reveal>
                        );
                    })
                }
            </div>
        </Section>
    );
}

export default Experience;
