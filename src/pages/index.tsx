import Head from 'next/head';
import Overlay from '@/components/Overlay';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Experience from '@/components/Experience';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

type Props = {
    hero: APIHero;
    about: APIAbout;
};

export default function Home({ hero, about }: Props) {
    return (
        <>
            <Head>
                <title>Invictus808</title>
            </Head>
            <div
                className='bg-[rgb(36,36,36)] text-white w-screen h-screen snap-y snap-mandatory overflow-x-hidden overflow-y-scroll scroll-smooth z-0 scrollbar-thin scrollbar-track-gray-400/20 scrollbar-thumb-[#FF0000]/80'
            >
                {/* overlay */}
                <Overlay />

                {/* hero */}
                <section
                    id='hero'
                    className='snap-start'
                >
                    <Hero
                        {...hero}
                    />
                </section>

                {/* about */}
                <section
                    id='about'
                    className='snap-start'
                >
                    <About
                        {...about}
                    />
                </section>

                {/* experience */}
                <section
                    id='experience'
                    className='snap-start'
                >
                    <Experience />
                </section>

                {/* skills */}
                <section
                    id='skills'
                    className='snap-start'
                >
                    <Skills />
                </section>

                {/* projects */}
                <section
                    id='projects'
                    className='snap-start'
                >
                    <Projects />
                </section>

                {/* contact */}
                <section
                    id='contact'
                    className='snap-start'
                >
                    <Contact />
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
    const heroResponse = await fetch(`${process.env.API_URL}/hero`);
    const hero: APIHero = await heroResponse.json();
    const aboutResponse = await fetch(`${process.env.API_URL}/about`);
    const about: APIAbout = await aboutResponse.json();
    console.log(about);

    return {
        props: {
            hero: hero,
            about: about,
        },
    };
}
