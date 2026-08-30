import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '@/components/Header';

const props = {
    ctaLabel: 'Get in touch',
    askLabel: 'Ask anything',
    onOpenPalette: jest.fn(),
};

describe('Header', () => {
    beforeEach(() => {
        props.onOpenPalette.mockClear();
    });

    it('names the palette trigger for assistive technology', () => {
        render(<Header {...props} />);

        expect(screen.getByRole('button', { name: /open search and navigation/i })).toBeInTheDocument();
    });

    it('opens the palette when the trigger is activated', async () => {
        const user = userEvent.setup();
        render(<Header {...props} />);

        await user.click(screen.getByRole('button', { name: /open search and navigation/i }));

        expect(props.onOpenPalette).toHaveBeenCalledTimes(1);
    });

    // The palette doubles as small-screen navigation, so its trigger has to read
    // as "search" without a keyboard. "⌘K" names a key combination a phone does
    // not have: it may only appear alongside the written label, never alone.
    it('shows a magnifier at every width and the shortcut glyph only on wide ones', () => {
        const { container } = render(<Header {...props} />);
        const trigger = screen.getByRole('button', { name: /open search and navigation/i });

        const icon = trigger.querySelector('svg');
        expect(icon).not.toBeNull();
        expect(icon?.getAttribute('class')).not.toMatch(/hidden/);

        const shortcut = [...trigger.querySelectorAll('span')]
            .find((span) => { return span.textContent === '⌘K'; });
        expect(shortcut?.getAttribute('class')).toMatch(/\bhidden\b/);
        expect(shortcut?.getAttribute('class')).toMatch(/\blg:inline\b/);

        expect(container).toBeTruthy();
    });

    // The contact link is the site's conversion path; a phone-width header that
    // hides it leaves nothing in the bar a visitor can act on.
    it('keeps the contact call to action visible at every width', () => {
        render(<Header {...props} />);
        const cta = screen.getByRole('link', { name: props.ctaLabel });

        expect(cta).toHaveAttribute('href', '#contact');
        expect(cta.getAttribute('class')).not.toMatch(/\bhidden\b/);
    });
});
