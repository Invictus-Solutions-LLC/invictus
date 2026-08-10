import { test, expect } from '@playwright/test';
import { skipBootSequence, showSection } from './helpers';

test.describe('keyboard interactions', () => {
    // Regression: the trigger used to be swapped out for the links, which threw
    // focus to <body>, and the only dismiss path was a document mouse listener.
    test('social disclosure is operable and dismissible by keyboard', async ({ page }) => {
        await page.goto('/');
        await skipBootSequence(page);

        const trigger = page.getByRole('button', { name: /social links/i });
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
        await expect(trigger).toHaveAttribute('aria-controls', 'social-links');

        await trigger.focus();
        await page.keyboard.press('Enter');

        await expect(page.locator('#social-links')).toBeVisible();
        await expect(trigger).toHaveAttribute('aria-expanded', 'true');
        await expect(trigger, 'trigger stays mounted and focused').toBeFocused();

        await page.keyboard.press('Escape');
        await expect(page.locator('#social-links')).toHaveCount(0);
        await expect(trigger, 'focus returns to the trigger').toBeFocused();
    });

    // The experience card scrolls its own overflow but holds no focusable
    // children, so without tabIndex its content is unreachable by keyboard in
    // Firefox and Safari — only Chromium auto-focuses such scrollers.
    test('experience card content is reachable and scrollable by keyboard', async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 700 });
        await page.goto('/');
        await skipBootSequence(page);
        await showSection(page, 'experience');

        const card = page.locator('#experience article').first();
        await expect(card).toHaveAttribute('tabindex', '0');
        await expect(card).toHaveAttribute('aria-label', /.+/);

        await card.focus();
        await page.waitForTimeout(400); // transition-opacity duration-200
        const focusedOpacity = await card.evaluate((el) => getComputedStyle(el).opacity);
        expect(Number(focusedOpacity), 'focused card is not left dimmed').toBeGreaterThan(0.99);

        const before = await card.evaluate((el) => el.scrollTop);
        await page.keyboard.press('PageDown');
        await page.waitForTimeout(600);
        const after = await card.evaluate((el) => el.scrollTop);
        expect(after, 'card content scrolls with the keyboard').toBeGreaterThan(before);
    });

    test('carousel controls advance the cards', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto('/');
        await skipBootSequence(page);
        await showSection(page, 'projects');

        const row = page.locator('#projects .snap-x').first();
        const before = await row.evaluate((el) => el.scrollLeft);
        await page.locator('#projects button[aria-label="Next"]').click();
        await page.waitForTimeout(900);
        const after = await row.evaluate((el) => el.scrollLeft);
        expect(after).toBeGreaterThan(before);
    });
});
