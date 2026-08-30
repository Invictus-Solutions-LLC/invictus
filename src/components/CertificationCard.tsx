import React from 'react';
import ContentImage from '@/components/ContentImage';

// Used by both the hero and the skills section so the credential is presented
// identically in both places — same badge, same wording, same affordance.
function CertificationCard({ name, image, url }: Certification) {
    return (
        <a
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            className='card card-interactive group flex h-full items-center gap-4 p-5'
        >
            <ContentImage
                src={image}
                alt=''
                width={160}
                height={160}
                sizes='64px'
                className='h-14 w-14 shrink-0 object-contain'
            />
            <span className='min-w-0'>
                <span className='block text-sm font-semibold leading-snug'>
                    {name}
                </span>
                <span className='mt-1 block font-mono text-[11px] text-shell-accent'>
                    Verify the credential
                    {' '}
                    <span
                        aria-hidden='true'
                        className='card-arrow'
                    >
                        →
                    </span>
                </span>
            </span>
        </a>
    );
}

export default CertificationCard;
