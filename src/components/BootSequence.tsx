import React, { useEffect, useRef, useState } from 'react';

export const LINE_INTERVAL_MS = 280;
export const HOLD_MS = 1600;
export const FADE_MS = 500;

// Re-attach (repeat page loads within a session): a quick tmux-style
// reconnect with a text progress bar instead of the full boot log.
export const REATTACH_BAR_CELLS = 16;
// 70ms rather than the original 45: at 45 the bar filled in 720ms, which is
// quick enough that it reads as having appeared already full. 70 gives a 1.1s
// fill — unmistakably a progress bar — against a 350ms hold once it lands.
export const REATTACH_TICK_MS = 70;
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
function BootSequence({ lines }: BootProps) {
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

        // SSR renders the 'covering' placeholder (hides the hero from first paint);
        // only here on the client can sessionStorage/matchMedia be read to pick boot
        // vs reattach, so this single transition must happen in the effect — doing it
        // during render would cause a hydration mismatch. The extra render is
        // intentional and the overlay is visually identical across it.
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
                setLineCount(lines.length);
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
                setLineCount(lines.length);
            } else {
                setProgress(REATTACH_BAR_CELLS);
            }
            timers.current.push(setTimeout(
                finish,
                mode === 'boot' ? REDUCED_BOOT_HOLD_MS : REDUCED_REATTACH_HOLD_MS
            ));
        } else if (mode === 'boot') {
            lines.forEach((_, index) => {
                timers.current.push(setTimeout(() => setLineCount(index + 1), (index + 1) * LINE_INTERVAL_MS));
            });
            timers.current.push(setTimeout(finish, lines.length * LINE_INTERVAL_MS + HOLD_MS));
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
    }, [lines]);

    if (phase === 'hidden') {
        return null;
    }

    const attached = progress >= REATTACH_BAR_CELLS;
    const bar = '▓'.repeat(progress) + '░'.repeat(REATTACH_BAR_CELLS - progress);
    const percent = Math.round((progress / REATTACH_BAR_CELLS) * 100);

    return (
        <div
            id='boot-sequence'
            // Decorative, and deliberately not a live region. role='status'
            // would announce every fake kernel line as it appeared, reading a
            // stream of invented boot output over whatever the visitor was
            // actually listening to — and "Boot sequence" means nothing to them.
            // The real page is fully rendered underneath and reachable the whole
            // time, so hiding the decoration costs a screen-reader user nothing.
            aria-hidden='true'
            className={`fixed inset-0 z-[999] flex flex-col justify-center bg-bg px-6 md:px-16 font-mono text-xs md:text-sm transition-opacity duration-500 ${phase === 'fading' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
            {
                phase === 'reattach' || (phase === 'fading' && progress > 0) ?
                    <div>
                        <p
                            className='text-muted'
                        >
                            reconnecting to session
                            <span
                                className='text-warm'
                            >
                                {' invictus808'}
                            </span>
                            ...
                        </p>
                        <p
                            className='text-muted'
                        >
                            {`[${bar}] ${percent}%`}
                        </p>
                        {
                            attached &&
                            <p
                                className='text-accent'
                            >
                                attached.
                            </p>
                        }
                    </div>
                    :
                    <div>
                        {
                            lines.slice(0, lineCount).map((line, index) => {
                                return (
                                    <p
                                        key={index}
                                        className={line.startsWith('[  OK  ]') ? 'text-accent' : 'text-muted'}
                                    >
                                        {line}
                                    </p>
                                );
                            })
                        }
                    </div>
            }

            <p
                className='absolute bottom-6 right-6 text-muted/60'
            >
                press any key to skip
            </p>
        </div>
    );
}

export default BootSequence;
