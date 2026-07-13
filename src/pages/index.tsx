import Head from 'next/head';
import {
    getHeroContent,
    getAboutContent,
    getExperienceContent,
    getSkillsContent,
    getProjectsContent,
    getContactContent,
} from '@/lib/content';
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
};

export default function Home({ heroProps, aboutProps, experienceProps, skillsProps, projectsProps, contactProps }: Props) {
    return (
        <>
            <Head>
                <title>Invictus808</title>
            </Head>
            <div
                className='bg-[rgb(36,36,36)] text-white w-screen h-screen snap-y snap-mandatory overflow-x-hidden overflow-y-scroll scroll-smooth z-0 scrollbar-thin scrollbar-track-gray-400/20 scrollbar-thumb-[#FF0000]/80'
            >
                {/* crt scanline overlay */}
                <div
                    className='scanlineOverlay'
                />

                {/* overlay */}
                <Overlay />

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
                    <Footer />
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
        },
    };
}
