import { test, expect } from '@playwright/test';
import { gotoHome, showSection } from './helpers';

const SECTIONS = ['hero', 'work', 'experience', 'skills', 'lab', 'process', 'contact'];

const VIEWPORTS = [
    { name: 'small mobile', width: 320, height: 700 },
    { name: 'mobile', width: 390, height: 844 },
    { name: 'mobile landscape', width: 844, height: 390 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'laptop', width: 1024, height: 768 },
    { name: 'desktop', width: 1440, height: 900 },
];

for (const vp of VIEWPORTS) {
    test.describe(`${vp.name} (${vp.width}x${vp.height})`, () => {
        test.use({ viewport: { width: vp.width, height: vp.height } });

        test('never scrolls sideways', async ({ page }) => {
            await gotoHome(page);

            for (const id of SECTIONS) {
                await showSection(page, id);
                const overflow = await page.evaluate(() => ({
                    scrollWidth: document.documentElement.scrollWidth,
                    clientWidth: document.documentElement.clientWidth,
                }));
                expect(overflow.scrollWidth, `no sideways scroll at ${id}`)
                    .toBeLessThanOrEqual(overflow.clientWidth + 1);
            }
        });

        test('renders every section within the page width', async ({ page }) => {
            await gotoHome(page);

            for (const id of SECTIONS) {
                await showSection(page, id);
                const box = await page.locator(`#${id}`).boundingBox();
                expect(box, `${id} is laid out`).not.toBeNull();
                expect(box!.width).toBeGreaterThan(0);
                expect(Math.round(box!.width)).toBeLessThanOrEqual(vp.width + 1);
            }
        });

        // Cards carry their own light surface, so nothing inside them may spill
        // past the rounded edge at any width.
        test('keeps card content inside the card', async ({ page }) => {
            await gotoHome(page);
            await showSection(page, 'work');

            const spills = await page.evaluate(() => {
                return [...document.querySelectorAll('#work article, #skills .card')]
                    .filter((card) => card.scrollWidth > card.clientWidth + 1)
                    .map((card) => card.textContent?.trim().slice(0, 30) ?? '');
            });
            expect(spills).toEqual([]);
        });
    });
}

test.describe('header', () => {
    test('stays pinned while the page scrolls', async ({ page }) => {
        await gotoHome(page);
        await showSection(page, 'contact');

        const box = await page.locator('header').boundingBox();
        expect(box!.y).toBeLessThanOrEqual(1);
    });

    // scroll-padding-top keeps an anchored section clear of the sticky header.
    test('does not cover a section jumped to from the palette', async ({ page }) => {
        await gotoHome(page, '/#skills');
        await page.waitForTimeout(500);

        const header = await page.locator('header').boundingBox();
        const heading = await page.locator('#skills h2').boundingBox();
        expect(heading!.y).toBeGreaterThanOrEqual(header!.y + header!.height - 1);
    });
});
