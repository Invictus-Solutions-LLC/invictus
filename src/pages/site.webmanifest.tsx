import type { GetServerSideProps } from 'next';
import { getSeoContent } from '@/lib/content';

// Generated rather than static so the name comes from content. Without this the
// android-chrome-*.png icons in public/ are dead weight — nothing references
// them, and Android has no icon to use when a visitor adds the site to their
// home screen.
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    // These serve one document to crawlers. Anything but a read is a client
    // error, and answering POST with a 200 the way a bare getServerSideProps
    // does is sloppier than the API routes beside it.
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        // getServerSideProps hands back a plain Node ServerResponse, not the
        // API-route wrapper, so the status is set directly.
        res.statusCode = 405;
        res.setHeader('Allow', 'GET, HEAD');
        res.end();
        return { props: {} };
    }

    const seo = getSeoContent();

    const manifest = {
        name: seo.name,
        short_name: seo.shortName,
        description: seo.description,
        start_url: '/',
        display: 'standalone',
        // Matches --color-bg / :root in globals.css, the dark default a
        // first-time visitor sees.
        background_color: '#071A22',
        theme_color: '#071A22',
        icons: [
            { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
    };

    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.write(JSON.stringify(manifest, null, 2));
    res.end();

    return { props: {} };
};

// Never rendered — getServerSideProps writes the response directly.
export default function Manifest() {
    return null;
}
