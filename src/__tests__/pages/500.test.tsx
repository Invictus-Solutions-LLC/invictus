import { render, screen } from '@testing-library/react';
import ServerError from '@/pages/500';

describe('500 page', () => {
    it('explains what happened and offers a way home', () => {
        render(<ServerError />);

        expect(screen.getByRole('heading', { level: 1, name: /something broke/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /back to the start/i })).toHaveAttribute('href', '/');
    });

    // The cause belongs in the server log, never in the response — a stack trace
    // or filesystem path here would hand an attacker free reconnaissance.
    it('says nothing about the underlying cause', () => {
        const { container } = render(<ServerError />);

        expect(container.textContent).not.toMatch(/ENOENT|\/app\/|JSON\.parse|at \w+ \(/);
    });
});
