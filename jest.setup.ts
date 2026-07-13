import '@testing-library/jest-dom';

// jsdom doesn't implement IntersectionObserver, which framer-motion's
// `whileInView` relies on for every section wrapper in this app.
class IntersectionObserverMock implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: ReadonlyArray<number> = [];
    disconnect = jest.fn();
    observe = jest.fn();
    unobserve = jest.fn();
    takeRecords = jest.fn(() => []);
}

global.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;
