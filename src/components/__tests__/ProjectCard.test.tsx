import { render, screen } from '@testing-library/react';
import ProjectCard from '@/components/ProjectCard';

const project: Project = {
    name: 'Invictus',
    image: '/logos/invictus.png',
    url: 'https://example.com/invictus',
    description: 'A portfolio site.',
};

describe('ProjectCard', () => {
    it('renders the project name, description, and image', () => {
        render(<ProjectCard {...project} />);

        expect(screen.getByText('Invictus')).toBeInTheDocument();
        expect(screen.getByText('A portfolio site.')).toBeInTheDocument();
        expect(screen.getByAltText(project.name)).toBeInTheDocument();
    });

    it('links image, title, and caption to the project url in a new tab', () => {
        render(<ProjectCard {...project} />);

        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(3);
        links.forEach((link) => {
            expect(link).toHaveAttribute('href', project.url);
            expect(link).toHaveAttribute('target', '_blank');
            expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        });
        expect(screen.getByRole('link', { name: project.name })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: `open ${project.url}` })).toBeInTheDocument();
    });
});
