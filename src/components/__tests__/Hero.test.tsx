import { render, screen } from '@testing-library/react';
import Hero from '@/components/Hero';

const heroProps: HeroProps = {
    image: '/hero.png',
    prefix: 'root@invictus:~# ',
    titles: ['Software Engineer'],
    words: ['Hello world'],
};

describe('Hero', () => {
    it('renders without throwing and shows the CLI-style section nav', () => {
        render(<Hero {...heroProps} />);

        expect(screen.getByText('// Software Engineer')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '#about');
        expect(screen.getByRole('link', { name: /experience/i })).toHaveAttribute('href', '#experience');
    });
});
