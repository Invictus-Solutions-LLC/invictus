import { render, screen } from '@testing-library/react';
import ErrorBoundary from '@/components/ErrorBoundary';

function Boom(): React.ReactElement {
    throw new Error('render exploded');
}

describe('ErrorBoundary', () => {
    beforeEach(() => {
        // React logs the caught error itself; keep the test output readable.
        jest.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders its children when nothing is wrong', () => {
        render(<ErrorBoundary><p>the page</p></ErrorBoundary>);

        expect(screen.getByText('the page')).toBeInTheDocument();
    });

    // The alternative is a blank page, which is the worst outcome for a site
    // whose whole job is to be read.
    it('shows a usable page instead of a blank one when a child throws', () => {
        render(<ErrorBoundary><Boom /></ErrorBoundary>);

        expect(screen.getByRole('heading', { level: 1, name: /stopped working/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /reload the page/i })).toHaveAttribute('href', '/');
    });

    // A client-side navigation would keep the broken tree mounted; only a full
    // document load recovers.
    it('recovers with a full document load rather than a client-side route', () => {
        const { container } = render(<ErrorBoundary><Boom /></ErrorBoundary>);

        const link = container.querySelector('a[href="/"]');
        expect(link).not.toBeNull();
        expect(link).not.toHaveAttribute('data-next-link');
    });

    it('never leaks the error message to the visitor', () => {
        const { container } = render(<ErrorBoundary><Boom /></ErrorBoundary>);

        expect(container.textContent).not.toMatch(/render exploded|at \w+ \(/);
    });
});
