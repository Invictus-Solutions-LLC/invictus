import Head from 'next/head';
import Header from '@/components/Header';
import Hero from '@/components/Hero';

export default function Home() {
    return (
        <>
            <Head>
                <title>Invictus808</title>
            </Head>
            <div
                className='bg-[rgb(36,36,36)] text-white h-screen snap-y snap-mandatory overflow-scroll z-0'
            >
                {/* header */}
                <Header />

                {/* hero */}
                <section
                    id='hero'
                    className='snap-center'
                >
                    <Hero />
                </section>

                {/* about */}

                {/* experience */}

                {/* skills */}

                {/* projects */}

                {/* contact */}
            </div>
        </>
    );
}
