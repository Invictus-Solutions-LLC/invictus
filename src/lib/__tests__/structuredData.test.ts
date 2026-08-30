import { buildPersonSchema } from '@/lib/structuredData';

const input = {
    portrait: '/hero.jpg',
    seo: {
        name: 'Blaise Aranador',
        shortName: 'Blaise',
        title: 'Blaise Aranador — Software Engineer',
        description: 'A description.',
        url: 'https://example.com',
        image: '/og.jpg',
        imageAlt: 'Blaise Aranador — Software Engineer',
    },
    contact: {
        header: "Let's connect.",
        phone: '+1-408-555-0100',
        email: 'contact@example.com',
        headquarters: "Honolulu, Hawai'i",
        status: { sending: 'establishing uplink… transmitting', success: 'transmission complete', error: 'transmission failed' },
        cta: { header: 'CTA', invitation: '', buttonLabel: '' },
        linkLabel: 'Get in touch',
    },
    experiences: [{
        title: 'Digital Network Exploitation Analyst, Team Lead',
        company: 'Department of Defense',
        logo: '', start: '07/2024', end: 'PRESENT',
        technologies: [], description: [],
    }],
    skills: {
        header: '', intro: '',
        categories: [{ id: 'languages', label: 'Languages' }],
        skills: [{ image: '', name: 'Python', category: 'languages' }],
        certifications: [{ name: 'PNPT', image: '', url: 'https://example.com/cred' }],
    },
    socials: ['https://github.com/example', 'https://linkedin.com/in/example'],
};

function parse(raw: string) {
    return JSON.parse(raw.replace(/\\u003c/g, '<'));
}

describe('buildPersonSchema', () => {
    it('describes the person from content', () => {
        const schema = parse(buildPersonSchema(input));

        expect(schema['@type']).toBe('Person');
        expect(schema.name).toBe('Blaise Aranador');
        expect(schema.url).toBe('https://example.com');
        expect(schema.jobTitle).toBe('Digital Network Exploitation Analyst, Team Lead');
        expect(schema.worksFor.name).toBe('Department of Defense');
        expect(schema.knowsAbout).toEqual(['Python']);
    });

    // Person.image must be the person, not the composed share card, and it has
    // to be absolute — crawlers do not resolve relative paths.
    it('uses the absolute portrait, not the share card', () => {
        const schema = parse(buildPersonSchema(input));

        expect(schema.image).toBe('https://example.com/hero.jpg');
    });

    // sameAs is how a search engine ties the name to corroborating profiles.
    it('lists every social profile as sameAs', () => {
        const schema = parse(buildPersonSchema(input));

        expect(schema.sameAs).toEqual(input.socials);
    });

    it('splits the location into locality and region', () => {
        const schema = parse(buildPersonSchema(input));

        expect(schema.address).toEqual({
            '@type': 'PostalAddress',
            addressLocality: 'Honolulu',
            addressRegion: "Hawai'i",
        });
    });

    it('treats a single-part location as the locality alone', () => {
        const schema = parse(buildPersonSchema({
            ...input,
            contact: { ...input.contact, headquarters: 'Honolulu' },
        }));

        expect(schema.address).toEqual({ '@type': 'PostalAddress', addressLocality: 'Honolulu' });
    });

    // On the page for humans; in machine-readable markup it is just a gift to
    // the scrapers that build cold-call lists.
    it('never publishes the phone number', () => {
        expect(buildPersonSchema(input)).not.toContain('555-0100');
    });

    // A stray "</script>" inside content would otherwise close the tag early.
    it('escapes angle brackets so content cannot break out of the script tag', () => {
        const schema = buildPersonSchema({
            ...input,
            seo: { ...input.seo, description: 'Ends with </script><img onerror=alert(1)>' },
        });

        expect(schema).not.toContain('</script>');
        expect(schema).toContain('\\u003c');
    });

    it('omits optional blocks rather than emitting empty ones', () => {
        const schema = parse(buildPersonSchema({
            ...input,
            experiences: [],
            socials: [],
            skills: { ...input.skills, skills: [], certifications: [] },
        }));

        expect(schema.jobTitle).toBeUndefined();
        expect(schema.sameAs).toBeUndefined();
        expect(schema.knowsAbout).toBeUndefined();
        expect(schema.hasCredential).toBeUndefined();
    });
});
