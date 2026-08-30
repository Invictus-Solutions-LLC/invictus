import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getClientIp, rateLimitKey } from '@/lib/clientIp';

function request(headers: Record<string, string>, remoteAddress = '10.0.0.9') {
    const { req } = createMocks<NextApiRequest, NextApiResponse>({ method: 'POST', headers });
    // node-mocks-http has no socket; the real request always does
    Object.defineProperty(req, 'socket', { value: { remoteAddress }, writable: true });
    return req;
}

describe('getClientIp', () => {
    const originalTrustProxy = process.env.TRUST_PROXY;

    afterEach(() => {
        process.env.TRUST_PROXY = originalTrustProxy;
    });

    describe('when not behind a trusted proxy', () => {
        beforeEach(() => {
            delete process.env.TRUST_PROXY;
        });

        it('ignores a forged X-Forwarded-For and uses the socket address', () => {
            const req = request({ 'x-forwarded-for': '1.2.3.4' });

            expect(getClientIp(req)).toBe('10.0.0.9');
        });
    });

    describe('when behind a trusted proxy', () => {
        beforeEach(() => {
            process.env.TRUST_PROXY = 'true';
        });

        it('uses the last hop, which is the one our proxy appended', () => {
            const req = request({ 'x-forwarded-for': '203.0.113.7' });

            expect(getClientIp(req)).toBe('203.0.113.7');
        });

        // The bypass this guards against: nginx appends the real peer, so a
        // caller-supplied value lands on the LEFT. Keying the limiter off it
        // would hand every request its own bucket.
        it('does not key off a caller-supplied hop prepended to the header', () => {
            const req = request({ 'x-forwarded-for': 'attacker-controlled, 203.0.113.7' });

            expect(getClientIp(req)).toBe('203.0.113.7');
            expect(getClientIp(req)).not.toBe('attacker-controlled');
        });

        it('falls back to the socket address when the header is absent', () => {
            const req = request({});

            expect(getClientIp(req)).toBe('10.0.0.9');
        });

        it('ignores an empty header rather than returning a blank key', () => {
            const req = request({ 'x-forwarded-for': '   ' });

            expect(getClientIp(req)).toBe('10.0.0.9');
        });
    });
});

describe('rateLimitKey', () => {
    const originalTrustProxy = process.env.TRUST_PROXY;

    afterEach(() => {
        process.env.TRUST_PROXY = originalTrustProxy;
    });

    beforeEach(() => {
        delete process.env.TRUST_PROXY;
    });

    const keyFor = (remoteAddress: string) => { return rateLimitKey(request({}, remoteAddress)); };

    // A /64 is the standard allocation a single customer receives, so it holds
    // 2^64 addresses. Keying on the full address would hand an attacker a fresh
    // bucket per request for free and make the per-caller limit decorative.
    it('collapses every address in one /64 to a single bucket', () => {
        const first = keyFor('2001:db8:abcd:1234::1');
        const second = keyFor('2001:db8:abcd:1234:ffff:ffff:ffff:fffe');

        expect(first).toBe(second);
        expect(first).toBe('2001:0db8:abcd:1234::/64');
    });

    it('keeps separate /64s in separate buckets', () => {
        expect(keyFor('2001:db8:abcd:1234::1')).not.toBe(keyFor('2001:db8:abcd:1235::1'));
    });

    // Compressed and fully-written forms of the same address are the same
    // caller; a bucket that depended on spelling would be trivially evaded.
    it('treats compressed and expanded spellings as one caller', () => {
        expect(keyFor('2001:db8::1')).toBe(keyFor('2001:0db8:0000:0000:0000:0000:0000:0001'));
    });

    it('is case-insensitive', () => {
        expect(keyFor('2001:DB8:ABCD:1234::1')).toBe(keyFor('2001:db8:abcd:1234::1'));
    });

    // Node reports an IPv4 peer on a dual-stack socket as ::ffff:a.b.c.d. That
    // caller is on IPv4 and must not be aggregated as though it owned a /64 —
    // doing so would put unrelated IPv4 clients in one bucket.
    it('treats an IPv4-mapped address as the IPv4 address it is', () => {
        expect(keyFor('::ffff:203.0.113.9')).toBe('203.0.113.9');
        expect(keyFor('::ffff:203.0.113.9')).not.toBe(keyFor('::ffff:203.0.113.10'));
    });

    // IPv4 is scarce enough that the address is the right granularity;
    // aggregating would punish everyone behind one NAT.
    it('leaves IPv4 addresses untouched', () => {
        expect(keyFor('198.51.100.7')).toBe('198.51.100.7');
    });

    it('ignores a link-local scope id, which is local to the host', () => {
        expect(keyFor('fe80::1%eth0')).toBe(keyFor('fe80::1'));
    });

    // Anything not confidently parsed keys on the address as written: a bad
    // guess could merge unrelated callers into one bucket.
    it('falls back to the address as written when it cannot be parsed', () => {
        expect(keyFor('2001:db8::192.0.2.1')).toBe('2001:db8::192.0.2.1');
        expect(keyFor('not:an:address:::x')).toBe('not:an:address:::x');
        expect(keyFor('unknown')).toBe('unknown');
    });
});
