import { render, screen } from '@testing-library/react';
import Experience from '@/components/Experience';

const experienceProps: ExperienceProps = {
    header: 'Where I have worked',
    intro: 'The long version, for the people who need the long version.',
    experiences: [{
        title: 'Analyst', company: 'Department of Defense', logo: '/logos/dod.svg',
        start: '07/2024', end: 'PRESENT', technologies: [], description: ['Did the work.'],
    }],
};

describe('Experience', () => {
    // Every other section reads its heading from content; these two used to be
    // the exceptions, hardcoded in the component.
    it('takes its heading and intro from content', () => {
        render(<Experience {...experienceProps} />);

        expect(screen.getByRole('heading', { level: 2, name: experienceProps.header })).toBeInTheDocument();
        expect(screen.getByText(experienceProps.intro)).toBeInTheDocument();
    });

    it('renders a card per role', () => {
        render(<Experience {...experienceProps} />);

        expect(screen.getByRole('heading', { level: 3, name: 'Analyst' })).toBeInTheDocument();
    });
});
