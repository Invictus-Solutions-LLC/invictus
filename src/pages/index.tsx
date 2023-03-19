import Head from 'next/head';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Experience from '@/components/Experience';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import Link from 'next/link';

export default function Home() {
    return (
        <>
            <Head>
                <title>Invictus808</title>
            </Head>
            <div
                className='bg-[rgb(36,36,36)] text-white h-screen snap-y snap-mandatory overflow-x-hidden overflow-y-scroll scroll-smooth z-0 scrollbar scrollbar-track-gray-400/20 scrollbar-thumb-[#FF0000]/80'
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
                <section
                    id='contact'
                    className='snap-start'
                >
                    <Contact />
                </section>

                <Link
                    href='#hero'
                >
                    <footer
                        className='sticky bottom-5 w-full cursor-pointer'
                    >
                        <div
                            className='flex items-center justify-center'
                        >
                            <img
                                src='https://gitlab.com/uploads/-/system/user/avatar/11223647/avatar.png?width=400'
                                alt='footer picture'
                                className='w-10 h-10 rounded-full filter grayscale hover:grayscale-0'
                            />
                        </div>
                    </footer>
                </Link>
            </div>
        </>
    );
}
