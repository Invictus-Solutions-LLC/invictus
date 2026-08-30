import { test, expect } from '@playwright/test';

// Deliberately does NOT use gotoHome — this is the spec that exercises the intro.
test.describe('intro sequence', () => {
    test('plays the boot log on a fresh session, then clears itself', async ({ page }) => {
        await page.goto('/');

        const intro = page.locator('#boot-sequence');
        await expect(intro).toBeVisible();
        // Content-agnostic: CI runs on the example log, not the owner's.
        await expect(intro).toContainText('[  OK  ]');
        await expect(intro).toContainText('press any key to skip');

        // 10 lines at 280ms, a 1600ms hold, then a 500ms fade.
        await expect(intro).toHaveCount(0, { timeout: 15_000 });
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('reattaches instead of rebooting on a repeat load', async ({ page }) => {
        await page.goto('/');
        await page.keyboard.press('Escape');
        await expect(page.locator('#boot-sequence')).toHaveCount(0);

        await page.reload();
        const intro = page.locator('#boot-sequence');
        await expect(intro).toContainText('reconnecting to session');
        await expect(intro).not.toContainText('[  OK  ]');
        await expect(intro).toHaveCount(0, { timeout: 15_000 });
    });

    test.describe('skipping', () => {
        test('ends on any keypress', async ({ page }) => {
            await page.goto('/');
            await expect(page.locator('#boot-sequence')).toBeVisible();

            await page.keyboard.press('Escape');
            await expect(page.locator('#boot-sequence')).toHaveCount(0);
        });

        test('ends on a click', async ({ page }) => {
            await page.goto('/');
            await expect(page.locator('#boot-sequence')).toBeVisible();

            await page.mouse.click(200, 200);
            await expect(page.locator('#boot-sequence')).toHaveCount(0);
        });
    });

    // The finished screen appears as one static frame and then cuts — an
    // opacity tween is still motion.
    test('does not animate for a visitor who asked for less motion', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('/');

        const intro = page.locator('#boot-sequence');
        // Every line is already present rather than typed in one at a time.
        await expect(intro).toContainText('[  OK  ]');
        await expect(intro).toHaveCount(0, { timeout: 15_000 });
    });

    // The real page is underneath the whole time — the overlay is decoration,
    // not a gate, so a crawler still sees the content.
    test('never removes the page content from the document', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('#boot-sequence')).toBeVisible();
        await expect(page.locator('h1')).toHaveCount(1);
        await expect(page.locator('main')).toHaveCount(1);
    });

    // Nothing would ever dismiss it without JavaScript, so it must not show.
    test('does not render at all without JavaScript', async ({ browser }) => {
        const context = await browser.newContext({ javaScriptEnabled: false });
        const page = await context.newPage();
        await page.goto('/');

        await expect(page.locator('#boot-sequence')).toBeHidden();
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await context.close();
    });

    // Scroll-reveal hides its content behind the `js` class and shows it again
    // by script. Without JavaScript that class must never appear, or the page
    // is left full of invisible sections — and nothing may ship opacity: 0.
    test('reveals every section without JavaScript', async ({ browser }) => {
        const context = await browser.newContext({ javaScriptEnabled: false });
        const page = await context.newPage();
        await page.goto('/');

        await expect(page.locator('html')).not.toHaveClass(/\bjs\b/);
        const hidden = await page.locator('[style*="opacity:0"], [style*="opacity: 0"]').count();
        expect(hidden, 'nothing is server-rendered invisible').toBe(0);

        for (const id of ['work', 'experience', 'skills', 'process', 'contact']) {
            await expect(page.locator(`#${id} h2`)).toBeVisible();
        }
        await context.close();
    });
});
