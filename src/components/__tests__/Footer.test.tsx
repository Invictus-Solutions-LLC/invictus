import { render, screen } from '@testing-library/react';
import Footer from '@/components/Footer';

describe('Footer', () => {
    it('renders the session name, copyright, and section shortcuts', () => {
        render(<Footer text='Example Inc. All Rights Reserved.' />);

        expect(screen.getByText('[invictus808]')).toBeInTheDocument();
        expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()} Example Inc`))).toBeInTheDocument();

        const nav = screen.getByRole('navigation', { name: 'Section shortcuts' });
        expect(nav).toBeInTheDocument();
        expect(screen.getByRole('link', { name: '2:experience' })).toHaveAttribute('href', '#experience');
        expect(screen.getByRole('link', { name: '5:contact' })).toHaveAttribute('href', '#contact');
    });
});
