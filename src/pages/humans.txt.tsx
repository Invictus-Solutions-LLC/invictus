import type { GetServerSideProps } from 'next';
import { getContactContent, getSeoContent, getSocialsContent } from '@/lib/content';

// The older sibling of /.well-known/security.txt, and the same idea from the
// other direction: security.txt says who to tell when something is wrong,
// humans.txt says who made the thing. It is a convention from humanstxt.org
// that nothing consumes automatically — it exists for the one visitor who
// thinks to look, which is the whole appeal.
//
// Built from content like every other generated route, so a fork gets its own
// author rather than this one.
function toHumans(): string {
    const { name, url } = getSeoContent();
    const { email, headquarters } = getContactContent();
    const socials = getSocialsContent().socials;

    return [
        '/* TEAM */',
        `    Engineer: ${name}`,
        `    Site: ${url}`,
        `    Contact: ${email}`,
        `    Location: ${headquarters}`,
        '',
        '/* FIND ME */',
        ...socials.map((social: string) => { return `    ${social}`; }),
        '',
        '/* SITE */',
        '    Standards: HTML5, CSS3, ES2023',
        '    Components: Next.js, TypeScript, Tailwind CSS',
        '    Software: written in vim and VS Code, shipped in Docker',
        '',
        '    Built on an island. Press \u2318K (Ctrl+K) if you would rather just ask.',
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
    res.write(toHumans());
    res.end();

    return { props: {} };
};

// Never rendered — getServerSideProps writes the response directly.
export default function Humans() {
    return null;
}
