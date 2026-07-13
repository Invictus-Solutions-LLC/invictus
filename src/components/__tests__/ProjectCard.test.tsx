import { render, screen } from '@testing-library/react';
import ProjectCard from '@/components/ProjectCard';

const project: Project = {
    name: 'Invictus',
    image: '/logos/invictus.png',
    url: 'https://example.com/invictus',
    description: 'A portfolio site.',
};

describe('ProjectCard', () => {
    it('renders the project name, description, and link', () => {
        render(<ProjectCard {...project} />);

        expect(screen.getByText('Invictus')).toBeInTheDocument();
        expect(screen.getByText('A portfolio site.')).toBeInTheDocument();
        expect(screen.getByText(`open ${project.url}`)).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', project.url);
        expect(screen.getByAltText(project.name)).toBeInTheDocument();
    });
});
