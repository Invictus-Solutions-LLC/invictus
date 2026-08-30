import React from 'react';

// The mark is inlined rather than served from /invictus-white.svg so it
// inherits currentColor and flips with the theme. A flat white file would
// disappear against the light palette.
//
// Decorative by design: every place it appears either sits inside a labelled
// link or beside visible text, so announcing it too would only be repetition.
function Logo({ className = 'h-6 w-6' }: { className?: string }) {
    return (
        <svg
            viewBox='0 0 240 240'
            preserveAspectRatio='xMidYMid meet'
            className={className}
            aria-hidden='true'
            focusable='false'
        >
            <g
                transform='translate(0,240) scale(0.1,-0.1)'
                fill='currentColor'
                stroke='none'
            >
                <path d='M1211 2235 c-140 -80 -260 -145 -267 -145 -12 0 -14 -172 -14 -1040 l0 -1041 43 25 c337 193 469 266 482 266 13 0 15 114 15 1040 0 572 -1 1040 -2 1040 -2 0 -117 -66 -257 -145z' />
            </g>
        </svg>
    );
}

export default Logo;
