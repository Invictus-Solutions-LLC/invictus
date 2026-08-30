import React from 'react';
import Section from '@/components/Section';
import Reveal from '@/components/Reveal';
import ProjectCard from '@/components/ProjectCard';

function Work({ header, intro, projects }: ProjectsProps) {
    return (
        <Section
            id='work'
            header={header}
            intro={intro}
        >
            <div className='flex flex-col gap-5'>
                {
                    projects.map((project: Project) => {
                        return (
                            <Reveal key={project.name}>
                                <ProjectCard {...project} />
                            </Reveal>
                        );
                    })
                }
            </div>
        </Section>
    );
}

export default Work;
