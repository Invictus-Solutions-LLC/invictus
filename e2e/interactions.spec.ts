import { test, expect } from '@playwright/test';
import { gotoHome, showSection, useTheme } from './helpers';

test.describe('command palette', () => {
    test('opens with the keyboard shortcut and closes with Escape', async ({ page }) => {
        await gotoHome(page);

        await page.keyboard.press('ControlOrMeta+k');
        await expect(page.getByRole('dialog', { name: /search and ask/i })).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).toHaveCount(0);
    });

    test('opens from the header button and focuses the input', async ({ page }) => {
        await gotoHome(page);

        await page.getByRole('button', { name: /open search and navigation/i }).click();
        await expect(page.getByRole('combobox')).toBeFocused();
    });

    test('returns focus to the trigger when dismissed', async ({ page }) => {
        await gotoHome(page);

        const trigger = page.getByRole('button', { name: /open search and navigation/i });
        await trigger.click();
        await page.keyboard.press('Escape');

        await expect(trigger).toBeFocused();
    });

    // Regression guard: an invalid Tailwind size class on the search icon once
    // let the inline SVG fall back to its intrinsic size and squeeze the input
    // to zero width. jsdom has no layout, so only a real browser catches this.
    test('gives the search input a usable width', async ({ page }) => {
        await gotoHome(page);

        await page.keyboard.press('ControlOrMeta+k');
        const input = page.getByRole('combobox');
        await expect(input).toBeVisible();

        const box = await input.boundingBox();
        expect(box!.width).toBeGreaterThan(200);
    });

    // The placeholder is where a visitor learns the box takes plain questions
    // rather than keywords, so it has to show a real one.
    test('suggests a real question in the placeholder', async ({ page }) => {
        await gotoHome(page);

        await page.keyboard.press('ControlOrMeta+k');
        const placeholder = await page.getByRole('combobox').getAttribute('placeholder');

        expect(placeholder).toMatch(/\?$|do you know|tell me about/i);
        // The accessible name is the stable description; the placeholder is decoration.
        await expect(page.getByRole('combobox')).toHaveAccessibleName(/ask a question or jump to a section/i);
    });

    test('filters and navigates to a section with the keyboard alone', async ({ page }) => {
        await gotoHome(page);

        await page.keyboard.press('ControlOrMeta+k');
        await page.getByRole('combobox').fill('skills');
        await page.keyboard.press('Enter');

        await expect(page.getByRole('dialog')).toHaveCount(0);
        await expect(page).toHaveURL(/#skills$/);
    });

    // Answering is unconfigured in this environment, which is exactly the state
    // a fresh deploy is in: the palette must stay a working navigator.
    test('degrades to plain navigation when answering is unavailable', async ({ page }) => {
        await gotoHome(page);

        await page.keyboard.press('ControlOrMeta+k');
        await page.getByRole('combobox').fill('can you build me a booking system?');
        await page.getByRole('option', { name: /^Ask:/ }).click();

        await expect(page.getByText(/answering is unavailable/i)).toBeVisible();
        await expect(page.getByRole('listbox')).toBeVisible();
    });
});

test.describe('theme', () => {
    test('follows the operating system when nothing has been chosen', async ({ page }) => {
        await page.emulateMedia({ colorScheme: 'dark' });
        await gotoHome(page);
        await expect(page.locator('html')).toHaveClass(/dark/);

        await page.emulateMedia({ colorScheme: 'light' });
        await page.reload();
        await expect(page.locator('html')).toHaveClass(/light/);
    });

    // An explicit choice has to survive the visitor's machine flipping to dark
    // at sunset, and has to be applied before the first paint rather than after.
    test('a stored choice overrides the operating system', async ({ page }) => {
        await page.emulateMedia({ colorScheme: 'dark' });
        await useTheme(page, 'light');
        await gotoHome(page);

        await expect(page.locator('html')).toHaveClass(/light/);
    });

    test('persists a choice across a reload', async ({ page }) => {
        await gotoHome(page);

        await page.getByRole('radio', { name: 'Light' }).first().click();
        await expect(page.locator('html')).toHaveClass(/light/);

        await page.reload();
        await expect(page.locator('html')).toHaveClass(/light/);
        await expect(page.getByRole('radio', { name: 'Light' }).first()).toHaveAttribute('aria-checked', 'true');
    });
});

test.describe('project cards', () => {
    test("show the author's full description without a disclosure", async ({ page }) => {
        await gotoHome(page);
        await showSection(page, 'work');

        await expect(page.locator('#work details')).toHaveCount(0);

        const body = page.locator('#work article p').nth(1);
        await expect(body).toBeVisible();
        expect((await body.textContent())!.length).toBeGreaterThan(120);
    });

    // Regression guard: the artwork used to sit small in the middle of its
    // panel. It should now fill the panel it is given.
    test('let the artwork fill its panel', async ({ page }) => {
        await gotoHome(page);
        await showSection(page, 'work');

        const card = page.locator('#work article').first();
        const panel = card.locator('.card-shot');
        const image = panel.locator('img');

        const panelBox = (await panel.boundingBox())!;
        const imageBox = (await image.boundingBox())!;

        expect(imageBox.width).toBeGreaterThanOrEqual(panelBox.width - 2);
        expect(imageBox.height).toBeGreaterThan(panelBox.height * 0.6);
    });
});
