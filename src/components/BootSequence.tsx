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

// Re-attach (repeat page loads within a session): a quick tmux-style
// reconnect with a text progress bar instead of the full boot log.
export const REATTACH_BAR_CELLS = 16;
export const REATTACH_TICK_MS = 45;
export const REATTACH_HOLD_MS = 350;

// Reduced-motion holds: the fully-rendered screen shows as one static frame,
// then cuts (no tweens, no line-by-line typing, no bar fill, no fade).
export const REDUCED_BOOT_HOLD_MS = 2200;
export const REDUCED_REATTACH_HOLD_MS = 1000;

const STORAGE_KEY = 'invictus-boot-shown';

// Full-screen terminal overlay covering every page load:
//  - fresh session: fake kernel boot log (once), then fades
//  - repeat loads: quick "reconnecting to session..." progress bar
// Both are skippable with any key/click. Reduced-motion users get a static
// variant: the finished screen appears instantly, holds, then cuts — the
// theme survives, the motion doesn't.
//
// The overlay is part of the server-rendered HTML (initial phase 'covering')
// so it hides the page from the very first paint — otherwise the hero flashes
// in the gap between first paint and hydration.
function BootSequence() {
    const [phase, setPhase] = useState<'covering' | 'boot' | 'reattach' | 'fading' | 'hidden'>('covering');
    const [lineCount, setLineCount] = useState(0);
    const [progress, setProgress] = useState(0);
    const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

    useEffect(() => {
        let mode: 'boot' | 'reattach' = 'boot';
        try {
            if (sessionStorage.getItem(STORAGE_KEY)) {
                mode = 'reattach';
            } else {
                sessionStorage.setItem(STORAGE_KEY, '1');
            }
        } catch {
            // Storage unavailable (private mode restrictions) — boot anyway.
        }

        const reducedMotion = typeof window.matchMedia === 'function'
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        setPhase(mode);

        // finish() is reachable from the natural timer, a keydown, AND a
        // pointerdown — it must run exactly once, and both skip listeners
        // must die together, or the surviving one resurrects the fading
        // overlay and swallows the user's next input.
        let finished = false;

        const skip = () => {
            timers.current.forEach(clearTimeout);
            timers.current = [];
            finish();
        };

        const removeSkipListeners = () => {
            window.removeEventListener('keydown', skip);
            window.removeEventListener('pointerdown', skip);
        };

        const finish = () => {
            if (finished) {
                return;
            }
            finished = true;
            removeSkipListeners();
            if (mode === 'boot') {
                setLineCount(BOOT_LINES.length);
            } else {
                setProgress(REATTACH_BAR_CELLS);
            }
            if (reducedMotion) {
                // Instant cut — an opacity tween is still motion.
                setPhase('hidden');
                return;
            }
            setPhase('fading');
            timers.current.push(setTimeout(() => setPhase('hidden'), FADE_MS));
        };

        if (reducedMotion) {
            // Static variant: the completed screen as a single frame.
            if (mode === 'boot') {
                setLineCount(BOOT_LINES.length);
            } else {
                setProgress(REATTACH_BAR_CELLS);
            }
            timers.current.push(setTimeout(
                finish,
                mode === 'boot' ? REDUCED_BOOT_HOLD_MS : REDUCED_REATTACH_HOLD_MS
            ));
        } else if (mode === 'boot') {
            BOOT_LINES.forEach((_, index) => {
                timers.current.push(setTimeout(() => setLineCount(index + 1), (index + 1) * LINE_INTERVAL_MS));
            });
            timers.current.push(setTimeout(finish, BOOT_LINES.length * LINE_INTERVAL_MS + HOLD_MS));
        } else {
            for (let step = 1; step <= REATTACH_BAR_CELLS; step += 1) {
                timers.current.push(setTimeout(() => setProgress(step), step * REATTACH_TICK_MS));
            }
            timers.current.push(setTimeout(finish, REATTACH_BAR_CELLS * REATTACH_TICK_MS + REATTACH_HOLD_MS));
        }

        window.addEventListener('keydown', skip);
        window.addEventListener('pointerdown', skip);

        return () => {
            timers.current.forEach(clearTimeout);
            removeSkipListeners();
        };
    }, []);

    if (phase === 'hidden') {
        return null;
    }

    const attached = progress >= REATTACH_BAR_CELLS;
    const bar = '▓'.repeat(progress) + '░'.repeat(REATTACH_BAR_CELLS - progress);
    const percent = Math.round((progress / REATTACH_BAR_CELLS) * 100);

    return (
        <div
            id='boot-sequence'
            role='status'
            aria-label={phase === 'reattach' || (phase === 'fading' && progress > 0) ? 'Reconnecting' : 'Boot sequence'}
            className={`fixed inset-0 z-[999] flex flex-col justify-center bg-[#0a0a0a] px-6 md:px-16 font-mono text-xs md:text-sm transition-opacity duration-500 ${phase === 'fading' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
            {
                phase === 'reattach' || (phase === 'fading' && progress > 0) ?
                    <div>
                        <p
                            className='text-gray-400'
                        >
                            reconnecting to session
                            <span
                                className='text-[#FF0000]/80'
                            >
                                {' invictus808'}
                            </span>
                            ...
                        </p>
                        <p
                            className='text-gray-400'
                        >
                            {`[${bar}] ${percent}%`}
                        </p>
                        {
                            attached &&
                            <p
                                className='text-terminal-green'
                            >
                                attached.
                            </p>
                        }
                    </div>
                    :
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
            }

            <p
                className='absolute bottom-6 right-6 text-gray-600'
            >
                press any key to skip
            </p>
        </div>
    );
}

export default BootSequence;
