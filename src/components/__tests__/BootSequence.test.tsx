import { render, screen, act } from '@testing-library/react';
import BootSequence, {
    LINE_INTERVAL_MS,
    HOLD_MS,
    FADE_MS,
    REATTACH_BAR_CELLS,
    REATTACH_TICK_MS,
    REATTACH_HOLD_MS,
    REDUCED_BOOT_HOLD_MS,
    REDUCED_REATTACH_HOLD_MS,
} from '@/components/BootSequence';

const STORAGE_KEY = 'invictus-boot-shown';

// The log is content now, so the component is tested against a fixture rather
// than against whatever the owner happens to have written.
const BOOT_LINES = [
    '[    0.000042] bios v1.0.0 — power-on self test... ok',
    '[    0.238551] mounting /dev/portfolio... ok',
    '[  OK  ] started portfolio.service',
    '[    0.842013] incoming connection from guest... accepted',
];

function setReducedMotion(reduced: boolean) {
    (window.matchMedia as unknown as jest.Mock).mockImplementation((query: string) => ({
        matches: reduced && query.includes('reduced-motion'),
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        dispatchEvent: jest.fn(),
    }));
}

const overlay = () => document.getElementById('boot-sequence');

// The boot lines are space-aligned; Testing Library collapses whitespace by
// default, so matching them needs the raw text.
const raw = { normalizer: (text: string) => text };
// Guard here rather than at each call site: an out-of-range fixture index is a
// broken test, and it should say so instead of searching the DOM for undefined.
function requireLine(text: string | undefined): string {
    if (text === undefined) {
        throw new Error('BOOT_LINES has no line at that index');
    }
    return text;
}
const line = (text: string | undefined) => screen.getByText(requireLine(text), raw);
const noLine = (text: string | undefined) => screen.queryByText(requireLine(text), raw);

