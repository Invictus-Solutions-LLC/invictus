import '@testing-library/jest-dom';

// jsdom doesn't implement IntersectionObserver, which every scroll-revealed
// section relies on. This mock reveals immediately, so tests assert the settled
// page rather than a mid-animation frame.
class IntersectionObserverMock implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: ReadonlyArray<number> = [];
    private readonly callback: IntersectionObserverCallback;

    constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
    }

    observe = jest.fn((target: Element) => {
        this.callback(
            [{ target, isIntersecting: true } as IntersectionObserverEntry],
            this as unknown as IntersectionObserver
        );
    });

    disconnect = jest.fn();
    unobserve = jest.fn();
    takeRecords = jest.fn(() => []);
}

global.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;

// jsdom has no matchMedia either, and the theme hook subscribes to
// prefers-color-scheme on mount. Defaults to "not light", i.e. the dark theme.
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// jsdom ships no fetch implementation, so `jest.spyOn(global, 'fetch')` has
// nothing to replace. This stub exists purely to be spied on; any test that
// relies on a response mocks it explicitly.
if (typeof global.fetch !== 'function') {
    global.fetch = jest.fn(() => Promise.reject(new Error('fetch not mocked in this test'))) as unknown as typeof fetch;
}
