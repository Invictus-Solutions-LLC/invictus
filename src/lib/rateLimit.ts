type RateLimiterOptions = {
    windowMs: number;
    max: number;
};

type RateLimitResult = {
    allowed: boolean;
    retryAfterSeconds: number;
};

// Fixed-window in-memory limiter. Good enough for a single-instance portfolio
// deployment; state is per-process and resets on restart/deploy.
export class RateLimiter {
    private readonly windowMs: number;
    private readonly max: number;
    private readonly hits = new Map<string, { count: number; resetAt: number }>();

    constructor({ windowMs, max }: RateLimiterOptions) {
        this.windowMs = windowMs;
        this.max = max;
    }

    check(key: string): RateLimitResult {
        const now = Date.now();
        this.sweepOccasionally(now);

        const entry = this.hits.get(key);
        if (!entry || entry.resetAt <= now) {
            this.hits.set(key, { count: 1, resetAt: now + this.windowMs });
            return { allowed: true, retryAfterSeconds: 0 };
        }

        if (entry.count >= this.max) {
            return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
        }

        entry.count += 1;
        return { allowed: true, retryAfterSeconds: 0 };
    }

    reset(): void {
        this.hits.clear();
    }

    // Bound memory growth from one-off/spoofed IPs without paying an O(n)
    // sweep on every single request.
    private sweepOccasionally(now: number): void {
        if (this.hits.size < 5000 || Math.random() >= 0.01) {
            return;
        }

        for (const [key, entry] of this.hits) {
            if (entry.resetAt <= now) {
                this.hits.delete(key);
            }
        }
    }
}
