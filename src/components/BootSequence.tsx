import React, { useEffect, useRef, useState } from 'react';

export const BOOT_LINES = [
    '[    0.000042] invictus bios v8.0.8 — power-on self test... ok',
    '[    0.104217] cpu0: hacker mode enabled',
    '[    0.238551] mounting /dev/portfolio... ok',
    '[    0.312907] loading modules: next react tailwind',
    '[    0.487114] decrypting payload... done',
    '[  OK  ] started invictus808.service',
    '[  OK  ] started matrix-rain.daemon',
    '[  OK  ] reached target graphical interface',
    '[    0.842013] incoming connection from guest... accepted',
];

export const LINE_INTERVAL_MS = 280;
export const HOLD_MS = 1600;
export const FADE_MS = 500;
const STORAGE_KEY = 'invictus-boot-shown';

// Fake kernel boot log shown once per browser session before the site appears.
// Skippable with any key/click; skipped entirely for reduced-motion users.
//
// The overlay is part of the server-rendered HTML (initial phase 'boot') so it
// covers the page from the very first paint — otherwise the hero flashes for
// the moment between first paint and hydration. Returning sessions get one
// frame of black removed post-hydration instead, which reads as a blink.
function BootSequence() {
    const [phase, setPhase] = useState<'boot' | 'running' | 'fading' | 'hidden'>('boot');
    const [lineCount, setLineCount] = useState(0);
    const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

    useEffect(() => {
        try {
            if (sessionStorage.getItem(STORAGE_KEY)) {
                setPhase('hidden');
                return;
            }
            sessionStorage.setItem(STORAGE_KEY, '1');
        } catch {
            // Storage unavailable (private mode restrictions) — boot anyway.
        }

        if (typeof window.matchMedia === 'function'
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setPhase('hidden');
            return;
        }

        setPhase('running');

        const finish = () => {
            setLineCount(BOOT_LINES.length);
            setPhase('fading');
            timers.current.push(setTimeout(() => setPhase('hidden'), FADE_MS));
        };

        BOOT_LINES.forEach((_, index) => {
            timers.current.push(setTimeout(() => setLineCount(index + 1), (index + 1) * LINE_INTERVAL_MS));
        });
        timers.current.push(setTimeout(finish, BOOT_LINES.length * LINE_INTERVAL_MS + HOLD_MS));

        const skip = () => {
            timers.current.forEach(clearTimeout);
            timers.current = [];
            finish();
        };
        window.addEventListener('keydown', skip, { once: true });
        window.addEventListener('pointerdown', skip, { once: true });

        return () => {
            timers.current.forEach(clearTimeout);
            window.removeEventListener('keydown', skip);
            window.removeEventListener('pointerdown', skip);
        };
    }, []);

    if (phase === 'hidden') {
        return null;
    }

    return (
        <div
            id='boot-sequence'
            role='status'
            aria-label='Boot sequence'
            className={`fixed inset-0 z-[999] flex flex-col justify-center bg-[#0a0a0a] px-6 md:px-16 font-mono text-xs md:text-sm transition-opacity duration-500 ${phase === 'fading' ? 'opacity-0' : 'opacity-100'}`}
        >
            <div>
                {
                    BOOT_LINES.slice(0, lineCount).map((line, index) => {
                        return (
                            <p
                                key={index}
                                className={line.startsWith('[  OK  ]') ? 'text-terminal-green' : 'text-gray-400'}
                            >
                                {line}
                            </p>
                        );
                    })
                }
            </div>

            <p
                className='absolute bottom-6 right-6 text-gray-600'
            >
                press any key to skip
            </p>
        </div>
    );
}

export default BootSequence;
