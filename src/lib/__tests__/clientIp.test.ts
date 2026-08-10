import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getClientIp } from '@/lib/clientIp';

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
