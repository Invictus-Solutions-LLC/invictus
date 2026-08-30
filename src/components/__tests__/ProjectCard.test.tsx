import { render, screen } from '@testing-library/react';
import ProjectCard from '@/components/ProjectCard';

const project: Project = {
    name: 'FloOps',
    image: '/logos/floops.svg',
    url: 'https://floops.io',
    description: 'FloOps is a full-stack operations management platform for golf courses, written up in full by its author.',
};

describe('ProjectCard', () => {
    it('leads with the project name', () => {
        render(<ProjectCard {...project} />);

        expect(screen.getByRole('heading', { name: project.name })).toBeInTheDocument();
    });

    // Shown in full and up front — not shortened, not paraphrased, and not
    // hidden behind a disclosure the reader has to find.
    it("renders the author's full description directly on the card", () => {
        render(<ProjectCard {...project} />);

        expect(screen.getByText(project.description)).toBeInTheDocument();
        expect(screen.queryByText(/read the detail/i)).not.toBeInTheDocument();
    });

    it('opens the project safely in a new tab', () => {
        render(<ProjectCard {...project} />);

        const link = screen.getByRole('link', { name: /visit floops/i });
        expect(link).toHaveAttribute('href', project.url);
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    // The heading already names the project; a duplicate alt would make a
    // screen reader read it twice.
    it('marks the artwork as decorative', () => {
        const { container } = render(<ProjectCard {...project} />);

        expect(container.querySelector('img')).toHaveAttribute('alt', '');
    });
});
