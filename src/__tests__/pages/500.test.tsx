import { render, screen } from '@testing-library/react';
import ServerError from '@/pages/500';

describe('500 page', () => {
    it('renders the terminal-styled error and a link home', () => {
        render(<ServerError />);

        expect(screen.getByText(/segmentation fault/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'cd ~' })).toHaveAttribute('href', '/');
    });

    // The cause belongs in the server log, never in the response — a stack trace
    // or filesystem path here would hand an attacker free reconnaissance.
    it('says nothing about the underlying cause', () => {
        const { container } = render(<ServerError />);

        expect(container.textContent).not.toMatch(/ENOENT|\/app\/|JSON\.parse|at \w+ \(/);
    });
});
