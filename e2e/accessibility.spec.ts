import { test, expect } from '@playwright/test';
import { skipBootSequence, showSection, contrastRatio, parseRgb, requiredContrast, PAGE_BG } from './helpers';

test.describe('accessibility', () => {
    test('exposes the expected landmarks and named regions', async ({ page }) => {
        await page.goto('/');
        await skipBootSequence(page);
        const landmarks = await page.evaluate(() => ({
            main: document.querySelectorAll('main, [role=main]').length,
            contentinfo: document.querySelectorAll('footer, [role=contentinfo]').length,
            banner: document.querySelectorAll('header, [role=banner]').length,
            namedSections: [...document.querySelectorAll('section')].filter((s) => s.getAttribute('aria-label')).length,
        }));
        expect(landmarks.main).toBe(1);
        expect(landmarks.contentinfo).toBeGreaterThanOrEqual(1);
        expect(landmarks.banner).toBeGreaterThanOrEqual(1);
        expect(landmarks.namedSections).toBeGreaterThanOrEqual(6);
    });

    test('has one h1 first and no heading-level skips', async ({ page }) => {
        await page.goto('/');
        await skipBootSequence(page);
        const levels = await page.evaluate(() =>
            [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => Number(h.tagName[1])));

        expect(levels.filter((l) => l === 1)).toHaveLength(1);
        expect(levels[0]).toBe(1);
        for (let i = 1; i < levels.length; i++) {
            expect(levels[i]!, `no skip before h${levels[i]}`).toBeLessThanOrEqual(levels[i - 1]! + 1);
        }
    });

    // Muted text used to sit at 3.21:1 and the typed-in form text at 1.36:1.
    test('meets WCAG AA contrast for body, form and chrome text', async ({ page }) => {
        await page.goto('/');
        await skipBootSequence(page);
        await showSection(page, 'contact');

        const samples = await page.evaluate(() => {
            const pick = (selector: string, name: string) => {
                const el = document.querySelector(selector);
                if (!el) return null;
                const cs = getComputedStyle(el);
                return { name, colour: cs.color, size: parseFloat(cs.fontSize), weight: parseInt(cs.fontWeight, 10) || 400 };
            };
            return [
                pick('#experience h2', 'section heading'),
                pick('#skills p', 'caption'),
                pick('#contact input', 'form input text'),
                pick('.terminalTitlebar span:last-child', 'terminal path label'),
            ].filter((s): s is NonNullable<typeof s> => s !== null);
        });

        expect(samples.length).toBeGreaterThan(0);
        for (const sample of samples) {
            const ratio = contrastRatio(parseRgb(sample.colour), PAGE_BG);
            expect(ratio, `${sample.name} contrast`).toBeGreaterThanOrEqual(requiredContrast(sample.size, sample.weight));
        }
    });

    test('labels every contact field and announces validation errors', async ({ page }) => {
        await page.goto('/');
        await skipBootSequence(page);
        await showSection(page, 'contact');

        for (const label of ['Name', 'Email', 'Subject', 'Message']) {
            await expect(page.getByLabel(label, { exact: true })).toHaveCount(1);
        }

        await page.getByRole('button', { name: /submit/i }).click();
        await expect(page.locator('#contact [aria-invalid="true"]')).toHaveCount(4);
        await expect(page.locator('#contact [role="alert"]')).toHaveCount(4);

        const describedBy = await page.locator('#contact-name').getAttribute('aria-describedby');
        expect(describedBy).toBeTruthy();
        await expect(page.locator(`#${describedBy}`)).toBeVisible();
    });

    test('shows a focus indicator on every keyboard stop', async ({ page }) => {
        await page.goto('/');
        await skipBootSequence(page);
        await page.mouse.click(5, 5);

        const seen = new Map<string, boolean>();
        for (let i = 0; i < 90; i++) {
            await page.keyboard.press('Tab');
            // .contactInput transitions its ring in over 150ms.
            await page.waitForTimeout(300);
            const stop = await page.evaluate(() => {
                const el = document.activeElement;
                if (!el || el === document.body) return null;
                const cs = getComputedStyle(el);
                const outline = cs.outlineStyle !== 'none'
                    && parseFloat(cs.outlineWidth) > 0
                    && !/rgba\(0,\s*0,\s*0,\s*0\)|transparent/.test(cs.outlineColor);
                const ring = cs.boxShadow !== 'none' && /rgb\(255,\s*0,\s*0\)/.test(cs.boxShadow);
                const name = el.id || el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 24) || '';
                return { key: `${el.tagName}|${name}`, hasIndicator: outline || ring };
            });
            if (!stop) continue;
            seen.set(stop.key, (seen.get(stop.key) ?? false) || stop.hasIndicator);
        }

        const missing = [...seen.entries()].filter(([, ok]) => !ok).map(([key]) => key);
        expect(seen.size, 'reached some tab stops').toBeGreaterThan(10);
        expect(missing, 'every tab stop has a visible focus indicator').toEqual([]);
    });

    // WCAG 1.4.10: usable at 320px with no horizontal scrolling.
    for (const width of [320, 280]) {
        test(`reflows at ${width}px without horizontal scroll`, async ({ page }) => {
            await page.setViewportSize({ width, height: 700 });
            await page.goto('/');
            await skipBootSequence(page);
            const result = await page.evaluate(() => {
                const doc = document.documentElement;
                const scroller = document.querySelector('.snap-y') as HTMLElement;
                scroller.scrollLeft = 9999;
                const panned = scroller.scrollLeft;
                scroller.scrollLeft = 0;
                return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, panned };
            });
            expect(result.scrollWidth).toBeLessThanOrEqual(result.clientWidth + 1);
            expect(result.panned).toBe(0);
        });
    }
});
