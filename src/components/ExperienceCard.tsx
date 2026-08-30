import React from 'react';
import ContentImage from '@/components/ContentImage';
import SkillChip from '@/components/SkillChip';

function ExperienceCard({ title, company, logo, start, end, technologies, description }: Experience) {
    return (
        <article className='card card-interactive p-6 md:p-8'>
            <div className='flex items-start gap-4'>
                <span className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-shell-line/60 p-2'>
                    <ContentImage
                        src={logo}
                        alt=''
                        width={96}
                        height={96}
                        sizes='48px'
                        className='h-full w-full object-contain'
                    />
                </span>

                <div className='min-w-0'>
                    <h3 className='text-lg font-semibold leading-snug md:text-xl'>
                        {title}
                    </h3>
                    <p className='mt-1 text-sm text-shell-muted'>
                        {company}
                    </p>
                    <p className='mt-1 font-mono text-xs text-shell-muted'>
                        {`${start} – ${end}`}
                    </p>
                </div>
            </div>

            {
                technologies.length > 0 &&
                <ul className='mt-5 flex flex-wrap gap-1.5'>
                    {
                        technologies.map((technology: Technology) => {
                            return (
                                <SkillChip
                                    key={technology.name}
                                    {...technology}
                                />
                            );
                        })
                    }
                </ul>
            }

            <ul className='mt-5 flex flex-col gap-2.5'>
                {
                    description.map((note: string, index: number) => {
                        return (
                            <li
                                key={index}
                                className='relative pl-5 text-[15px] leading-relaxed text-shell-muted'
                            >
                                <span
                                    aria-hidden='true'
                                    className='absolute left-0 top-[0.6em] h-1.5 w-1.5 rounded-full bg-shell-accent'
                                />
                                {note}
                            </li>
                        );
                    })
                }
            </ul>
        </article>
    );
}

export default ExperienceCard;
