import { useEffect, useRef } from 'react';

// For cards in a horizontally-snapping carousel (Experience, Projects) that
// also scroll vertically on their own: once a card is swiped away from,
// reset its scroll position so it doesn't come back mid-scroll next time.
export function useResetScrollOnLeave<T extends HTMLElement>(threshold = 0.5) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el || !el.parentElement) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) {
                    el.scrollTop = 0;
                }
            },
            { root: el.parentElement, threshold }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    return ref;
}
