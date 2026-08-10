import type { NextApiRequest } from 'next';

// Resolves the caller's address for rate-limiting purposes.
//
// X-Forwarded-For is supplied by the caller unless a proxy we control rewrote
// it, so it cannot be trusted blindly: anyone could send a random value per
// request and mint a fresh rate-limit bucket every time, nullifying the limiter
// that guards the contact form and the resume token.
//
// nginx's `$proxy_add_x_forwarded_for` APPENDS the real peer address to
// whatever the client sent, so the RIGHTMOST entry is the one our proxy wrote;
// everything to its left is caller-controlled. We therefore read the last hop,
// and only when the deployment declares it actually sits behind a trusted proxy
// (TRUST_PROXY=true — set in docker-compose.prod.yml, where nginx always
// fronts the app). Exposed directly, the header is ignored entirely.
export function getClientIp(req: NextApiRequest): string {
    if (process.env.TRUST_PROXY === 'true') {
        const header = req.headers['x-forwarded-for'];
        const value = Array.isArray(header) ? header[header.length - 1] : header;
        const hops = value?.split(',').map((hop) => hop.trim()).filter(Boolean) ?? [];
        const nearest = hops[hops.length - 1];
        if (nearest) {
            return nearest;
        }
    }

    return req.socket?.remoteAddress ?? 'unknown';
}
