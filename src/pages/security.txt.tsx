import type { GetServerSideProps } from 'next';
import { getSeoContent } from '@/lib/content';

// RFC 9116. Served from a route rather than public/.well-known/ for the same
// two reasons as robots.txt and sitemap.xml: the URLs in it must be absolute,
// and the domain belongs in content rather than hardcoded into a tracked file.
//
// Expires is the reason this could not stay static. RFC 9116 requires the field
// and says clients SHOULD treat an expired file as stale — so a hardcoded date
// silently invalidates the policy on a day nobody is watching for. Generated on
// each request, it is always a year out and always accurate, because the file
// really is produced from the current configuration every time it is read.
const EXPIRY_DAYS = 365;

function toSecurityTxt(url: string): string {
    const origin = url.replace(/\/$/, '');
    // Rounded down to midnight UTC so the file is byte-identical all day.
    // Left at millisecond precision it changed on every request, which defeats
    // caching and makes a policy that is merely regenerated look rewritten.
    const expires = new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    expires.setUTCHours(0, 0, 0, 0);

    return [
        '# Security policy for this site (RFC 9116)',
        '# If you have found a vulnerability here, thank you for reporting it responsibly.',
        '',
        `Contact: ${origin}/#contact`,
        `Expires: ${expires.toISOString()}`,
        'Preferred-Languages: en',
        `Canonical: ${origin}/.well-known/security.txt`,
        '',
    ].join('\n');
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.statusCode = 405;
        res.setHeader('Allow', 'GET, HEAD');
        res.end();
        return { props: {} };
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.write(toSecurityTxt(getSeoContent().url));
    res.end();

    return { props: {} };
};

// Never rendered — getServerSideProps writes the response directly.
export default function SecurityTxt() {
    return null;
}
