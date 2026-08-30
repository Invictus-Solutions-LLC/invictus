import React from 'react';
import Section from '@/components/Section';
import Reveal from '@/components/Reveal';
import CertificationCard from '@/components/CertificationCard';
import SkillChip from '@/components/SkillChip';

// Category artwork is chrome, so it lives here rather than in the content
// files. An unrecognised category still renders — it just gets the default mark.
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    languages: <><path d='m8 6-6 6 6 6' /><path d='m16 6 6 6-6 6' /></>,
    web: <><rect x='3' y='3' width='18' height='18' rx='2' /><path d='M3 9h18' /></>,
    infrastructure: <><path d='M3 7h18M3 12h18M3 17h18' /></>,
    security: <><path d='M12 2 4 6v6c0 5 3.4 9.1 8 10 4.6-.9 8-5 8-10V6z' /></>,
};

const DEFAULT_ICON = <circle cx='12' cy='12' r='9' />;

function Skills({ header, intro, categories, skills, certifications = [] }: SkillsProps) {
    // Grouping by what a skill is *for* answers the question a visitor actually
    // has ("can you do the thing I need?") without inviting the one nobody
    // benefits from ("why is Bash only 10%?").
    const grouped = categories
        .map((category: SkillCategory) => {
            return {
                ...category,
                members: skills.filter((skill: Skill) => skill.category === category.id),
            };
        })
        .filter((category) => category.members.length > 0);

    // Anything whose category isn't declared would silently vanish otherwise.
    const known = new Set(categories.map((category: SkillCategory) => category.id));
    const ungrouped = skills.filter((skill: Skill) => !known.has(skill.category));

    return (
        <Section
            id='skills'
            header={header}
            intro={intro}
        >
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                {
                    grouped.map(({ id, label, members }) => {
                        return (
                            <Reveal key={id}>
                                <div className='card card-interactive flex h-full flex-col gap-4 p-6'>
                                    <h3 className='flex items-center gap-2.5 text-base font-semibold'>
                                        <svg
                                            aria-hidden='true'
                                            viewBox='0 0 24 24'
                                            fill='none'
                                            stroke='currentColor'
                                            strokeWidth='1.9'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            className='h-5 w-5 text-shell-accent'
                                        >
                                            {CATEGORY_ICONS[id] ?? DEFAULT_ICON}
                                        </svg>
                                        {label}
                                    </h3>

                                    <ul className='flex flex-wrap gap-1.5'>
                                        {
                                            members.map((skill: Skill) => {
                                                return (
                                                    <SkillChip
                                                        key={skill.name}
                                                        {...skill}
                                                    />
                                                );
                                            })
                                        }
                                    </ul>
                                </div>
                            </Reveal>
                        );
                    })
                }
            </div>

            {
                ungrouped.length > 0 &&
                <Reveal className='mt-4'>
                    <div className='card flex flex-col gap-4 p-6'>
                        <h3 className='text-base font-semibold'>
                            Also work with
                        </h3>
                        <ul className='flex flex-wrap gap-1.5'>
                            {
                                ungrouped.map((skill: Skill) => {
                                    return (
                                        <SkillChip
                                            key={skill.name}
                                            {...skill}
                                        />
                                    );
                                })
                            }
                        </ul>
                    </div>
                </Reveal>
            }

            {
                certifications.length > 0 &&
                <Reveal className='mt-4'>
                    <ul className='grid gap-4 sm:grid-cols-2'>
                        {
                            certifications.map((certification: Certification) => {
                                return (
                                    <li key={certification.name}>
                                        <CertificationCard {...certification} />
                                    </li>
                                );
                            })
                        }
                    </ul>
                </Reveal>
            }
        </Section>
    );
}

export default Skills;
