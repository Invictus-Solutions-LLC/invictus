import { render, screen } from '@testing-library/react';
import Footer from '@/components/Footer';

describe('Footer', () => {
    it('takes the wordmark from content rather than hardcoding it', () => {
        render(<Footer text='Invictus808.' socials={[]} name='Ada Lovelace' />);

        expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    });

    it('renders the copyright with the current year', () => {
        render(<Footer text='Invictus808. All Rights Reserved.' socials={[]} name='Blaise' />);

        expect(screen.getByText(`© ${new Date().getFullYear()} Invictus808. All Rights Reserved.`)).toBeInTheDocument();
    });

    it('lists social profiles in a named navigation landmark', () => {
        render(<Footer text='Invictus808.' socials={['https://github.com/example']} name='Blaise' />);

        expect(screen.getByRole('navigation', { name: /social profiles/i })).toBeInTheDocument();
    });
});
