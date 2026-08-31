import { test, expect } from '@playwright/test';
import { contrastRatio, gotoHome, parseRgb, requiredContrast, sampleText, showSection, useTheme } from './helpers';

const TEXT_TARGETS = [
    { selector: 'h1', name: 'hero heading' },
    { selector: '#work h2', name: 'section heading' },
    { selector: '#work p', name: 'section intro' },
    { selector: '#work article h3', name: 'card heading' },
    { selector: '#work article p', name: 'card body' },
    { selector: '#skills .chip', name: 'skill chip' },
    { selector: '#process p', name: 'process step body' },
    { selector: 'header .nav-link', name: 'nav link' },
    { selector: 'footer p', name: 'footer copyright' },
];

test.describe('accessibility', () => {
    test('exposes the expected landmarks and a skip link', async ({ page }) => {
        await gotoHome(page);

        await expect(page.locator('main')).toHaveCount(1);
        await expect(page.locator('header')).toHaveCount(1);
        await expect(page.locator('footer')).toHaveCount(1);
        await expect(page.getByRole('link', { name: /skip to content/i })).toHaveCount(1);

        const namedSections = await page.evaluate(() =>
            [...document.querySelectorAll('section')]
                .filter((s) => s.getAttribute('aria-label') || s.getAttribute('aria-labelledby')).length);
        expect(namedSections).toBeGreaterThanOrEqual(7);
    });

    test('has one h1 first and no heading-level skips', async ({ page }) => {
        await gotoHome(page);
        const levels = await page.evaluate(() =>
            [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => Number(h.tagName[1])));

        expect(levels.filter((l) => l === 1)).toHaveLength(1);
        expect(levels[0]).toBe(1);
        for (let i = 1; i < levels.length; i++) {
            expect(levels[i]!, `no skip before h${levels[i]}`).toBeLessThanOrEqual(levels[i - 1]! + 1);
        }
    });

    // Both palettes, because they are genuinely different colour systems rather
    // than one inverted: cyan is 9.9:1 on the dark page but only 1.8:1 on white,
    // so light mode has to substitute a deeper accent.
    for (const theme of ['dark', 'light'] as const) {
        test(`meets WCAG AA contrast in the ${theme} theme`, async ({ page }) => {
            await useTheme(page, theme);
            await gotoHome(page);
            await showSection(page, 'work');
            await showSection(page, 'skills');
            await showSection(page, 'process');

            const samples = await sampleText(page, TEXT_TARGETS);
            expect(samples.length).toBeGreaterThanOrEqual(TEXT_TARGETS.length - 1);

            for (const sample of samples) {
                const ratio = contrastRatio(parseRgb(sample.colour), parseRgb(sample.background));
                expect(
                    ratio,
                    `${theme}: ${sample.name} (${sample.colour} on ${sample.background})`
                ).toBeGreaterThanOrEqual(requiredContrast(sample.size, sample.weight));
            }
        });
    }

    test('labels every contact field and announces validation errors', async ({ page }) => {
        await gotoHome(page);
        await showSection(page, 'contact');

        for (const label of ['Name', 'Email', 'Subject', 'Message']) {
            await expect(page.getByLabel(label, { exact: true })).toHaveCount(1);
        }

        await page.getByRole('button', { name: /send message/i }).click();
        await expect(page.locator('#contact [aria-invalid="true"]')).toHaveCount(4);
        await expect(page.locator('#contact [role="alert"]')).toHaveCount(4);

        const describedBy = await page.locator('#contact-name').getAttribute('aria-describedby');
        expect(describedBy).toBeTruthy();
        await expect(page.locator(`#${describedBy}`)).toBeVisible();
    });

    test('shows a focus indicator on every keyboard stop', async ({ page }) => {
        await gotoHome(page);
        await page.mouse.click(5, 5);

        const seen = new Map<string, boolean>();
        for (let i = 0; i < 120; i++) {
            await page.keyboard.press('Tab');
            await page.waitForTimeout(120);
            const stop = await page.evaluate(() => {
                const el = document.activeElement;
                if (!el || el === document.body) {
                    return null;
                }
                const cs = getComputedStyle(el);
                const outline = cs.outlineStyle !== 'none'
                    && parseFloat(cs.outlineWidth) > 0
                    && !/rgba\(0,\s*0,\s*0,\s*0\)|transparent/.test(cs.outlineColor);
                // The global :focus-visible rule paints a 2px ring as box-shadow.
                const ring = cs.boxShadow !== 'none' && /rgb/.test(cs.boxShadow);
                // A ring on something invisible is not a focus indicator. Scroll
                // reveal keeps content in the DOM at opacity 0, so the focused
                // element has to actually be on screen.
                let node: Element | null = el;
                let opacity = 1;
                while (node && node !== document.body) {
                    const value = parseFloat(getComputedStyle(node).opacity);
                    if (!Number.isNaN(value)) {
                        opacity = Math.min(opacity, value);
                    }
                    node = node.parentElement;
                }
                const name = el.id || el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 24) || '';
                return { key: `${el.tagName}|${name}`, hasIndicator: (outline || ring) && opacity > 0.9 };
            });
            if (!stop) {
                continue;
            }
            seen.set(stop.key, (seen.get(stop.key) ?? false) || stop.hasIndicator);
        }

        const missing = [...seen.entries()].filter(([, ok]) => !ok).map(([key]) => key);
        expect(seen.size, 'reached some tab stops').toBeGreaterThan(10);
        expect(missing, 'every tab stop is visible and has a focus indicator').toEqual([]);
    });

    // The ambient contours, the swell divider and every hover transition are all
    // meant to stop dead for anyone whose OS asks for less movement.
    test('honours prefers-reduced-motion for the ambient layer', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await gotoHome(page);

        const animated = await page.evaluate(() =>
            [...document.querySelectorAll('*')]
                .filter((el) => getComputedStyle(el).animationName !== 'none')
                .map((el) => el.className.toString().slice(0, 40)));

        expect(animated).toEqual([]);
    });

    // WCAG 1.4.10: usable at 320px with no horizontal scrolling.
    for (const width of [320, 280]) {
        test(`reflows at ${width}px without horizontal scroll`, async ({ page }) => {
            await page.setViewportSize({ width, height: 700 });
            await gotoHome(page);

            const result = await page.evaluate(() => ({
                scrollWidth: document.documentElement.scrollWidth,
                clientWidth: document.documentElement.clientWidth,
            }));
            expect(result.scrollWidth).toBeLessThanOrEqual(result.clientWidth + 1);
        });
    }
});

