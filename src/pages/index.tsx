import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
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
import BootSequence from '@/components/BootSequence';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import SwellDivider from '@/components/SwellDivider';
import Work from '@/components/Work';
import Skills from '@/components/Skills';
import Lab from '@/components/Lab';
import Experience from '@/components/Experience';
import Process from '@/components/Process';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import CommandPalette from '@/components/CommandPalette';
import type { PaletteCommand } from '@/components/CommandPalette';
import { buildPersonSchema } from '@/lib/structuredData';

type Props = {
    heroProps: HeroProps;
    aboutProps: AboutProps;
    experienceProps: ExperienceProps;
    skillsProps: SkillsProps;
    projectsProps: ProjectsProps;
    processProps: ProcessProps;
    labProps: LabProps;
    contactProps: ContactProps;
    socialsProps: SocialsProps;
    footerProps: FooterProps;
    seoProps: SeoProps;
    askProps: AskProps;
    bootProps: BootProps;
    personSchema: string;
};

function hostOf(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return 'link';
    }
}

export default function Home({
    heroProps,
    aboutProps,
    experienceProps,
    skillsProps,
    projectsProps,
    processProps,
    labProps,
    contactProps,
    socialsProps,
    footerProps,
    seoProps,
    askProps,
    bootProps,
    personSchema,
}: Props) {
    const [paletteOpen, setPaletteOpen] = useState(false);
    // Whatever had focus when the palette opened, so closing it doesn't drop a
    // keyboard user back at the top of the document.
    const restoreFocusRef = useRef<HTMLElement | null>(null);

    const openPalette = useCallback(() => {
        restoreFocusRef.current = document.activeElement as HTMLElement | null;
        setPaletteOpen(true);
    }, []);

    const closePalette = useCallback(() => {
        setPaletteOpen(false);
        restoreFocusRef.current?.focus?.();
    }, []);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                setPaletteOpen((open) => {
                    if (!open) {
                        restoreFocusRef.current = document.activeElement as HTMLElement | null;
                    }
                    return !open;
                });
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    // Every entry comes from content, so the palette can never drift out of step
    // with what the page actually shows.
    const commands = useMemo<Array<PaletteCommand>>(() => {
        const sections: Array<PaletteCommand> = [
            { id: 'go-work', label: "Things I've built", hint: 'work', group: 'Go to', href: '#work', external: false },
            { id: 'go-experience', label: 'Where I have worked', hint: 'experience', group: 'Go to', href: '#experience', external: false },
            { id: 'go-skills', label: skillsProps.header, hint: 'skills', group: 'Go to', href: '#skills', external: false },
            { id: 'go-lab', label: labProps.header, hint: 'lab', group: 'Go to', href: '#lab', external: false },
            { id: 'go-process', label: processProps.header, hint: 'process', group: 'Go to', href: '#process', external: false },
            { id: 'go-contact', label: contactProps.cta.header, hint: 'contact', group: 'Go to', href: '#contact', external: false },
        ];

        const projects: Array<PaletteCommand> = projectsProps.projects.map((project: Project) => {
            return {
                id: `project-${project.name}`,
                label: project.name,
                hint: hostOf(project.url),
                group: 'Projects',
                href: project.url,
                external: true,
            };
        });

        const credentials: Array<PaletteCommand> = (skillsProps.certifications ?? []).map((certification: Certification) => {
            return {
                id: `credential-${certification.name}`,
                label: `Verify ${certification.name}`,
                hint: 'credential',
                group: 'Projects',
                href: certification.url,
                external: true,
            };
        });

        const elsewhere: Array<PaletteCommand> = socialsProps.socials.map((social: string) => {
            return {
                id: `social-${social}`,
                label: hostOf(social),
                hint: 'profile',
                group: 'Elsewhere',
                href: social,
                external: true,
            };
        });

        const email: PaletteCommand = {
            id: 'email',
            label: `Email ${contactProps.email}`,
            hint: 'mail',
            group: 'Elsewhere',
            href: `mailto:${contactProps.email}`,
            external: true,
        };

        return [...sections, ...projects, ...credentials, email, ...elsewhere];
    }, [contactProps, labProps, processProps, projectsProps, skillsProps, socialsProps]);

    return (
        <>
            <Head>
                <title>{seoProps.title}</title>
                <meta name='description' content={seoProps.description} />
                {/* One canonical URL for a single-page site — without it, any
                    link carrying a tracking query is a separate page to a crawler. */}
                <link rel='canonical' href={seoProps.url} />
                {/* Mobile browser chrome follows the palette. A single value
                    would leave the address bar dark for a visitor in light mode. */}
                <meta name='theme-color' content='#071A22' media='(prefers-color-scheme: dark)' />
                <meta name='theme-color' content='#EDF4F6' media='(prefers-color-scheme: light)' />

                <meta property='og:type' content='profile' />
                <meta property='og:site_name' content={seoProps.name} />
                <meta property='og:title' content={seoProps.title} />
                <meta property='og:description' content={seoProps.description} />
                <meta property='og:url' content={seoProps.url} />
                <meta property='og:image' content={`${seoProps.url}${seoProps.image}`} />
                {/* Declared so a scraper can lay the card out from the tags
                    alone. LinkedIn in particular renders a small thumbnail on
                    first share when it has to fetch the file to measure it.
                    These match scripts/generate-og-image.mjs, which emits the
                    1200x630 the platforms expect. */}
                <meta property='og:image:width' content='1200' />
                <meta property='og:image:height' content='630' />
                <meta property='og:image:type' content='image/jpeg' />
                <meta property='og:image:alt' content={seoProps.imageAlt} />
                <meta property='og:locale' content='en_US' />

                <meta name='twitter:card' content='summary_large_image' />
                <meta name='twitter:title' content={seoProps.title} />
                <meta name='twitter:description' content={seoProps.description} />
                <meta name='twitter:image' content={`${seoProps.url}${seoProps.image}`} />
                <meta name='twitter:image:alt' content={seoProps.imageAlt} />

                {/* schema.org Person, built from the same content the page
                    renders. A JSON-LD block is a data block, not an executed
                    script, so the strict CSP does not need a hash for it. */}
                <script
                    type='application/ld+json'
                    dangerouslySetInnerHTML={{ __html: personSchema }}
                />
            </Head>

            <BootSequence {...bootProps} />

            <a
                href='#main'
                className='sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50
                           focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm
                           focus:font-semibold focus:text-accent-ink'
            >
                Skip to content
            </a>

            <Header
                ctaLabel={contactProps.linkLabel}
                askLabel={askProps.triggerLabel}
                onOpenPalette={openPalette}
            />

            <main id='main'>
                <section
                    id='hero'
                    aria-label='Introduction'
                >
                    <Hero
                        {...heroProps}
                        paragraphs={aboutProps.text}
                        certification={skillsProps.certifications?.[0]}
                    />
                </section>

                <div className='mx-auto w-full max-w-6xl px-6 md:px-10'>
                    <SwellDivider />
                </div>

                <Work {...projectsProps} />

                <Experience {...experienceProps} />

                <Skills {...skillsProps} />

                <Lab {...labProps} />

                <Process {...processProps} />

                <Contact {...contactProps} />
            </main>

            <Footer
                {...footerProps}
                {...socialsProps}
                name={seoProps.name}
            />

            {
                // Mounted only while open, so each opening starts from a clean
                // query and answer rather than last time's.
                paletteOpen &&
                <CommandPalette
                    onClose={closePalette}
                    commands={commands}
                    examples={askProps.examples}
                    messages={askProps.messages}
                />
            }
        </>
    );
}

export async function getServerSideProps() {
    // Loaded once and shared with the structured-data builder, so the markup
    // and the rendered page can never describe different things.
    const seo = getSeoContent();
    const hero = getHeroContent();
    const contact = getContactContent();
    const experience = getExperienceContent();
    const skills = getSkillsContent();
    const socials = getSocialsContent();

    return {
        props: {
            heroProps: hero,
            aboutProps: getAboutContent(),
            experienceProps: experience,
            skillsProps: skills,
            projectsProps: getProjectsContent(),
            processProps: getProcessContent(),
            labProps: getLabContent(),
            contactProps: contact,
            socialsProps: socials,
            footerProps: getFooterContent(),
            seoProps: seo,
            askProps: getAskContent(),
            bootProps: getBootContent(),
            personSchema: buildPersonSchema({
                seo,
                portrait: hero.image,
                contact,
                experiences: experience.experiences,
                skills,
                socials: socials.socials,
            }),
        },
    };
}
