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

// Rate limiting keys on this rather than on the raw address.
//
// A per-IP limit is close to meaningless against IPv6: a single routed /64 —
// the standard allocation a residential or hosting customer receives — holds
// 2^64 addresses, so an attacker gets a fresh bucket for every request just by
// picking a new source address. Collapsing IPv6 to its /64 makes one
// allocation one bucket, which is the unit a network operator actually
// controls. IPv4 is left alone: addresses there are scarce enough that the
// address itself is the right granularity, and aggregating would punish
// everyone behind a shared NAT.
export function rateLimitKey(req: NextApiRequest): string {
    return toBucket(getClientIp(req));
}

function padHextet(hextet: string): string {
    return hextet.toLowerCase().padStart(4, '0');
}

// Returns the eight hextets of a v6 address, or null when the input is not a
// plain v6 address this function is confident it understands. Callers fall back
// to the address as written rather than guessing at a bucket.
function expand(address: string): Array<string> | null {
    // An embedded IPv4 tail (2001:db8::192.0.2.1) is legal but rare; rather
    // than half-parse it, decline and let the caller key on the full address.
    if (address.includes('.')) {
        return null;
    }

    const halves = address.split('::');
    if (halves.length > 2) {
        return null;
    }

    const head = halves[0] ? halves[0].split(':') : [];
    const tail = halves.length === 2 && halves[1] ? halves[1].split(':') : [];

    // Every group must be a real hextet. Without this, malformed input parses
    // as though it were an address and two unrelated callers can land in the
    // same bucket — the one outcome this function must never produce.
    if (![...head, ...tail].every((group) => { return /^[0-9a-f]{1,4}$/i.test(group); })) {
        return null;
    }

    if (halves.length === 1) {
        return head.length === 8 ? head.map(padHextet) : null;
    }

    const missing = 8 - head.length - tail.length;
    if (missing < 1) {
        return null;
    }

    return [...head, ...Array<string>(missing).fill('0'), ...tail].map(padHextet);
}

function toBucket(address: string): string {
    // Node reports an IPv4 peer as ::ffff:203.0.113.9 on a dual-stack socket.
    // That caller is on IPv4 and must be keyed as such, not collapsed to a /64.
    const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(address);
    if (mapped) {
        return mapped[1];
    }

    if (!address.includes(':')) {
        return address;
    }

    // A scope id (fe80::1%eth0) is local to the host and not part of identity.
    const hextets = expand(address.split('%')[0]);

    return hextets ? `${hextets.slice(0, 4).join(':')}::/64` : address;
}
