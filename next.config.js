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
                ],
            },
        ];
    },
}

module.exports = nextConfig
