import React from 'react';

// Island elevation rings. Negative delays start each ring mid-cycle so the
// swell reads as travelling outward from the summit rather than every ring
// pulsing in unison.
const CONTOURS: Array<{ d: string; delay: string }> = [
    { d: 'M360 450c0-72 72-131 190-131s190 59 190 131-72 131-190 131-190-59-190-131z', delay: '0s' },
    { d: 'M300 450c0-110 110-200 250-200s250 90 250 200-110 200-250 200-250-90-250-200z', delay: '-0.9s' },
    { d: 'M240 450c0-145 145-262 310-262s310 117 310 262-145 262-310 262-310-117-310-262z', delay: '-1.8s' },
    { d: 'M180 450c0-180 180-325 370-325s370 145 370 325-180 325-370 325-370-145-370-325z', delay: '-2.7s' },
    { d: 'M120 450c0-215 215-388 430-388s430 173 430 388-215 388-430 388-430-173-430-388z', delay: '-3.6s' },
    { d: 'M60 450c0-250 250-450 490-450s490 200 490 450-250 450-490 450S60 700 60 450z', delay: '-4.5s' },
];

// The two ambient layers behind the hero: a slow-drifting glow standing in for
// water light, and topographic contours standing in for the island itself.
//
// Both animate transform and opacity only, so they stay on the compositor and
// never trigger layout — roughly two kilobytes against the several megabytes a
// video hero would have cost. aria-hidden throughout: this is texture, and a
// screen reader announcing it would be pure noise.
function Ambient() {
    return (
        <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-0 overflow-hidden'
        >
            <div
                className='absolute -top-40 -right-48 h-[780px] w-[920px] animate-caustic
                           motion-reduce:animate-none'
                style={{
                    background:
                        'radial-gradient(ellipse at center, rgb(var(--color-accent) / 0.11) 0%, rgb(var(--color-accent) / 0.045) 42%, rgb(var(--color-accent) / 0) 70%)',
                }}
            />

            <svg
                viewBox='0 0 1200 900'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.2'
                className='absolute -top-32 -right-64 w-[1200px] text-accent opacity-[0.09]'
            >
                {
                    CONTOURS.map(({ d, delay }) => {
                        return (
                            <path
                                key={d}
                                d={d}
                                className='animate-swell motion-reduce:animate-none'
                                style={{
                                    animationDelay: delay,
                                    transformBox: 'fill-box',
                                    transformOrigin: 'center',
                                }}
                            />
                        );
                    })
                }
            </svg>
        </div>
    );
}

export default Ambient;
