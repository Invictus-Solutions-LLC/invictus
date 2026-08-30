jest.mock('@/lib/content', () => ({
    getHeroContent: jest.fn(() => ({
        location: 'City', greeting: '', headline: 'Headline', image: '/hero.png', imageAlt: 'Portrait', ctas: [],
    })),
    getAboutContent: jest.fn(() => ({ text: [] })),
    getExperienceContent: jest.fn(() => ({ header: 'Experience', intro: '', experiences: [] })),
    getSkillsContent: jest.fn(() => ({ header: 'Skills', intro: '', categories: [], skills: [] })),
    getProjectsContent: jest.fn(() => ({ header: 'Work', intro: '', projects: [] })),
    getProcessContent: jest.fn(() => ({ header: 'Process', intro: '', steps: [] })),
    getLabContent: jest.fn(() => ({ header: 'Lab', intro: '', entries: [] })),
    getContactContent: jest.fn(() => ({
        header: 'Contact', phone: '', email: '', headquarters: '',
        status: { sending: 'establishing uplink… transmitting', success: 'transmission complete', error: 'transmission failed' },
        cta: { header: 'CTA', invitation: '', buttonLabel: 'Go' }, linkLabel: 'Get in touch',
    })),
    getSocialsContent: jest.fn(() => ({ socials: [] })),
    getFooterContent: jest.fn(() => ({ text: 'Example Inc. All Rights Reserved.' })),
    getBootContent: jest.fn(() => ({ lines: ['[  OK  ] started test.service'] })),
    getAskContent: jest.fn(() => ({ triggerLabel: 'Ask anything', examples: ['do you know Python?'], messages: { asking: 'Reading…', throttled: 'Too many questions — wait a few minutes.', unavailable: 'Unavailable right now.', noMatch: 'Nothing matches that.' }, terminal: { sudo: 'nice try.', ls: 'work  experience  skills' } })),
    getSeoContent: jest.fn(() => ({
        name: 'Example Person', shortName: 'Example', title: 'Example — Engineer',
        description: 'A description.', url: 'https://example.com',
        image: '/hero.png', imageAlt: 'Example Person',
    })),
}));

import { getServerSideProps } from '@/pages/index';
import {
    getHeroContent,
    getAboutContent,
    getExperienceContent,
    getSkillsContent,
    getProjectsContent,
    getProcessContent,
    getLabContent,
    getContactContent,
    getSocialsContent,
    getFooterContent,
    getSeoContent,
    getAskContent,
    getBootContent,
} from '@/lib/content';

describe('Home getServerSideProps', () => {
    it('assembles page props directly from the content loader, with no network round trip', async () => {
        const result = await getServerSideProps();

        [
            getHeroContent, getAboutContent, getExperienceContent, getSkillsContent,
            getProjectsContent, getProcessContent, getLabContent, getContactContent,
            getSocialsContent, getFooterContent, getSeoContent, getAskContent, getBootContent,
        ].forEach((loader) => {
            expect(loader).toHaveBeenCalled();
        });

        expect(Object.keys(result.props)).toEqual([
            'heroProps', 'aboutProps', 'experienceProps', 'skillsProps', 'projectsProps',
            'processProps', 'labProps', 'contactProps', 'socialsProps', 'footerProps',
            'seoProps', 'askProps', 'bootProps', 'personSchema',
        ]);
        expect(result.props.footerProps).toEqual({ text: 'Example Inc. All Rights Reserved.' });
    });
});
