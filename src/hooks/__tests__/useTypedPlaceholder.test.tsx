import { renderHook, act } from '@testing-library/react';
import { useTypedPlaceholder } from '@/hooks/useTypedPlaceholder';

const EXAMPLES = ['do you know Python?', 'tell me about FloOps'];

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

describe('useTypedPlaceholder', () => {
    beforeEach(() => {
        setReducedMotion(false);
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    // It opens showing a complete example rather than an empty box that fills
    // in — the information is the example, so it should be there immediately.
    it('starts on a complete example', () => {
        const { result } = renderHook(() => useTypedPlaceholder(EXAMPLES, true));

        expect(result.current).toBe(EXAMPLES[0]);
    });

    it('deletes and retypes its way to the next example', () => {
        const { result } = renderHook(() => useTypedPlaceholder(EXAMPLES, true));

        // Past the opening hold, part-way through deleting the first example.
        act(() => { jest.advanceTimersByTime(2000); });
        expect(result.current.length).toBeLessThan(EXAMPLES[0].length);
        expect(EXAMPLES[0].startsWith(result.current)).toBe(true);

        // Deleted, paused, and now typing the second one in.
        act(() => { jest.advanceTimersByTime(1200); });
        expect(result.current.length).toBeGreaterThan(0);
        expect(EXAMPLES[1].startsWith(result.current)).toBe(true);
    });

    // Once someone types, their own text takes over and the animation has no
    // business running.
    it('stands still while the visitor is typing', () => {
        const { result } = renderHook(() => useTypedPlaceholder(EXAMPLES, false));

        act(() => { jest.advanceTimersByTime(10_000); });
        expect(result.current).toBe(EXAMPLES[0]);
    });

    // The example itself is the information; the motion is not.
    it('holds one example still for reduced motion', () => {
        setReducedMotion(true);
        const { result } = renderHook(() => useTypedPlaceholder(EXAMPLES, true));

        act(() => { jest.advanceTimersByTime(10_000); });
        expect(result.current).toBe(EXAMPLES[0]);
    });

    it('survives having no examples to show', () => {
        const { result } = renderHook(() => useTypedPlaceholder([], true));

        act(() => { jest.advanceTimersByTime(5000); });
        expect(result.current).toBe('');
    });
});
