import { act, render, screen } from '@testing-library/react';
import BootSequence, {
    BOOT_LINES,
    LINE_INTERVAL_MS,
    HOLD_MS,
    FADE_MS,
    REATTACH_BAR_CELLS,
    REATTACH_TICK_MS,
    REATTACH_HOLD_MS,
    REDUCED_BOOT_HOLD_MS,
} from '@/components/BootSequence';

function mockReducedMotion(matches: boolean) {
    window.matchMedia = jest.fn().mockReturnValue({ matches }) as unknown as typeof window.matchMedia;
}

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
        // jsdom has no matchMedia; remove any mock so other tests see the default.
        delete (window as { matchMedia?: unknown }).matchMedia;
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

    it('shows the session re-attach loader instead of the boot log on repeat loads', () => {
        sessionStorage.setItem('invictus-boot-shown', '1');
        render(<BootSequence />);

        expect(screen.getByRole('status', { name: 'Reconnecting' })).toBeInTheDocument();
        expect(screen.getByText(/reconnecting to session/)).toBeInTheDocument();
        expect(screen.queryByText(/power-on self test/)).not.toBeInTheDocument();

        // Progress bar fills...
        act(() => {
            jest.advanceTimersByTime(REATTACH_BAR_CELLS * REATTACH_TICK_MS + 10);
        });
        expect(screen.getByText('attached.')).toBeInTheDocument();
        expect(screen.getByText(/100%/)).toBeInTheDocument();

        // ...then the overlay unmounts after hold + fade.
        act(() => {
            jest.advanceTimersByTime(REATTACH_HOLD_MS + FADE_MS + 50);
        });
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('skips the boot log on any keypress', () => {
        render(<BootSequence />);

        act(() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        });
        act(() => {
            jest.advanceTimersByTime(FADE_MS + 100);
        });

        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('skips the re-attach loader on any keypress', () => {
        sessionStorage.setItem('invictus-boot-shown', '1');
        render(<BootSequence />);

        act(() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        });
        act(() => {
            jest.advanceTimersByTime(FADE_MS + 100);
        });

        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('reduced motion: shows the complete boot log as one static frame, then cuts', () => {
        mockReducedMotion(true);
        render(<BootSequence />);

        // Every line rendered immediately — no typing animation to wait for.
        expect(screen.getByText(/power-on self test/)).toBeInTheDocument();
        expect(screen.getByText(/incoming connection from guest/)).toBeInTheDocument();

        // Cuts to hidden after the hold, with no fade delay in between.
        act(() => {
            jest.advanceTimersByTime(REDUCED_BOOT_HOLD_MS + 10);
        });
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('reduced motion: static frame is still dismissible with a keypress', () => {
        mockReducedMotion(true);
        render(<BootSequence />);

        act(() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        });
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
});
