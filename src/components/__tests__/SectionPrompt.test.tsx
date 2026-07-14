import { render, screen } from '@testing-library/react';
import SectionPrompt from '@/components/SectionPrompt';

describe('SectionPrompt', () => {
    it('exposes the plain section name to the accessibility tree, not shell syntax', () => {
        render(<SectionPrompt label='About' command='cd ./about' />);

        expect(screen.getByRole('heading', { level: 3, name: 'About' })).toBeInTheDocument();
    });

    it('renders the shell command visually', () => {
        render(<SectionPrompt label='Projects' command='cd ./projects' />);

        expect(screen.getByText(/cd \.\/projects/)).toBeInTheDocument();
    });
});
