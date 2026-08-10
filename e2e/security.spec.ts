import { test, expect } from '@playwright/test';

const SECURITY_HEADERS = [
    'content-security-policy',
    'x-frame-options',
    'x-content-type-options',
    'referrer-policy',
    'permissions-policy',
];

test.describe('security', () => {
    test('sends every security header and no framework fingerprint', async ({ request }) => {
        const response = await request.get('/');
        const headers = response.headers();

        for (const header of SECURITY_HEADERS) {
            expect(headers[header], `${header} present`).toBeTruthy();
        }
        expect(headers['x-powered-by'], 'framework not advertised').toBeUndefined();
        expect(headers['content-security-policy']).toContain("object-src 'none'");
        expect(headers['content-security-policy']).toContain("frame-ancestors 'self'");
    });

    // A wrong method is a client error. Health returning 500 made uptime probes,
    // which commonly use HEAD, report the service as down.
    test('rejects wrong methods with 405 and advertises what is allowed', async ({ request }) => {
        const cases: Array<{ path: string; allow: string }> = [
            { path: '/api/health', allow: 'GET' },
            { path: '/api/resume', allow: 'GET' },
            { path: '/api/contact', allow: 'POST' },
        ];
        for (const { path, allow } of cases) {
            const response = await request.fetch(path, { method: 'PUT' });
            expect(response.status(), `${path} rejects PUT`).toBe(405);
            expect(response.headers()['allow'], `${path} advertises Allow`).toBe(allow);
        }
    });

    test('validates contact submissions and never echoes internals', async ({ request }) => {
        const empty = await request.post('/api/contact', { data: {} });
        expect(empty.status()).toBe(400);

        const tooLong = await request.post('/api/contact', {
            data: { name: 'a', email: 'a@b.co', subject: 's', message: 'x'.repeat(5001) },
        });
        expect(tooLong.status()).toBe(400);
        expect(await tooLong.text()).not.toMatch(/\/app\/|at \w+ \(|ENOENT/);
    });

    test('keeps the resume endpoint closed without a token', async ({ request }) => {
        const response = await request.get('/api/resume');
        expect(response.status()).toBe(404);
    });

    // The limiter keys off the LAST X-Forwarded-For hop, the one nginx appends.
    // Reading the first would let a caller forge a fresh bucket per request.
    test('rate limits by the real client, not a forged X-Forwarded-For', async ({ request }) => {
        const body = { name: 'Rate', email: 'rate@example.com', subject: 'Test', message: 'Test' };
        const statuses: Array<number> = [];
        for (let i = 0; i < 8; i++) {
            const response = await request.post('/api/contact', {
                data: body,
                headers: { 'x-forwarded-for': `9.9.9.${i}, 203.0.113.77` },
            });
            statuses.push(response.status());
        }
        expect(statuses, 'forged hops did not mint fresh buckets').toContain(429);
    });

    test('serves themed error pages that disclose nothing', async ({ request }) => {
        const notFound = await request.get('/definitely-not-a-page');
        expect(notFound.status()).toBe(404);
        const body = await notFound.text();
        expect(body).toContain('No such file or directory');
        expect(body).not.toMatch(/\/app\/|\/workspaces\/|at \w+ \(/);
    });
});