// A recruiter saving the page as a PDF is a real path, and the site defaults to
// dark. Browsers suppress background colours when printing unless "Background
// graphics" is ticked, so before the print stylesheet existed the dark palette
// put near-white text on white paper at 1.13:1 — a blank-looking page.
test.describe('printing', () => {
    for (const theme of ['dark', 'light'] as const) {
        test(`stays legible on paper from the ${theme} theme`, async ({ page }) => {
            await useTheme(page, theme);
            await gotoHome(page);
            await page.emulateMedia({ media: 'print' });

            const colour = await page.evaluate(() => {
                return window.getComputedStyle(document.body).color;
            });

            // Measured against paper, not against the on-screen background.
            expect(contrastRatio(parseRgb(colour), [255, 255, 255])).toBeGreaterThanOrEqual(4.5);
        });
    }

    test('drops chrome that cannot be used on paper', async ({ page }) => {
        await gotoHome(page);
        await page.emulateMedia({ media: 'print' });

        await expect(page.locator('header')).toBeHidden();
        await expect(page.locator('#contact form')).toBeHidden();
    });

    // The rules must stay behind the media query: a leak would repaint the site.
    test('leaves the on-screen rendering alone', async ({ page }) => {
        await useTheme(page, 'dark');
        await gotoHome(page);

        await expect(page.locator('header')).toBeVisible();
        const background = await page.evaluate(() => {
            return window.getComputedStyle(document.body).backgroundColor;
        });
        expect(contrastRatio(parseRgb(background), [255, 255, 255])).toBeGreaterThan(4.5);
    });
});
