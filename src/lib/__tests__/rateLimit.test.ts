import { RateLimiter } from '@/lib/rateLimit';

describe('RateLimiter', () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    it('allows requests under the max within the window', () => {
        const limiter = new RateLimiter({ windowMs: 1000, max: 3 });

        expect(limiter.check('a').allowed).toBe(true);
        expect(limiter.check('a').allowed).toBe(true);
        expect(limiter.check('a').allowed).toBe(true);
    });

    it('blocks requests once the max is exceeded within the window', () => {
        const limiter = new RateLimiter({ windowMs: 1000, max: 2 });

        expect(limiter.check('a').allowed).toBe(true);
        expect(limiter.check('a').allowed).toBe(true);
        const blocked = limiter.check('a');
        expect(blocked.allowed).toBe(false);
        expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    });

    it('tracks separate keys independently', () => {
        const limiter = new RateLimiter({ windowMs: 1000, max: 1 });

        expect(limiter.check('a').allowed).toBe(true);
        expect(limiter.check('b').allowed).toBe(true);
        expect(limiter.check('a').allowed).toBe(false);
    });

    it('resets the count once the window elapses', () => {
        jest.useFakeTimers();
        const limiter = new RateLimiter({ windowMs: 1000, max: 1 });

        expect(limiter.check('a').allowed).toBe(true);
        expect(limiter.check('a').allowed).toBe(false);

        jest.advanceTimersByTime(1001);

        expect(limiter.check('a').allowed).toBe(true);
    });

    it('clears all tracked keys on reset()', () => {
        const limiter = new RateLimiter({ windowMs: 1000, max: 1 });

        expect(limiter.check('a').allowed).toBe(true);
        expect(limiter.check('a').allowed).toBe(false);

        limiter.reset();

        expect(limiter.check('a').allowed).toBe(true);
    });
});
