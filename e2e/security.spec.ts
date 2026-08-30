import { test, expect } from '@playwright/test';
import { gotoHome } from './helpers';

const SECURITY_HEADERS = [
    'content-security-policy',
    'x-frame-options',
    'x-content-type-options',
    'referrer-policy',
    'permissions-policy',
];

test.describe('seo', () => {
    test('ships a complete, canonical head', async ({ page }) => {
        await gotoHome(page);

        await expect(page).toHaveTitle(/\S/);
        const head = async (selector: string) =>
            page.locator(selector).first().getAttribute('content');

        expect(await head('meta[name="description"]')).toBeTruthy();
        expect(await head('meta[property="og:title"]')).toBeTruthy();
        expect(await head('meta[property="og:description"]')).toBeTruthy();
        expect(await head('meta[name="twitter:card"]')).toBe('summary_large_image');

        // Absolute, or a crawler cannot resolve it.
        expect(await head('meta[property="og:image"]')).toMatch(/^https?:\/\//);
        expect(await head('meta[property="og:url"]')).toMatch(/^https?:\/\//);
        expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toMatch(/^https?:\/\//);
    });

    // A JSON-LD block is a data block rather than an executed script, so the
    // strict CSP should let it through without a hash. This proves it.
    test('emits valid Person structured data under the production policy', async ({ page }) => {
        const violations: Array<string> = [];
        page.on('console', (message) => {
            if (/Content Security Policy/i.test(message.text())) {
                violations.push(message.text());
            }
        });

        await gotoHome(page);

        const raw = await page.locator('script[type="application/ld+json"]').textContent();
        const schema = JSON.parse(raw!);

        expect(schema['@type']).toBe('Person');
        expect(schema.name).toBeTruthy();
        expect(Array.isArray(schema.sameAs)).toBe(true);
        expect(violations).toEqual([]);
    });

    test('serves robots.txt pointing at an absolute sitemap', async ({ request }) => {
        const response = await request.get('/robots.txt');

        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toContain('text/plain');
        const body = await response.text();
        expect(body).toContain('Disallow: /api/');
        expect(body).toMatch(/Sitemap: https?:\/\/\S+\/sitemap\.xml/);
    });

    test('serves a web manifest that names the icons', async ({ request }) => {
        const response = await request.get('/site.webmanifest');

        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toContain('manifest');
        const manifest = await response.json();
        expect(manifest.name).toBeTruthy();
        expect(manifest.icons.length).toBeGreaterThan(0);
    });

    // They serve one document to crawlers; answering POST with a 200, the way a
    // bare getServerSideProps does, is sloppier than the API routes beside them.
    test('the generated routes accept reads and reject the rest', async ({ request }) => {
        for (const path of ['/robots.txt', '/sitemap.xml', '/site.webmanifest']) {
            expect((await request.get(path)).status(), `GET ${path}`).toBe(200);

            const rejected = await request.fetch(path, { method: 'POST' });
            expect(rejected.status(), `POST ${path}`).toBe(405);
            expect(rejected.headers()['allow'], `Allow on ${path}`).toBe('GET, HEAD');
        }
    });

    test('serves a valid sitemap', async ({ request }) => {
        const response = await request.get('/sitemap.xml');

        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toContain('xml');
        const body = await response.text();
        expect(body).toContain('<urlset');
        expect(body).toMatch(/<loc>https?:\/\/\S+<\/loc>/);
    });
});

// The ask endpoint allows 10 questions per caller per 10 minutes, and every
// request from this suite otherwise arrives as the same 127.0.0.1. That budget
// is a property under test elsewhere, not something these checks should be
// competing for: each one takes its own bucket so it asserts what it claims to
// — validation, not whatever the limiter happens to have left. The app reads
// the LAST X-Forwarded-For hop and playwright.config.ts sets TRUST_PROXY.
function askAs(ip: string): Record<string, string> {
    return { 'x-forwarded-for': ip };
}

test.describe('security', () => {
    test('sends every security header and no framework fingerprint', async ({ request }) => {
        const response = await request.get('/');
        const headers = response.headers();

        for (const header of SECURITY_HEADERS) {
            expect(headers[header], `${header} present`).toBeTruthy();
        }
        expect(headers['x-powered-by'], 'framework not advertised').toBeUndefined();
        const csp = headers['content-security-policy']!;
        expect(csp).toContain("object-src 'none'");
        expect(csp).toContain("frame-ancestors 'self'");
        // The pre-paint theme script is inline, but allowed by hash — the policy
        // must never fall back to blanket 'unsafe-inline' for scripts.
        expect(csp).toMatch(/script-src 'self' 'sha256-[A-Za-z0-9+/=]+'/);
        expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    });

    // The inline theme script only runs if its hash matches the policy exactly.
    // If it is ever blocked, every visitor silently gets the dark theme
    // regardless of what they chose — so assert the browser actually ran it.
    test('runs the pre-paint theme script under the production policy', async ({ page }) => {
        const violations: Array<string> = [];
        page.on('console', (message) => {
            if (/Content Security Policy/i.test(message.text())) {
                violations.push(message.text());
            }
        });

        await page.addInitScript(() => {
            try {
                window.localStorage.setItem('theme', 'light');
            } catch {
                // Falls through to the dark default.
            }
        });
        await gotoHome(page);

        await expect(page.locator('html')).toHaveClass(/light/);
        expect(violations, 'no CSP violation from the inline theme script').toEqual([]);
    });

    // A wrong method is a client error. Health returning 500 made uptime probes,
    // which commonly use HEAD, report the service as down.
    test('rejects wrong methods with 405 and advertises what is allowed', async ({ request }) => {
        const cases: Array<{ path: string; allow: string }> = [
            { path: '/api/health', allow: 'GET' },
            { path: '/api/resume', allow: 'GET' },
            { path: '/api/contact', allow: 'POST' },
            { path: '/api/ask', allow: 'POST' },
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

    // No ANTHROPIC_API_KEY is set for the e2e run, which is the same state a
    // fresh deploy is in. It must answer 503 — never 500, and never a stack
    // trace — so the palette can fall back to plain navigation.
    test('reports the ask endpoint as unconfigured rather than failing', async ({ request }) => {
        const response = await request.post('/api/ask', {
            data: { question: 'do you know kubernetes?' },
            headers: askAs('198.51.100.1'),
        });

        expect(response.status()).toBe(503);
        expect(await response.text()).not.toMatch(/\/app\/|at \w+ \(|ANTHROPIC/i);
    });

    // Validation runs before configuration is consulted, so a malformed request
    // gets the same 400 whether or not answering is switched on.
    test('validates ask submissions before spending anything upstream', async ({ request }) => {
        const cases = [{}, { question: 'hi' }, { question: 'x'.repeat(301) }, { question: 42 }];

        for (const [index, data] of cases.entries()) {
            const response = await request.post('/api/ask', {
                data,
                headers: askAs(`198.51.100.${index + 10}`),
            });
            expect(response.status(), JSON.stringify(data)).toBe(400);
        }
    });

    // A body over the parser's ceiling is refused before it is read into memory,
    // so it never reaches the length check that would have returned 400.
    test('refuses an oversized ask body outright', async ({ request }) => {
        const response = await request.post('/api/ask', {
            data: { question: 'x'.repeat(20_000) },
            headers: askAs('198.51.100.50'),
        });

        expect(response.status()).toBe(413);
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
        expect(body).toContain('drifted off the map');
        expect(body).not.toMatch(/\/app\/|\/workspaces\/|at \w+ \(/);
    });
});
