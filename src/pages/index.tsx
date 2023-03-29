import Head from 'next/head';
import Overlay from '@/components/Overlay';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Experience from '@/components/Experience';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
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
                    <Hero />
                </section>

                {/* about */}
                <section
                    id='about'
                    className='snap-start'
                >
                    <About />
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
