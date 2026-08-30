import React from 'react';
import ContentImage from '@/components/ContentImage';

// The card leads with the project's own name and lets the author's description
// do the explaining — every one of them opens by saying what the thing is, so a
// separate headline only restated the first sentence in weaker words.
function ProjectCard({ name, image, url, description }: Project) {
    return (
        <article className='card card-interactive group grid overflow-hidden sm:grid-cols-[240px_1fr]'>
            {/* Every project image is a square 1024x1024 mark, so the panel lets
                it fill edge to edge rather than floating small in the middle.
                object-contain keeps it uncropped whatever shape it really is. */}
            <div className='card-shot aspect-square bg-gradient-to-br from-[#103A48] to-[#0A2029] sm:aspect-auto'>
                <ContentImage
                    src={image}
                    alt=''
                    width={512}
                    height={512}
                    sizes='(min-width: 640px) 240px, 100vw'
                    className='h-full w-full object-contain'
                />
            </div>

            <div className='flex flex-col p-6 sm:p-7'>
                <h3 className='text-xl font-semibold leading-snug'>
                    {name}
                </h3>

                <p className='mt-3 text-[15px] leading-relaxed text-shell-muted'>
                    {description}
                </p>

                <a
                    href={url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='mt-5 inline-flex w-fit items-center gap-1.5 font-mono text-xs font-medium text-shell-accent hover:underline'
                >
                    {`Visit ${name}`}
                    <span
                        aria-hidden='true'
                        className='card-arrow'
                    >
                        →
                    </span>
                </a>
            </div>
        </article>
    );
}

export default ProjectCard;
