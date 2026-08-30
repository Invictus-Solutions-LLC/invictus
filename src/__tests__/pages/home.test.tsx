import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@/pages/index';

jest.mock('next/router', () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

const props = {
    heroProps: {
        location: "Honolulu, Hawai'i",
        greeting: 'Aloha',
        headline: 'I make software safer.',
        image: '/hero.png',
        imageAlt: 'Portrait',
        ctas: [{ label: 'Work with me', href: '#contact', variant: 'primary' as const }],
    },
    aboutProps: {
        text: ['About text, which the hero speaks in.'],
    },
    experienceProps: {
        header: 'Where I have worked',
        intro: 'The long version.',
        experiences: [{
            title: 'Analyst', company: 'DoD', logo: '/logos/x.svg', start: '2021', end: 'PRESENT',
            technologies: [{ image: '/logos/python.svg', name: 'Python' }], description: ['Did the work.'],
        }],
    },
    skillsProps: {
        header: 'What I work with',
        intro: 'Grouped by what it is for.',
        categories: [{ id: 'languages', label: 'Languages' }],
        skills: [{ image: '/logos/python.svg', name: 'Python', category: 'languages' }],
        certifications: [{ name: 'PNPT', image: '/logos/pnpt.png', url: 'https://example.com/cred' }],
    },
    projectsProps: {
        header: "Things I've built",
        intro: 'Real problems, for real people.',
        projects: [{
            name: 'FloOps', image: '/logos/floops.svg', url: 'https://floops.io',
            description: 'The full description.',
        }],
    },
    processProps: {
        header: 'How working together goes',
        intro: 'No mystery.',
        steps: [{ title: 'You tell me the problem', text: 'In your words.' }],
    },
    labProps: {
        header: 'What I am digging into',
        intro: 'Honest about where each one is.',
        entries: [{ title: 'Search', text: 'Grounded answers.', status: 'live' as const, statusLabel: 'Live' }],
    },
    contactProps: {
        header: "Let's connect.",
        phone: '+1-408-555-0100',
        email: 'contact@example.com',
        headquarters: "Honolulu, Hawai'i",
        status: { sending: 'establishing uplink… transmitting', success: 'transmission complete', error: 'transmission failed' },
        cta: { header: 'Got something to build?', invitation: 'Tell me.', buttonLabel: 'Start' },
        linkLabel: 'Get in touch',
    },
    socialsProps: { socials: ['https://github.com/example'] },
    footerProps: { text: 'Invictus808. All Rights Reserved.' },
    seoProps: {
        name: 'Blaise Aranador',
        shortName: 'Blaise',
        title: 'Blaise Aranador — Software Engineer',
        description: 'A description.',
        url: 'https://example.com',
        image: '/og.jpg',
        imageAlt: 'Blaise Aranador — Software Engineer',
    },
    bootProps: { lines: ['[  OK  ] started test.service'] },
    askProps: { triggerLabel: 'Ask anything', examples: ['do you know Kubernetes?', 'tell me about FloOps'], messages: { asking: 'Reading…', throttled: 'Too many questions — wait a few minutes.', unavailable: 'Unavailable right now.', noMatch: 'Nothing matches that.' } },
    personSchema: '{"@context":"https://schema.org","@type":"Person","name":"Blaise Aranador"}',
};

describe('Home page', () => {
    it('exposes the expected landmarks and a single h1', () => {
        render(<Home {...props} />);

        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(screen.getByRole('main')).toBeInTheDocument();
        expect(screen.getByRole('contentinfo')).toBeInTheDocument();
        // The footer wordmark is the one place the full name appears as
        // visible text — the hero shows the greeting and carries the name
        // sr-only — so it is what search engines and readers both get.
        // seo.json's shortName is for the webmanifest's short_name instead.
        expect(screen.getByText(props.seoProps.name)).toBeInTheDocument();
        expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    });

    // The header mark carries no wordmark, so the link needs its own accessible
    // name — otherwise it announces as an unlabelled link.
    it('gives the logo link an accessible name', () => {
        render(<Home {...props} />);

        const home = screen.getByRole('link', { name: 'Home' });
        expect(home).toHaveAttribute('href', '#hero');
    });

    it('offers a skip link as the first stop for a keyboard user', async () => {
        const user = userEvent.setup();
        render(<Home {...props} />);

        await user.tab();
        expect(screen.getByRole('link', { name: /skip to content/i })).toHaveFocus();
    });

    it('renders every content-driven section', () => {
        render(<Home {...props} />);

        expect(screen.getByRole('heading', { level: 1, name: props.heroProps.headline })).toBeInTheDocument();
        expect(screen.getByText(props.aboutProps.text[0])).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: props.projectsProps.projects[0].name })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: props.skillsProps.header })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: props.labProps.header })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: props.processProps.header })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: props.contactProps.cta.header })).toBeInTheDocument();
    });

    it('opens the palette from the header button and closes it again with Escape', async () => {
        const user = userEvent.setup();
        render(<Home {...props} />);

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /open search and navigation/i }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        await user.keyboard('{Escape}');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('opens the palette with the keyboard shortcut', async () => {
        const user = userEvent.setup();
        render(<Home {...props} />);

        await user.keyboard('{Control>}k{/Control}');

        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Everything the palette offers is built from content, so it can never
    // drift out of step with what the page actually shows.
    it('builds palette entries from the same content the page renders', async () => {
        const user = userEvent.setup();
        render(<Home {...props} />);

        await user.keyboard('{Control>}k{/Control}');

        expect(screen.getByRole('option', { name: /FloOps/ })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /github\.com/ })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /contact@example\.com/ })).toBeInTheDocument();
    });

    // The suggestions are content, so they can be edited without a rebuild.
    it('takes the palette suggestions from content', async () => {
        const user = userEvent.setup();
        render(<Home {...props} />);

        await user.keyboard('{Control>}k{/Control}');

        expect(screen.getByRole('combobox')).toHaveAttribute('placeholder', props.askProps.examples[0]);
    });
});
