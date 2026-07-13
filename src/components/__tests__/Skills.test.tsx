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
});
