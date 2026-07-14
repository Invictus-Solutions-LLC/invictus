import { act, render, screen } from '@testing-library/react';
import BootSequence, { BOOT_LINES, LINE_INTERVAL_MS, HOLD_MS, FADE_MS } from '@/components/BootSequence';

describe('BootSequence', () => {
    beforeEach(() => {
        sessionStorage.clear();
        jest.useFakeTimers();
    });

    afterEach(() => {
        act(() => {
            jest.runOnlyPendingTimers();
        });
        jest.useRealTimers();
    });

    it('renders nothing when the boot flag is already set for this session', () => {
        sessionStorage.setItem('invictus-boot-shown', '1');
        const { container } = render(<BootSequence />);

        expect(container).toBeEmptyDOMElement();
    });

    it('plays the boot log on first visit and marks the session', () => {
        render(<BootSequence />);

        expect(sessionStorage.getItem('invictus-boot-shown')).toBe('1');
        expect(screen.getByRole('status', { name: 'Boot sequence' })).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(LINE_INTERVAL_MS + 50);
        });
        expect(screen.getByText(/power-on self test/)).toBeInTheDocument();

        // After all lines + hold + fade, the overlay unmounts.
        act(() => {
            jest.advanceTimersByTime(BOOT_LINES.length * LINE_INTERVAL_MS + HOLD_MS + FADE_MS + 50);
        });
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('skips to the end on any keypress', () => {
        render(<BootSequence />);

        act(() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        });
        act(() => {
            jest.advanceTimersByTime(600);
        });

        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
});
