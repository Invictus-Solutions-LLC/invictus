const { contentSecurityPolicy } = require('./config/csp');

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Emits .next/standalone with only the files the server actually needs,
    // traced from the import graph. The alternative is shipping the whole
    // node_modules — 379 MB, of which Next itself is 294 MB.
    output: 'standalone',
    // content/ is gitignored personal data, bind-mounted read-only at deploy
    // time — it must never be traced into the bundle. Declared here rather than
    // left to an opt-out comment on every fs call in src/lib/content.ts,
    // because one missed call silently puts PII back in the published image.
    // The Dockerfile still deletes and asserts: this is the cause, that is the
    // backstop, and a backstop that never fires is the point.
    outputFileTracingExcludes: {
        '*': ['content/**'],
    },
    // .env is deliberately NOT listed above: the standalone build copies it in
    // a separate step that this option does not reach (verified — adding it
    // changes nothing). Secrets are kept out of the image by .dockerignore
    // excluding it from the build context and the Dockerfile deleting and
    // asserting on it, both of which are checked on every build.
    // Don't advertise the framework in every response; it only helps someone
    // fingerprinting the stack to pick version-specific exploits.
    poweredByHeader: false,
    // The app is the single source of truth for these. The nginx in front of it
    // (nginx/templates/invictus.conf.template) deliberately does NOT repeat
    // them: nginx's add_header appends to a proxied response rather than
    // replacing it, and a browser given two Content-Security-Policy headers
    // enforces the intersection — so a second, slightly-different copy silently
    // subtracts from this one. nginx adds only HSTS, which needs to know TLS
    // was terminated. See src/__tests__/nginxTemplate.test.ts.
    // RFC 9116 puts the file at /.well-known/security.txt, but a pages/ folder
    // starting with a dot is not routable, so the page lives at /security.txt
    // and the well-known path rewrites onto it. Both URLs serve the same bytes.
    async rewrites() {
        return [
            { source: '/.well-known/security.txt', destination: '/security.txt' },
        ];
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                    ...(process.env.NODE_ENV === 'production'
                        ? [{ key: 'Content-Security-Policy', value: contentSecurityPolicy }]
                        : []),
                ],
            },
        ];
    },
}

module.exports = nextConfig;
