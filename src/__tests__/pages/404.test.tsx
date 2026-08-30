import { render, screen } from '@testing-library/react';
import NotFound from '@/pages/404';

describe('404 page', () => {
    it('explains what happened and offers a way home', () => {
        render(<NotFound />);

        expect(screen.getByRole('heading', { level: 1, name: /drifted off the map/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /back to the start/i })).toHaveAttribute('href', '/');
    });
});
