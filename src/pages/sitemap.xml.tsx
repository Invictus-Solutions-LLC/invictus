import type { GetServerSideProps } from 'next';
import { getContentLastModified, getSeoContent } from '@/lib/content';

// Served from a route rather than public/ so the absolute URL comes from
// content — a static file would have to hardcode the domain.
function toXml(url: string, lastModified: Date | null): string {
    const origin = url.replace(/\/$/, '');
    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        '  <url>',
        `    <loc>${origin}/</loc>`,
        // Omitted rather than guessed when the content directory is unreadable:
        // an absent lastmod costs nothing, a wrong one teaches the crawler to
        // ignore the field.
        ...(lastModified
            ? [`    <lastmod>${lastModified.toISOString().slice(0, 10)}</lastmod>`]
            : []),
        '    <changefreq>monthly</changefreq>',
        '    <priority>1.0</priority>',
        '  </url>',
        '</urlset>',
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

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.write(toXml(url, getContentLastModified()));
    res.end();

    return { props: {} };
};

// Never rendered — getServerSideProps writes the response directly.
export default function Sitemap() {
    return null;
}
