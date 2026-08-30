// schema.org Person markup, assembled entirely from the content files so it can
// never drift from what the page actually says. Google uses this for knowledge
// panels and rich results; `sameAs` in particular is how it links a name to the
// profiles that corroborate it.
//
// The phone number is deliberately omitted. It is on the page for humans, but
// putting it in machine-readable markup is an open invitation to the scrapers
// that harvest structured data for cold-call lists.
type StructuredDataInput = {
    seo: SeoProps;
    // The portrait, not seo.image — that one is the composed share card, and
    // schema.org expects Person.image to be a picture of the person.
    portrait: string;
    contact: ContactProps;
    experiences: Array<Experience>;
    skills: SkillsProps;
    socials: Array<string>;
};

function absolute(url: string, path: string): string {
    return path.startsWith('http') ? path : `${url.replace(/\/$/, '')}${path}`;
}

// "Honolulu, Hawai'i" -> locality + region. Anything without a comma is treated
// as the locality alone rather than guessed at.
function postalAddress(headquarters: string): Record<string, string> {
    const [locality = headquarters.trim(), region] = headquarters.split(',').map((part) => part.trim());
    return {
        '@type': 'PostalAddress',
        addressLocality: locality,
        ...(region ? { addressRegion: region } : {}),
    };
}

export function buildPersonSchema({ seo, portrait, contact, experiences, skills, socials }: StructuredDataInput): string {
    const current = experiences[0];

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: seo.name,
        url: seo.url,
        image: absolute(seo.url, portrait),
        description: seo.description,
        email: `mailto:${contact.email}`,
        address: postalAddress(contact.headquarters),
        ...(current
            ? {
                jobTitle: current.title,
                worksFor: { '@type': 'Organization', name: current.company },
            }
            : {}),
        ...(skills.skills.length > 0
            ? { knowsAbout: skills.skills.map((skill: Skill) => skill.name) }
            : {}),
        ...((skills.certifications ?? []).length > 0
            ? {
                hasCredential: (skills.certifications ?? []).map((certification: Certification) => ({
                    '@type': 'EducationalOccupationalCredential',
                    name: certification.name,
                    url: certification.url,
                })),
            }
            : {}),
        ...(socials.length > 0 ? { sameAs: socials } : {}),
    };

    // Escaping "<" stops a stray "</script>" inside content from closing the
    // tag early — the one injection route a JSON-LD block actually has.
    return JSON.stringify(schema).replace(/</g, '\\u003c');
}
