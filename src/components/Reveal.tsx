import React, { useEffect, useRef } from 'react';

// Sections fade and rise as they scroll into view.
//
// Progressive enhancement on purpose: the element ships visible, and the hidden
// starting state only applies under the `js` class the pre-paint script adds.
// The previous implementation server-rendered `opacity: 0` and relied on
// JavaScript to undo it, which left 23 elements permanently invisible for
// anyone with scripting off.
//
// Reduced motion is handled in CSS, so nothing here needs to check for it.
function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) {
            return;
        }

        // No IntersectionObserver (very old browsers, some test environments):
        // show the content rather than leaving it hidden.
        if (typeof IntersectionObserver !== 'function') {
            element.classList.add('is-revealed');
            return;
        }

        const reveal = () => element.classList.add('is-revealed');

        // Focus needs the content now, not at the end of a 550ms fade — a
        // keyboard user tabbing quickly would otherwise be looking at a link
        // that is still mostly transparent.
        const revealInstantly = () => {
            element.classList.add('reveal-instant', 'is-revealed');
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    reveal();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        // Tabbing moves focus before the observer has a chance to fire, so a
        // keyboard user would otherwise land on links sitting at opacity 0 —
        // focused, operable, and completely invisible (WCAG 2.4.7).
        element.addEventListener('focusin', revealInstantly);

        observer.observe(element);
        return () => {
            observer.disconnect();
            element.removeEventListener('focusin', revealInstantly);
        };
    }, []);

    return (
        <div
            ref={ref}
            className={`reveal ${className}`}
        >
            {children}
        </div>
    );
}

export default Reveal;
