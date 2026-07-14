// Everything is self-hosted (fonts via next/font, images/icons from /public,
// inline styles required by framer-motion/styled-jsx). Production only — the
// dev server needs eval and websockets for HMR/react-refresh.
const contentSecurityPolicy = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Defense in depth: nginx (see nginx/templates/invictus.conf.template) sets
    // these in the documented Docker deploy, but the app sets them too in case
    // it's ever run directly or behind a different proxy.
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

module.exports = nextConfig
