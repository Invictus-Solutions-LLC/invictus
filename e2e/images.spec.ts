import { test, expect } from '@playwright/test';
import { skipBootSequence, showSection } from './helpers';

const SECTIONS = ['about', 'experience', 'skills', 'projects', 'contact'];

// A raw <img> once shipped the 11.8 MB source portrait to fill a 160px box,
// putting a full page view at 15.78 MB. This budget is the regression guard.
const PAYLOAD_BUDGET_MB = 2;

test.describe('images', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('keeps the whole-page image payload within budget', async ({ page }) => {
        const transferred: Array<{ url: string; bytes: number }> = [];
        page.on('response', async (response) => {
            if (!/image/.test(response.headers()['content-type'] ?? '')) return;
            let bytes = Number(response.headers()['content-length'] ?? 0);
            if (!bytes) {
                try { bytes = (await response.body()).length; } catch { /* aborted */ }
            }
            transferred.push({ url: new URL(response.url()).pathname, bytes });
        });

        await page.goto('/');
        await skipBootSequence(page);
        for (const id of SECTIONS) await showSection(page, id);
        await page.waitForTimeout(1200);

        // Guard the guard: with zero images loaded the total is 0, which would
        // satisfy the budget while the page was actually broken. Any non-zero
        // traffic proves the page really loaded — the count itself must not be
        // hard-coded, because content/*.json is user-supplied and CI runs with
        // the much smaller placeholder set.
        expect(transferred.length, 'actually observed image traffic').toBeGreaterThan(0);

        const totalMb = transferred.reduce((sum, r) => sum + r.bytes, 0) / 1024 / 1024;
        const worst = [...transferred].sort((a, b) => b.bytes - a.bytes).slice(0, 3)
            .map((r) => `${r.url} ${(r.bytes / 1024).toFixed(0)}KB`).join(', ');
        expect(totalMb, `image payload ${totalMb.toFixed(2)}MB; largest: ${worst}`).toBeLessThan(PAYLOAD_BUDGET_MB);
    });

    test('renders every image, deferring only what is off-screen', async ({ page }) => {
        await page.goto('/');
        await skipBootSequence(page);
        for (const id of SECTIONS) await showSection(page, id);
        await page.waitForTimeout(1200);

        // An image is healthy if it has decoded pixels, or is legitimately
        // deferred: loading=lazy AND outside the viewport. `complete` alone is
        // unreliable because decoding is asynchronous.
        const broken = await page.evaluate(() =>
            [...document.querySelectorAll('img')]
                .filter((img) => {
                    if (img.naturalWidth > 0) return false;
                    const r = img.getBoundingClientRect();
                    const offscreen = r.right < 0 || r.left > window.innerWidth || r.bottom < 0 || r.top > window.innerHeight;
                    return !(img.loading === 'lazy' && offscreen);
                })
                .map((img) => img.currentSrc || img.src));

        expect(broken).toEqual([]);
    });

    test('routes raster images through the optimiser but never SVG', async ({ page }) => {
        await page.goto('/');
        await skipBootSequence(page);
        await showSection(page, 'projects');

        const sources = await page.evaluate(() =>
            [...document.querySelectorAll<HTMLImageElement>('#projects img')]
                .filter((img) => img.naturalWidth > 0)
                .map((img) => img.currentSrc || img.src));

        expect(sources.length).toBeGreaterThan(0);
        for (const src of sources) {
            const isSvg = /\.svg(\?|$)/i.test(src);
            // SVG stays a plain <img>: optimising it needs dangerouslyAllowSVG,
            // and a same-origin SVG can carry script.
            expect(isSvg || src.includes('/_next/image'), `optimised or svg: ${src}`).toBe(true);
        }
    });

    test('requests a resolution that matches the rendered box', async ({ page }) => {
        await page.goto('/');
        await skipBootSequence(page);
        await showSection(page, 'about');

        const portrait = await page.evaluate(() => {
            const img = document.querySelector('#about img') as HTMLImageElement | null;
            if (!img) return null;
            return {
                boxWidth: Math.round(img.getBoundingClientRect().width),
                requested: Number(new URL(img.currentSrc, location.origin).searchParams.get('w') ?? 0),
            };
        });

        expect(portrait).not.toBeNull();
        // Sharp: at least the CSS box. Lean: not wildly beyond it.
        expect(portrait!.requested).toBeGreaterThanOrEqual(portrait!.boxWidth);
        expect(portrait!.requested).toBeLessThanOrEqual(portrait!.boxWidth * 4);
    });
});
