import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

const TYPE_MS = 55;
const DELETE_MS = 28;
const HOLD_MS = 1900;
const GAP_MS = 320;

function subscribeToMotion(listener: () => void): () => void {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
}

// Cycles example questions through an input's placeholder, typing and deleting
// them. The point is to teach the affordance: the box accepts plain questions,
// which nothing else on the page says.
//
// Reduced motion gets the first example standing still — the information is the
// example itself, not the animation, so nothing is lost by not moving.
export function useTypedPlaceholder(examples: Array<string>, active: boolean): string {
    const reduced = useSyncExternalStore(
        subscribeToMotion,
        () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        () => false,
    );

    const first = examples[0] ?? '';
    const [text, setText] = useState(first);
    // Held in a ref so the timer chain reads the latest position without
    // re-subscribing on every character.
    const position = useRef({ index: 0, chars: first.length, deleting: true });

    useEffect(() => {
        if (!active || reduced || examples.length === 0) {
            return;
        }

        let timer: ReturnType<typeof setTimeout>;

        const tick = () => {
            const state = position.current;
            const full = examples[state.index % examples.length];

            if (state.deleting) {
                state.chars = Math.max(state.chars - 1, 0);
                setText(full.slice(0, state.chars));
                if (state.chars === 0) {
                    state.deleting = false;
                    state.index += 1;
                    timer = setTimeout(tick, GAP_MS);
                    return;
                }
                timer = setTimeout(tick, DELETE_MS);
                return;
            }

            state.chars += 1;
            setText(full.slice(0, state.chars));
            if (state.chars >= full.length) {
                state.deleting = true;
                timer = setTimeout(tick, HOLD_MS);
                return;
            }
            timer = setTimeout(tick, TYPE_MS);
        };

        timer = setTimeout(tick, HOLD_MS);
        return () => clearTimeout(timer);
    }, [active, reduced, examples]);

    if (reduced || !active) {
        return first;
    }
    return text;
}
