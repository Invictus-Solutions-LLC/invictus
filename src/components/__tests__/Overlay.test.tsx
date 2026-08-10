import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Overlay from '@/components/Overlay';

const socials = ['https://github.com/example', 'https://linkedin.com/in/example'];

function trigger() {
    return screen.getByRole('button', { name: /social links/i });
}

describe('Overlay social disclosure', () => {
    it('exposes its collapsed state and the panel it controls', () => {
        render(<Overlay socials={socials} />);

        expect(trigger()).toHaveAttribute('aria-expanded', 'false');
        expect(trigger()).toHaveAttribute('aria-controls', 'social-links');
    });

    it('opens on activation and reports the expanded state', async () => {
        const user = userEvent.setup();
        render(<Overlay socials={socials} />);

        await user.click(trigger());

        expect(trigger()).toHaveAttribute('aria-expanded', 'true');
        expect(document.getElementById('social-links')).toBeInTheDocument();
    });

    // Regression: the trigger used to be swapped out for the links, which threw
    // focus back to <body> and left keyboard users with no way to collapse it.
    it('keeps the trigger mounted and focused when opened from the keyboard', async () => {
        const user = userEvent.setup();
        render(<Overlay socials={socials} />);

        trigger().focus();
        await user.keyboard('{Enter}');

        expect(trigger()).toBeInTheDocument();
        expect(trigger()).toHaveFocus();
    });

    it('toggles closed from the same button', async () => {
        const user = userEvent.setup();
        render(<Overlay socials={socials} />);

        await user.click(trigger());
        await user.click(trigger());

        expect(trigger()).toHaveAttribute('aria-expanded', 'false');
        expect(document.getElementById('social-links')).not.toBeInTheDocument();
    });

    // Click-away only fires for pointers, so Escape is the keyboard escape hatch.
    it('closes on Escape and returns focus to the trigger', async () => {
        const user = userEvent.setup();
        render(<Overlay socials={socials} />);

        await user.click(trigger());
        await user.keyboard('{Escape}');

        expect(document.getElementById('social-links')).not.toBeInTheDocument();
        expect(trigger()).toHaveFocus();
    });
});
