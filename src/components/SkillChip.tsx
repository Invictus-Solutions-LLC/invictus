import React from 'react';
import ContentImage from '@/components/ContentImage';

// One chip shared by the skills grid and the technology list on each experience
// card, so a skill looks identical wherever it appears.
//
// The logo is decorative: the name sits right beside it as text, so an alt would
// only make a screen reader say it twice.
function SkillChip({ image, name }: Technology) {
    return (
        <li className='chip'>
            <ContentImage
                src={image}
                alt=''
                width={64}
                height={64}
                sizes='16px'
                className='h-4 w-4 shrink-0 object-contain'
            />
            {name}
        </li>
    );
}

export default SkillChip;
