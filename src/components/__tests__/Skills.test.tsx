import { render, screen } from '@testing-library/react';
import Skills from '@/components/Skills';

const skillsProps: SkillsProps = {
    header: 'What I work with',
    intro: 'Grouped by what it is for.',
    categories: [
        { id: 'languages', label: 'Languages' },
        { id: 'security', label: 'Security' },
    ],
    skills: [
        { image: '/logos/python.svg', name: 'Python', category: 'languages' },
        { image: '/logos/bash.svg', name: 'Bash', category: 'languages' },
        { image: '/logos/hacker.svg', name: 'Ethical Hacking', category: 'security' },
    ],
};

describe('Skills', () => {
    it('groups every skill under its category heading', () => {
        render(<Skills {...skillsProps} />);

        expect(screen.getByRole('heading', { name: 'Languages' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Security' })).toBeInTheDocument();
        skillsProps.skills.forEach((skill) => {
            expect(screen.getByText(skill.name)).toBeInTheDocument();
        });
    });

    it('shows each skill logo alongside its name, marked decorative', () => {
        const { container } = render(<Skills {...skillsProps} />);

        const logos = [...container.querySelectorAll('img')]
            .filter((img) => img.getAttribute('src')?.startsWith('/logos/'));

        expect(logos).toHaveLength(skillsProps.skills.length);
        // The name is right beside it as text, so an alt would be read twice.
        logos.forEach((logo) => expect(logo).toHaveAttribute('alt', ''));
    });

    // The whole point of the redesign: a self-assessed percentage invites a
    // recruiter to judge "Bash 10%" rather than read what the person can do.
    it('never renders a proficiency percentage', () => {
        const { container } = render(<Skills {...skillsProps} />);

        expect(container.textContent).not.toMatch(/\d+\s*%/);
    });

    it('drops a category that has no skills rather than rendering an empty card', () => {
        render(
            <Skills
                {...skillsProps}
                categories={[...skillsProps.categories, { id: 'web', label: 'Web' }]}
            />
        );

        expect(screen.queryByRole('heading', { name: 'Web' })).not.toBeInTheDocument();
    });

    // A typo in a category id would otherwise make a skill disappear silently.
    it('still shows a skill whose category is not declared', () => {
        render(
            <Skills
                {...skillsProps}
                skills={[...skillsProps.skills, { image: '/logos/x.svg', name: 'Orphan', category: 'nope' }]}
            />
        );

        expect(screen.getByRole('heading', { name: /also work with/i })).toBeInTheDocument();
        expect(screen.getByText('Orphan')).toBeInTheDocument();
    });

    it('renders certifications as verifiable external links when provided', () => {
        render(
            <Skills
                {...skillsProps}
                certifications={[{ name: 'PNPT', image: '/logos/pnpt.png', url: 'https://example.com/cred' }]}
            />
        );

        const link = screen.getByRole('link', { name: /PNPT/i });
        expect(link).toHaveAttribute('href', 'https://example.com/cred');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('omits the certifications block when there are none', () => {
        render(<Skills {...skillsProps} />);

        expect(screen.queryByRole('link', { name: /verify/i })).not.toBeInTheDocument();
    });
});
