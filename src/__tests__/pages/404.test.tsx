import { render, screen } from '@testing-library/react';
import NotFound from '@/pages/404';

describe('404 page', () => {
    it('renders the bash-style error and a link home', () => {
        render(<NotFound />);

        expect(screen.getByText(/No such file or directory/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'cd ~' })).toHaveAttribute('href', '/');
    });
});
