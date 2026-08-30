import { useEffect, useState, useSyncExternalStore } from 'react';

const TYPE_MS = 22;
// A short beat before the first character, so the response reads as a shell
// accepting the command rather than as text that was already there. Deliberately
// not long enough to feel like waiting — and deliberately not the palette's real
// "asking" state, which means a model is genuinely being consulted.
const START_DELAY_MS = 300;

function subscribeToMotion(listener: () => void): () => void {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    query.addEventListener('change', listener);
    return () => { return query.removeEventListener('change', listener); };
}

// Reveals `text` one character at a time. Returns the visible slice and whether
// it has finished, so a caller can hold a cursor until the line lands.
//
// Callers must render the complete string to assistive technology separately:
// animating text inside a live region makes a screen reader announce it once per
// character. Reduced motion skips the animation entirely — the words are the
// content, the typing is decoration.
export function useTypewriter(text: string): { typed: string; done: boolean } {
    const reduced = useSyncExternalStore(
        subscribeToMotion,
        () => { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; },
        () => { return false; },
    );

    const [progress, setProgress] = useState({ text, chars: 0 });

    // Reset during render when the target changes, rather than from inside the
    // effect. Resetting in an effect renders the old text once before clearing
    // it, which shows the previous reply for a frame.
    if (progress.text !== text) {
        setProgress({ text, chars: 0 });
    }

    useEffect(() => {
        if (!text || reduced) {
            return;
        }

        let timer: ReturnType<typeof setTimeout>;
        let shown = 0;

        const tick = () => {
            shown += 1;
            setProgress({ text, chars: shown });
            if (shown < text.length) {
                timer = setTimeout(tick, TYPE_MS);
            }
        };

        timer = setTimeout(tick, START_DELAY_MS);
        return () => { return clearTimeout(timer); };
    }, [text, reduced]);

    if (reduced) {
        return { typed: text, done: true };
    }

    const chars = progress.text === text ? progress.chars : 0;
    return { typed: text.slice(0, chars), done: chars >= text.length };
}
