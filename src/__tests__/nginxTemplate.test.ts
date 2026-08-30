import fs from 'node:fs';
import path from 'node:path';

const nextConfig = require('../../next.config.js');

const template = fs.readFileSync(
    path.join(process.cwd(), 'nginx/templates/invictus.conf.template'),
    'utf-8',
);

const addedByNginx = [...template.matchAll(/^\s*add_header\s+([A-Za-z-]+)/gm)]
    .map((m) => { return (m[1] ?? '').toLowerCase(); });

describe('nginx template', () => {
    // nginx's add_header APPENDS to a proxied response instead of replacing,
    // and a browser handed two Content-Security-Policy headers enforces the
    // intersection of both. A copy of the app's CSP in the proxy is therefore
    // not a safety net — it can only subtract. It previously sent
    // `script-src 'self'`, which dropped the sha256 hash for the pre-paint
    // theme script: the theme resolved only after hydration and the `js` class
    // was never set, silently disabling every scroll reveal in production.
    it('never repeats a header the app already sends', async () => {
        const groups = await nextConfig.headers();
        const appHeaders = groups
            .flatMap((g: { headers: { key: string }[] }) => { return g.headers; })
            .map((h: { key: string }) => { return h.key.toLowerCase(); });

        // The app only attaches the CSP in production, so assert it explicitly
        // rather than relying on the env this test happens to run under.
        const forbidden = new Set([...appHeaders, 'content-security-policy']);
        const repeated = addedByNginx.filter((h) => { return forbidden.has(h); });

        expect(repeated).toEqual([]);
    });

    // HSTS is the one header the app cannot set responsibly: it is only valid
    // over TLS, and the app cannot tell whether this proxy terminated HTTPS.
    it('adds HSTS, which the app deliberately leaves to the TLS terminator', () => {
        expect(addedByNginx).toContain('strict-transport-security');

        const directive = template.match(/add_header\s+Strict-Transport-Security\s+"([^"]+)"/i)?.[1];
        expect(directive).toMatch(/max-age=\d{7,}/);
        expect(directive).toMatch(/includeSubDomains/);
    });
});
