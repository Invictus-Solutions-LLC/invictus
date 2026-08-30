import type { GetServerSideProps } from 'next';
import { getSeoContent } from '@/lib/content';

// A route rather than public/robots.txt: the Sitemap directive must be an
// absolute URL, and the domain belongs in content rather than in a tracked file.
function toRobots(url: string): string {
    const origin = url.replace(/\/$/, '');
    return [
        'User-agent: *',
        'Allow: /',
        // Nothing under /api is a page. /api/resume is token-gated and returns
        // 404 without one, but there is no reason to advertise it either.
        'Disallow: /api/',
        '',
        `Sitemap: ${origin}/sitemap.xml`,
        '',
        // For the humans who read robots.txt, which is most of the ones who
        // open it at all.
        '# Hey. There is a /humans.txt too.',
        '',
    ].join('\n');
}

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

    const { url } = getSeoContent();

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.write(toRobots(url));
    res.end();

    return { props: {} };
};

// Never rendered — getServerSideProps writes the response directly.
export default function Robots() {
    return null;
}
