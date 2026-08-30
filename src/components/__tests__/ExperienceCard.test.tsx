import { render, screen } from '@testing-library/react';
import ExperienceCard from '@/components/ExperienceCard';

const experience: Experience = {
    title: 'Digital Network Exploitation Analyst, Team Lead',
    company: 'Department of Defense',
    logo: '/logos/united-states-department-of-defense.svg',
    start: '07/2024',
    end: 'PRESENT',
    technologies: [
        { image: '/logos/python.svg', name: 'Python' },
        { image: '/logos/hacker.svg', name: 'Reverse Engineering' },
    ],
    description: ['Led a software analysis team.', 'Saved 30 hours of weekly analysis.'],
};

describe('ExperienceCard', () => {
    it('renders the role, company and dates', () => {
        render(<ExperienceCard {...experience} />);

        expect(screen.getByRole('heading', { name: experience.title })).toBeInTheDocument();
        expect(screen.getByText(experience.company)).toBeInTheDocument();
        expect(screen.getByText('07/2024 – PRESENT')).toBeInTheDocument();
    });

    it('lists every bullet from the description', () => {
        render(<ExperienceCard {...experience} />);

        experience.description.forEach((note) => {
            expect(screen.getByText(note)).toBeInTheDocument();
        });
    });

    // The technologies use the same chip as the skills grid, so a logo appears
    // wherever a skill does.
    it('shows each technology with its logo', () => {
        const { container } = render(<ExperienceCard {...experience} />);

        experience.technologies.forEach((technology) => {
            expect(screen.getByText(technology.name)).toBeInTheDocument();
            expect(container.querySelector(`img[src="${technology.image}"]`)).toBeInTheDocument();
        });
    });

    it('omits the technology list when a role has none', () => {
        const { container } = render(<ExperienceCard {...experience} technologies={[]} />);

        expect(container.querySelectorAll('.chip')).toHaveLength(0);
    });
});
