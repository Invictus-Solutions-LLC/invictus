import { render, screen } from '@testing-library/react';
import Work from '@/components/Work';

const projectsProps: ProjectsProps = {
    header: "Things I've built",
    intro: 'Real problems, for real people.',
    projects: [
        { name: 'FloOps', image: '/logos/floops.svg', url: 'https://floops.io', description: 'A description.' },
    ],
};

describe('Work', () => {
    // Every other section reads its heading from content; these two used to be
    // the exceptions, hardcoded in the component.
    it('takes its heading and intro from content', () => {
        render(<Work {...projectsProps} />);

        expect(screen.getByRole('heading', { level: 2, name: projectsProps.header })).toBeInTheDocument();
        expect(screen.getByText(projectsProps.intro)).toBeInTheDocument();
    });

    it('renders a card per project', () => {
        render(<Work {...projectsProps} />);

        expect(screen.getByRole('heading', { level: 3, name: 'FloOps' })).toBeInTheDocument();
    });
});
