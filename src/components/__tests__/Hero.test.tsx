import { render, screen } from '@testing-library/react';
import Hero from '@/components/Hero';

const heroProps: HeroProps = {
    location: "Honolulu, Hawai'i",
    greeting: 'Aloha',
    headline: 'Hi, I am Blaise.',
    image: '/hero.png',
    imageAlt: 'Blaise outdoors',
    ctas: [
        { label: 'Work with me', href: '#contact', variant: 'primary' },
        { label: 'See my experience', href: '#experience', variant: 'secondary' },
    ],
};

// The hero speaks in the words from about.json rather than a second, competing
// introduction written just for it.
const paragraphs = [
    'Aloha, I work at the intersection of building software and breaking it.',
    'I hold the [PNPT certification](https://example.com/cred).',
];

describe('Hero', () => {
    it('renders the headline as the page h1', () => {
        render(<Hero {...heroProps} paragraphs={paragraphs} />);

        expect(screen.getByRole('heading', { level: 1, name: 'Hi, I am Blaise.' })).toBeInTheDocument();
    });

    // A visitor sees the greeting; a crawler still reads the name out of the
    // heading, so the page keeps the one term it should rank for.
    it('shows the greeting while keeping the name in the heading', () => {
        const { container } = render(<Hero {...heroProps} paragraphs={paragraphs} />);

        const h1 = container.querySelector('h1')!;
        expect(h1.textContent).toContain('Aloha');
        expect(h1.textContent).toContain('Hi, I am Blaise.');
    });

    // "\m/" is metal horns to the eye and noise read aloud, and a heading of
    // just "Aloha" would not say whose page this is.
    it('reads as the name to assistive technology, not the greeting', () => {
        render(<Hero {...heroProps} paragraphs={paragraphs} />);

        expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName('Hi, I am Blaise.');
    });

    it('falls back to the plain heading when content leaves the greeting empty', () => {
        const { container } = render(<Hero {...heroProps} greeting='' paragraphs={paragraphs} />);

        expect(container.querySelector('h1')!.textContent).toBe('Hi, I am Blaise.');
        expect(screen.queryByText('Aloha')).not.toBeInTheDocument();
    });

    it('renders the location, the about prose and every call to action', () => {
        render(<Hero {...heroProps} paragraphs={paragraphs} />);

        expect(screen.getByText("Honolulu, Hawai'i")).toBeInTheDocument();
        expect(screen.getByText(/intersection of building software/)).toBeInTheDocument();
        heroProps.ctas.forEach((cta) => {
            expect(screen.getByRole('link', { name: cta.label })).toHaveAttribute('href', cta.href);
        });
    });

    // The About prose carries the credential link, so the hero has to render
    // markdown links rather than printing the raw syntax.
    it('renders markdown links inside the prose', () => {
        render(<Hero {...heroProps} paragraphs={paragraphs} />);

        const link = screen.getByRole('link', { name: 'PNPT certification' });
        expect(link).toHaveAttribute('href', 'https://example.com/cred');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('describes the portrait for screen readers from content, not a hardcoded string', () => {
        render(<Hero {...heroProps} paragraphs={paragraphs} />);

        expect(screen.getByAltText('Blaise outdoors')).toBeInTheDocument();
    });

    it('shows the certification badge and links it to the verifiable credential', () => {
        render(
            <Hero
                {...heroProps}
                paragraphs={paragraphs}
                certification={{ name: 'PNPT', image: '/logos/pnpt.png', url: 'https://example.com/pnpt' }}
            />
        );

        const link = screen.getByRole('link', { name: /PNPT.*verify the credential/i });
        expect(link).toHaveAttribute('href', 'https://example.com/pnpt');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('omits the certification card when there is none', () => {
        render(<Hero {...heroProps} paragraphs={paragraphs} />);

        expect(screen.queryByRole('link', { name: /verify the credential/i })).not.toBeInTheDocument();
    });
});
