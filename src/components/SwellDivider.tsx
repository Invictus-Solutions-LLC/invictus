import React from 'react';

// One wavelength is 180px. The path is drawn 14 segments wide (1260px) and
// translated by exactly 180px, so the loop returns to an identical position
// and the seam is invisible.
const WAVE = `M0 13c45 0 45-9 90-9s45 9 90 9${' 45-9 90-9 45 9 90 9'.repeat(6)}`;

// A flowing hairline in place of a straight rule between sections.
function SwellDivider({ className = '' }: { className?: string }) {
    return (
        <div
            aria-hidden='true'
            className={`h-[26px] overflow-hidden ${className}`}
        >
            <svg
                width='1260'
                height='26'
                viewBox='0 0 1260 26'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.4'
                className='block text-line animate-drift motion-reduce:animate-none'
            >
                <path d={WAVE} />
            </svg>
        </div>
    );
}

export default SwellDivider;
