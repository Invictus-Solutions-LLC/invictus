import Head from 'next/head';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Experience from '@/components/Experience';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';

export default function Home() {
    return (
        <>
            <Head>
                <title>Invictus808</title>
            </Head>
            <div
                className='bg-[rgb(36,36,36)] text-white h-screen snap-y snap-mandatory overflow-scroll scroll-smooth z-0'
            >
                {/* header */}
                <Header />

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
                    className='snap-center'
                >
                    <About />
                </section>

                {/* experience */}
                <section
                    id='experience'
                    className='snap-center'
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
            </div>
        </>
    );
}
