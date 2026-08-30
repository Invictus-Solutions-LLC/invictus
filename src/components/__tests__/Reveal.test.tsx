import { render, screen } from '@testing-library/react';
import Reveal from '@/components/Reveal';

describe('Reveal', () => {
    // The hidden starting state lives in CSS scoped to `.js`. Server-rendering
    // opacity: 0 — as the previous implementation did — left the content
    // permanently invisible for anyone with scripting off.
    it('never renders an inline hidden state', () => {
        const { container } = render(<Reveal><p>content</p></Reveal>);

        const wrapper = container.firstElementChild as HTMLElement;
        expect(wrapper.getAttribute('style')).toBeNull();
        expect(wrapper).toHaveClass('reveal');
        expect(screen.getByText('content')).toBeInTheDocument();
    });

    it('reveals the element once it scrolls into view', () => {
        const { container } = render(<Reveal><p>content</p></Reveal>);

        expect(container.firstElementChild).toHaveClass('is-revealed');
    });

    // Tabbing moves focus before the observer fires, so without this a keyboard
    // user lands on links at opacity 0 — focused, operable and invisible.
    it('reveals immediately when something inside it receives focus', () => {
        // An observer that never fires, so focus is the only thing that can reveal.
        const original = global.IntersectionObserver;
        global.IntersectionObserver = class {
            observe = jest.fn();
            unobserve = jest.fn();
            disconnect = jest.fn();
            takeRecords = jest.fn(() => []);
            root = null;
            rootMargin = '';
            thresholds = [];
        } as unknown as typeof IntersectionObserver;

        const { container } = render(<Reveal><a href='#x'>a link</a></Reveal>);
        expect(container.firstElementChild).not.toHaveClass('is-revealed');

        screen.getByRole('link').focus();
        expect(container.firstElementChild).toHaveClass('is-revealed');
        // ...and without the fade, so it is readable the instant focus lands.
        expect(container.firstElementChild).toHaveClass('reveal-instant');

        global.IntersectionObserver = original;
    });

    it('keeps any className it was given', () => {
        const { container } = render(<Reveal className='mt-4'><p>content</p></Reveal>);

        expect(container.firstElementChild).toHaveClass('mt-4');
    });

    // Rather than leaving the content hidden forever.
    it('shows the content when IntersectionObserver is unavailable', () => {
        const original = global.IntersectionObserver;
        // @ts-expect-error deliberately removing the API for this test
        delete global.IntersectionObserver;

        const { container } = render(<Reveal><p>content</p></Reveal>);
        expect(container.firstElementChild).toHaveClass('is-revealed');

        global.IntersectionObserver = original;
    });
});
