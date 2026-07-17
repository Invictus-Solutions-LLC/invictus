import Head from 'next/head';
import {
    getHeroContent,
    getAboutContent,
    getExperienceContent,
    getSkillsContent,
    getProjectsContent,
    getContactContent,
    getSocialsContent,
    getFooterContent,
} from '@/lib/content';
import BootSequence from '@/components/BootSequence';
import MatrixRain from '@/components/MatrixRain';
import Overlay from '@/components/Overlay';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Experience from '@/components/Experience';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

type Props = {
    heroProps: HeroProps;
    aboutProps: AboutProps;
    experienceProps: ExperienceProps;
    skillsProps: SkillsProps;
    projectsProps: ProjectsProps;
    contactProps: ContactProps;
    socialsProps: SocialsProps;
    footerProps: FooterProps;
};

export default function Home({ heroProps, aboutProps, experienceProps, skillsProps, projectsProps, contactProps, socialsProps, footerProps }: Props) {
    return (
        <>
            <Head>
                <title>Invictus808</title>
                <meta
                    name='description'
                    content='Invictus808 — software engineering portfolio. Experience, skills, and projects, served from a terminal near you.'
                />
                <meta
                    name='theme-color'
                    content='#242424'
                />
                <meta
                    property='og:title'
                    content='Invictus808'
                />
                <meta
                    property='og:description'
                    content='Invictus808 — software engineering portfolio. Experience, skills, and projects, served from a terminal near you.'
                />
                <meta
                    property='og:type'
                    content='website'
                />
                <meta
                    property='og:image'
                    content='/android-chrome-512x512.png'
                />
                <meta
                    name='twitter:card'
                    content='summary'
                />
            </Head>
            <div
                className='bg-[rgb(36,36,36)] text-white w-full h-dvh snap-y snap-mandatory overflow-x-hidden overflow-y-scroll scroll-smooth z-0 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#FF0000]/70 scrollbar-thumb-rounded-full'
            >
                {/* one-time boot sequence intro */}
                <BootSequence />

                {/* matrix rain background */}
                <MatrixRain />

                {/* crt scanline overlay */}
                <div
                    className='scanlineOverlay'
                />

                {/* overlay */}
                <Overlay
                    {...socialsProps}
                />

                {/* hero */}
                <section
                    id='hero'
                    className='snap-start'
                >
                    <Hero
                        {...heroProps}
                    />
                </section>

                {/* about */}
                <section
                    id='about'
                    className='snap-start'
                >
                    <About
                        {...aboutProps}
                    />
                </section>

                {/* experience */}
                <section
                    id='experience'
                    className='snap-start'
                >
                    <Experience
                        {...experienceProps}
                    />
                </section>

                {/* skills */}
                <section
                    id='skills'
                    className='snap-start'
                >
                    <Skills
                        {...skillsProps}
                    />
                </section>

                {/* projects */}
                <section
                    id='projects'
                    className='snap-start'
                >
                    <Projects
                        {...projectsProps}
                    />
                </section>

                {/* contact */}
                <section
                    id='contact'
                    className='snap-start'
                >
                    <Contact
                        {...contactProps}
                    />
                </section>

                {/* footer */}
                <section
                    id='footer'
                    className='snap-start'
                >
                    <Footer
                        {...footerProps}
                    />
                </section>
            </div>
        </>
    );
}

export async function getServerSideProps() {
    return {
        props: {
            heroProps: getHeroContent(),
            aboutProps: getAboutContent(),
            experienceProps: getExperienceContent(),
            skillsProps: getSkillsContent(),
            projectsProps: getProjectsContent(),
            contactProps: getContactContent(),
            socialsProps: getSocialsContent(),
            footerProps: getFooterContent(),
        },
    };
}
