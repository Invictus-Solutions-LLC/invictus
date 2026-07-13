import { render, screen } from '@testing-library/react';
import { useResetScrollOnLeave } from '@/hooks/useResetScrollOnLeave';

type CapturedObserver = {
    callback: IntersectionObserverCallback;
    options?: IntersectionObserverInit;
    observe: jest.Mock;
    disconnect: jest.Mock;
};

function installMockIntersectionObserver(): CapturedObserver[] {
    const instances: CapturedObserver[] = [];

    class MockIntersectionObserver {
        callback: IntersectionObserverCallback;
        options?: IntersectionObserverInit;
        observe = jest.fn();
        unobserve = jest.fn();
        disconnect = jest.fn();
        takeRecords = jest.fn(() => []);

        constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
            this.callback = callback;
            this.options = options;
            instances.push(this as unknown as CapturedObserver);
        }
    }

    global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
    return instances;
}

function TestCard() {
    const ref = useResetScrollOnLeave<HTMLDivElement>();
    return (
        <div>
            <div
                ref={ref}
                data-testid='card'
            />
        </div>
    );
}

describe('useResetScrollOnLeave', () => {
    const originalIntersectionObserver = global.IntersectionObserver;

    afterEach(() => {
        global.IntersectionObserver = originalIntersectionObserver;
    });

    it('observes the element against its parent as the scroll root', () => {
        const instances = installMockIntersectionObserver();

        render(<TestCard />);
        const card = screen.getByTestId('card');

        expect(instances).toHaveLength(1);
        expect(instances[0].options?.root).toBe(card.parentElement);
        expect(instances[0].observe).toHaveBeenCalledWith(card);
    });

    it('resets scrollTop to 0 when the card leaves view', () => {
        const instances = installMockIntersectionObserver();

        render(<TestCard />);
        const card = screen.getByTestId('card');
        const scrollTopSetter = jest.fn();
        Object.defineProperty(card, 'scrollTop', {
            get: () => 42,
            set: scrollTopSetter,
            configurable: true,
        });

        instances[0].callback(
            [{ isIntersecting: false } as IntersectionObserverEntry],
            instances[0] as unknown as IntersectionObserver
        );

        expect(scrollTopSetter).toHaveBeenCalledWith(0);
    });

    it('leaves scrollTop untouched while the card is still in view', () => {
        const instances = installMockIntersectionObserver();

        render(<TestCard />);
        const card = screen.getByTestId('card');
        const scrollTopSetter = jest.fn();
        Object.defineProperty(card, 'scrollTop', {
            get: () => 42,
            set: scrollTopSetter,
            configurable: true,
        });

        instances[0].callback(
            [{ isIntersecting: true } as IntersectionObserverEntry],
            instances[0] as unknown as IntersectionObserver
        );

        expect(scrollTopSetter).not.toHaveBeenCalled();
    });

    it('disconnects the observer on unmount', () => {
        const instances = installMockIntersectionObserver();

        const { unmount } = render(<TestCard />);
        unmount();

        expect(instances[0].disconnect).toHaveBeenCalledTimes(1);
    });
});
