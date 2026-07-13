jest.mock('@/lib/content', () => ({
    getHeroContent: jest.fn(() => ({ image: '/hero.png', prefix: '$ ', titles: [], words: [] })),
    getAboutContent: jest.fn(() => ({ header: 'About', image: '/about.png', text: [] })),
    getExperienceContent: jest.fn(() => ({ experiences: [] })),
    getSkillsContent: jest.fn(() => ({ header: 'Skills', skills: [] })),
    getProjectsContent: jest.fn(() => ({ projects: [] })),
    getContactContent: jest.fn(() => ({ header: 'Contact', phone: '', email: '', headquarters: '' })),
}));

import { getServerSideProps } from '@/pages/index';
import {
    getHeroContent,
    getAboutContent,
    getExperienceContent,
    getSkillsContent,
    getProjectsContent,
    getContactContent,
} from '@/lib/content';

describe('Home getServerSideProps', () => {
    it('assembles page props directly from the content loader, with no network round trip', async () => {
        const result = await getServerSideProps();

        expect(getHeroContent).toHaveBeenCalled();
        expect(getAboutContent).toHaveBeenCalled();
        expect(getExperienceContent).toHaveBeenCalled();
        expect(getSkillsContent).toHaveBeenCalled();
        expect(getProjectsContent).toHaveBeenCalled();
        expect(getContactContent).toHaveBeenCalled();

        expect(result).toEqual({
            props: {
                heroProps: { image: '/hero.png', prefix: '$ ', titles: [], words: [] },
                aboutProps: { header: 'About', image: '/about.png', text: [] },
                experienceProps: { experiences: [] },
                skillsProps: { header: 'Skills', skills: [] },
                projectsProps: { projects: [] },
                contactProps: { header: 'Contact', phone: '', email: '', headquarters: '' },
            },
        });
    });
});