describe('BootSequence', () => {
    beforeEach(() => {
        window.sessionStorage.clear();
        setReducedMotion(false);
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    // The overlay ships in the SSR HTML so the hero never flashes in the gap
    // between first paint and hydration.
    it('covers the page from the very first render', () => {
        render(<BootSequence lines={BOOT_LINES} />);

        expect(overlay()).toBeInTheDocument();
    });

    // A screen reader gets the real page, which is rendered underneath the whole
    // time. Announcing a fake kernel log over it would be pure noise.
    it('is decorative and never announces itself', () => {
        render(<BootSequence lines={BOOT_LINES} />);

        expect(overlay()).toHaveAttribute('aria-hidden', 'true');
        expect(overlay()).not.toHaveAttribute('role', 'status');
    });

    describe('fresh session', () => {
        it('types the boot log one line at a time', () => {
            render(<BootSequence lines={BOOT_LINES} />);

            act(() => { jest.advanceTimersByTime(LINE_INTERVAL_MS); });
            expect(line(BOOT_LINES[0])).toBeInTheDocument();
            expect(noLine(BOOT_LINES[1])).not.toBeInTheDocument();

            act(() => { jest.advanceTimersByTime(LINE_INTERVAL_MS); });
            expect(line(BOOT_LINES[1])).toBeInTheDocument();
        });

        it('reaches the last line, holds, then fades out', () => {
            render(<BootSequence lines={BOOT_LINES} />);

            act(() => { jest.advanceTimersByTime(BOOT_LINES.length * LINE_INTERVAL_MS); });
            expect(line(BOOT_LINES[BOOT_LINES.length - 1])).toBeInTheDocument();

            act(() => { jest.advanceTimersByTime(HOLD_MS); });
            expect(overlay()).toHaveClass('opacity-0');

            act(() => { jest.advanceTimersByTime(FADE_MS); });
            expect(overlay()).not.toBeInTheDocument();
        });

        it('renders exactly the lines it was given, in order', () => {
            render(<BootSequence lines={BOOT_LINES} />);

            act(() => { jest.advanceTimersByTime(BOOT_LINES.length * LINE_INTERVAL_MS); });
            BOOT_LINES.forEach((text) => expect(line(text)).toBeInTheDocument());
        });
    });

    describe('repeat load in the same session', () => {
        it('reattaches with a progress bar instead of booting again', () => {
            window.sessionStorage.setItem(STORAGE_KEY, '1');
            render(<BootSequence lines={BOOT_LINES} />);

            act(() => { jest.advanceTimersByTime(REATTACH_TICK_MS); });
            expect(screen.getByText(/reconnecting to session/)).toBeInTheDocument();
            expect(noLine(BOOT_LINES[0])).not.toBeInTheDocument();
        });

        // The bar has to visibly fill. If it ever jumped straight to 100% it
        // would read as a static graphic rather than progress.
        it('fills the bar progressively rather than arriving full', () => {
            window.sessionStorage.setItem(STORAGE_KEY, '1');
            render(<BootSequence lines={BOOT_LINES} />);

            const percent = () => screen.getByText(/%$/, raw).textContent ?? '';

            act(() => { jest.advanceTimersByTime(REATTACH_TICK_MS); });
            const first = percent();
            expect(first).toContain('6%');
            expect(first).toContain('░');

            act(() => { jest.advanceTimersByTime(REATTACH_TICK_MS * 7); });
            const middle = percent();
            expect(middle).not.toEqual(first);
            expect(middle).toContain('░');
            expect(middle).not.toContain('100%');
        });

        it('fills the bar to 100% and reports attached', () => {
            window.sessionStorage.setItem(STORAGE_KEY, '1');
            render(<BootSequence lines={BOOT_LINES} />);

            act(() => { jest.advanceTimersByTime(REATTACH_BAR_CELLS * REATTACH_TICK_MS); });
            expect(screen.getByText(/100%/)).toBeInTheDocument();
            expect(screen.getByText('attached.')).toBeInTheDocument();

            act(() => { jest.advanceTimersByTime(REATTACH_HOLD_MS + FADE_MS); });
            expect(overlay()).not.toBeInTheDocument();
        });
    });

    describe('skipping', () => {
        it.each([
            ['keydown', () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))],
            ['pointerdown', () => window.dispatchEvent(new Event('pointerdown'))],
        ])('ends immediately on %s', (_label, fire) => {
            render(<BootSequence lines={BOOT_LINES} />);

            act(() => { fire(); });
            act(() => { jest.advanceTimersByTime(FADE_MS); });

            expect(overlay()).not.toBeInTheDocument();
        });

        // Both listeners call the same finish(); if one survived it would
        // resurrect the fading overlay and swallow the next keystroke.
        it('cannot be resurrected by a second skip', () => {
            render(<BootSequence lines={BOOT_LINES} />);

            act(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' })); });
            act(() => { window.dispatchEvent(new Event('pointerdown')); });
            act(() => { jest.advanceTimersByTime(FADE_MS); });

            expect(overlay()).not.toBeInTheDocument();
        });
    });

    describe('reduced motion', () => {
        it('shows the finished screen as one static frame, then cuts without fading', () => {
            setReducedMotion(true);
            render(<BootSequence lines={BOOT_LINES} />);

            // No typing: every line is already there.
            act(() => { jest.advanceTimersByTime(0); });
            expect(line(BOOT_LINES[BOOT_LINES.length - 1])).toBeInTheDocument();

            act(() => { jest.advanceTimersByTime(REDUCED_BOOT_HOLD_MS); });
            // Straight to gone — an opacity tween is still motion.
            expect(overlay()).not.toBeInTheDocument();
        });

        // Reduced motion applies to the reattach path too — the bar arrives full
        // and cuts, rather than filling and fading.
        it('shows the reattach bar complete and cuts, with reduced motion', () => {
            setReducedMotion(true);
            window.sessionStorage.setItem(STORAGE_KEY, '1');
            render(<BootSequence lines={BOOT_LINES} />);

            act(() => { jest.advanceTimersByTime(0); });
            expect(screen.getByText(/100%/)).toBeInTheDocument();

            act(() => { jest.advanceTimersByTime(REDUCED_REATTACH_HOLD_MS); });
            expect(overlay()).not.toBeInTheDocument();
        });
    });

    it('boots anyway when sessionStorage is unavailable', () => {
        jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied'); });
        jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('denied'); });

        render(<BootSequence lines={BOOT_LINES} />);
        act(() => { jest.advanceTimersByTime(LINE_INTERVAL_MS); });

        expect(line(BOOT_LINES[0])).toBeInTheDocument();
    });
});
