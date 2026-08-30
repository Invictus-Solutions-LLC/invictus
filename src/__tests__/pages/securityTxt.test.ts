import { createMocks, type RequestMethod } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';

jest.mock('@/lib/content', () => ({
    getSeoContent: jest.fn(() => ({
        name: 'Ada Lovelace', shortName: 'Ada', title: 'Ada — Engineer',
        description: 'A description.', url: 'https://example.com/',
        image: '/og.jpg', imageAlt: 'Ada',
    })),
}));

import { getServerSideProps } from '@/pages/security.txt';

async function fetchIt(method: RequestMethod = 'GET') {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method });
    await (getServerSideProps as unknown as (ctx: { req: NextApiRequest; res: NextApiResponse }) => Promise<unknown>)({ req, res });
    return { req, res };
}

describe('/.well-known/security.txt', () => {
    // RFC 9116 requires Expires, and says a client SHOULD treat an expired file
    // as stale. The previous static file carried a fixed date, so the policy
    // would have quietly stopped counting on a day nobody was watching for.
    it('never serves an expired policy', async () => {
        const { res } = await fetchIt();
        const body = res._getData() as string;

        const expires = /^Expires: (\S+)$/m.exec(body)?.[1];
        expect(expires).toBeDefined();

        const when = new Date(expires as string);
        expect(Number.isNaN(when.getTime())).toBe(false);
        expect(when.getTime()).toBeGreaterThan(Date.now());
        // Comfortably in the future, not expiring next week.
        expect(when.getTime() - Date.now()).toBeGreaterThan(300 * 24 * 60 * 60 * 1000);
    });

    // Byte-stability matters: an Expires carrying milliseconds changed on every
    // request, which defeats caching and makes a regenerated file look rewritten.
    it('is byte-identical across requests within a day', async () => {
        const first = (await fetchIt()).res._getData();
        const second = (await fetchIt()).res._getData();

        expect(first).toBe(second);
    });

    // The domain comes from content, which is the whole reason this stopped
    // being a static file — the old one hardcoded it twice.
    it('takes its URLs from content and normalises a trailing slash', async () => {
        const body = (await fetchIt()).res._getData() as string;

        expect(body).toContain('Contact: https://example.com/#contact');
        expect(body).toContain('Canonical: https://example.com/.well-known/security.txt');
        expect(body).not.toContain('example.com//');
        expect(body).not.toMatch(/invictus808/);
    });

    it('rejects anything but a read', async () => {
        const { res } = await fetchIt('POST');

        expect(res._getStatusCode()).toBe(405);
        expect(res.getHeader('Allow')).toBe('GET, HEAD');
    });
});
