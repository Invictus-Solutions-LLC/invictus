import { render, screen } from '@testing-library/react';
import Skills from '@/components/Skills';

const skillsProps: SkillsProps = {
    header: 'Hover for proficiency',
    skills: [
        { image: '/logos/python.svg', level: 90, name: 'Python' },
        { image: '/logos/git.svg', level: 50, name: 'Git' },
    ],
};

describe('Skills', () => {
    it('renders one entry per skill', () => {
        render(<Skills {...skillsProps} />);

        skillsProps.skills.forEach((skill) => {
            expect(screen.getByAltText(skill.name)).toBeInTheDocument();
        });
    });

    it('renders certifications in a ~/certifications window as verifiable external links when provided', () => {
        render(
            <Skills
                {...skillsProps}
                certifications={[{ name: 'PNPT', image: '/logos/pnpt.png', url: 'https://example.com/cred' }]}
            />
        );

        expect(screen.getByText('~/certifications')).toBeInTheDocument();

        const link = screen.getByRole('link', { name: /PNPT.*verified credential/i });
        expect(link).toHaveAttribute('href', 'https://example.com/cred');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(screen.getByAltText(/PNPT verified credential badge/i)).toBeInTheDocument();
    });

    it('omits the certs window when no certifications are provided', () => {
        render(<Skills {...skillsProps} />);
        expect(screen.queryByText('~/certifications')).not.toBeInTheDocument();
    });
});
