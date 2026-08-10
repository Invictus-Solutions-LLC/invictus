import { test, expect } from '@playwright/test';
import { skipBootSequence, showSection } from './helpers';

// Geometry tolerance — "centred" means within a few pixels, not exact.
const TOL = 6;

const SIDEBAR_SECTIONS = ['experience', 'projects'];
const STACKED_SECTIONS = ['about', 'skills', 'contact'];

type Viewport = { name: string; width: number; height: number; desktop: boolean };

const VIEWPORTS: Array<Viewport> = [
    { name: 'mobile', width: 390, height: 844, desktop: false },
    { name: 'mobile landscape', width: 844, height: 390, desktop: false },
    { name: 'tablet', width: 768, height: 1024, desktop: false },
    { name: 'laptop', width: 1024, height: 768, desktop: true },
    { name: 'desktop', width: 1440, height: 900, desktop: true },
];

async function measure(page: import('@playwright/test').Page, id: string) {
    return page.evaluate((sectionId) => {
        const section = document.getElementById(sectionId)!;
        const box = (el: Element) => {
            const r = el.getBoundingClientRect();
            return {
                top: r.top, bottom: r.bottom, left: r.left, right: r.right,
                width: Math.round(r.width), height: Math.round(r.height),
                midY: r.top + r.height / 2, midX: r.left + r.width / 2,
            };
        };
        const heading = section.querySelector('h2')!;
        const terminals = [...section.querySelectorAll('.terminalWindow')];
        const last = terminals[terminals.length - 1]!;
        const form = section.querySelector('form');
        const cursor = heading.querySelector('.terminalCursor')!;
        const lineHeight = parseFloat(getComputedStyle(heading).lineHeight);
        return {
            heading: box(heading),
            terminal: box(last),
            command: box(heading.querySelector('span[aria-hidden="true"]')!),
            wrapper: box(section.firstElementChild!),
            opacity: parseFloat(getComputedStyle(section.firstElementChild!).opacity),
            form: form ? box(form) : null,
            info: form ? box(form.parentElement!.children[0]!) : null,
            headingLines: Math.round(box(heading).height / lineHeight),
            cursorInline: (box(heading).bottom - box(cursor).bottom) < lineHeight * 0.6,
        };
    }, id);
}

for (const vp of VIEWPORTS) {
    test.describe(`${vp.name} (${vp.width}x${vp.height})`, () => {
        test.use({ viewport: { width: vp.width, height: vp.height } });

        test('never scrolls sideways', async ({ page }) => {
            await page.goto('/');
            await skipBootSequence(page);
            // Decorative background circles expand during their entry animation,
            // so settle before sampling.
            await page.waitForTimeout(1200);
            const result = await page.evaluate(() => {
                const doc = document.documentElement;
                const scroller = document.querySelector('.snap-y') as HTMLElement ?? doc;
                scroller.scrollLeft = 9999;
                const panned = scroller.scrollLeft;
                scroller.scrollLeft = 0;
                return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, panned };
            });
            expect(result.scrollWidth).toBeLessThanOrEqual(result.clientWidth + 1);
            expect(result.panned).toBe(0);
        });

        test('every section renders fully and stays inside the viewport', async ({ page }) => {
            await page.goto('/');
            await skipBootSequence(page);
            for (const id of [...SIDEBAR_SECTIONS, ...STACKED_SECTIONS]) {
                await showSection(page, id);
                const m = await measure(page, id);
                expect(m.opacity, `${id} finished fading in`).toBeGreaterThan(0.99);
                expect(m.terminal.left).toBeGreaterThan(-1);
                expect(m.terminal.right).toBeLessThanOrEqual(vp.width + 1);
            }
        });

        test('experience and projects use the right heading arrangement', async ({ page }) => {
            await page.goto('/');
            await skipBootSequence(page);
            for (const id of SIDEBAR_SECTIONS) {
                await showSection(page, id);
                const m = await measure(page, id);
                if (vp.desktop) {
                    // Heading sits in a left column, vertically centred on the terminal.
                    expect(m.heading.right, `${id} heading left of terminal`).toBeLessThanOrEqual(m.terminal.left + 2);
                    expect(Math.abs(m.heading.midY - m.terminal.midY)).toBeLessThanOrEqual(TOL);
                    // '$ cd ./experience' must fit on one line with its cursor.
                    expect(m.headingLines, `${id} heading on one line`).toBe(1);
                    expect(m.cursorInline, `${id} cursor inline`).toBe(true);
                } else {
                    expect(m.heading.bottom, `${id} heading above terminal`).toBeLessThanOrEqual(m.terminal.top + 2);
                }
            }
        });

        test('skills heading is centred and contact splits info from the form', async ({ page }) => {
            await page.goto('/');
            await skipBootSequence(page);

            await showSection(page, 'skills');
            const skills = await measure(page, 'skills');
            expect(skills.heading.bottom).toBeLessThanOrEqual(skills.terminal.top + 2);
            expect(Math.abs(skills.command.midX - skills.wrapper.midX)).toBeLessThanOrEqual(TOL);

            await showSection(page, 'contact');
            const contact = await measure(page, 'contact');
            expect(contact.heading.bottom).toBeLessThanOrEqual(contact.terminal.top + 2);
            if (vp.desktop) {
                expect(contact.info!.right).toBeLessThanOrEqual(contact.form!.left + 2);
                expect(Math.abs(contact.info!.midY - contact.form!.midY)).toBeLessThanOrEqual(TOL);
            } else {
                expect(contact.info!.bottom).toBeLessThanOrEqual(contact.form!.top + 2);
            }
        });
    });
}

test.describe('vertical fit and centring', () => {
    // The grid is sized by column count, but the space it gets shrinks with
    // viewport height — short windows used to overflow (1280x600 by 159px).
    // The md band matters as much as lg: it lays out 4 columns, so 4 rows, and
    // a cap calibrated only for lg's 3 rows left it overflowing there.
    for (const [width, height] of [
        [768, 600], [900, 700], [1023, 650],           // md band: 4 columns, 4 rows
        [1280, 600], [1280, 700], [1366, 768], [1920, 1080], // lg band: 6 columns, 3 rows
    ] as const) {
        test(`skills grid fits without scrolling at ${width}x${height}`, async ({ page }) => {
            await page.setViewportSize({ width, height });
            await page.goto('/');
            await skipBootSequence(page);
            await showSection(page, 'skills');

            const fit = await page.evaluate(() => {
                const terminals = [...document.querySelectorAll('#skills .terminalWindow')];
                const body = terminals[terminals.length - 1]!.children[1] as HTMLElement;
                const icon = document.querySelector('#skills .grid img')!.getBoundingClientRect();
                return {
                    content: body.scrollHeight, box: body.clientHeight,
                    iconWidth: Math.round(icon.width), iconHeight: Math.round(icon.height),
                };
            });
            expect(fit.content, `overflowed by ${fit.content - fit.box}px`).toBeLessThanOrEqual(fit.box + 2);
            // Shrinking to fit must not distort or erase the tiles: an earlier
            // attempt at height-driven sizing produced 75x80 ellipses at one
            // breakpoint and 3x3px specks on short landscape viewports.
            expect(Math.abs(fit.iconWidth - fit.iconHeight), 'tile stays square').toBeLessThanOrEqual(1);
            expect(fit.iconWidth, 'tile stays legible').toBeGreaterThanOrEqual(32);
        });
    }

    // The hover reveal is sized against the tile root, so capping only the <img>
    // left a white circle wider than the icon it covered.
    test('skill hover overlay matches the icon it covers', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto('/');
        await skipBootSequence(page);
        await showSection(page, 'skills');

        const tile = await page.evaluate(() => {
            const cell = document.querySelector('#skills .grid')!.children[0]!;
            const icon = cell.querySelector('img')!.getBoundingClientRect();
            const overlay = cell.querySelector('div')!.getBoundingClientRect();
            const cellBox = cell.getBoundingClientRect();
            return {
                iconWidth: Math.round(icon.width), overlayWidth: Math.round(overlay.width),
                leftSlack: Math.round(icon.left - cellBox.left), rightSlack: Math.round(cellBox.right - icon.right),
            };
        });
        expect(tile.overlayWidth).toBe(tile.iconWidth);
        expect(Math.abs(tile.leftSlack - tile.rightSlack), 'icon centred in its cell').toBeLessThanOrEqual(2);
    });

    test('about centres the portrait and the prose when there is room', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto('/');
        await skipBootSequence(page);
        await showSection(page, 'about');

        const gaps = await page.evaluate(() => {
            const body = [...document.querySelectorAll('#about .terminalWindow')].pop()!.children[1] as HTMLElement;
            const cs = getComputedStyle(body);
            const box = body.getBoundingClientRect();
            // Measure against the content box: the body's own padding is not slack.
            const top = box.top + parseFloat(cs.paddingTop);
            const bottom = box.bottom - parseFloat(cs.paddingBottom);
            const image = document.querySelector('#about img')!.getBoundingClientRect();
            const heading = document.querySelector('#about h3')!;
            const prose = heading.nextElementSibling!.getBoundingClientRect();
            return {
                overflows: body.scrollHeight > body.clientHeight + 2,
                imageAbove: image.top - top, imageBelow: bottom - image.bottom,
                proseAbove: prose.top - heading.getBoundingClientRect().bottom,
                proseBelow: bottom - prose.bottom,
            };
        });

        expect(gaps.overflows, 'there is spare room to centre within').toBe(false);

        // The portrait should read as a portrait, not a thumbnail: in an
        // editorial bio layout it carries roughly a quarter of the column.
        const portrait = await page.evaluate(() => {
            const body = [...document.querySelectorAll('#about .terminalWindow')].pop()!.children[1] as HTMLElement;
            const cs = getComputedStyle(body);
            const inner = body.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
            const image = document.querySelector('#about img')!.getBoundingClientRect();
            return { share: image.width / inner, width: Math.round(image.width) };
        });
        expect(portrait.share, `portrait is ${portrait.width}px, ${Math.round(portrait.share * 100)}% of the column`)
            .toBeGreaterThanOrEqual(0.2);
        expect(Math.abs(gaps.imageAbove - gaps.imageBelow), 'portrait vertically centred').toBeLessThanOrEqual(3);
        expect(Math.abs(gaps.proseAbove - gaps.proseBelow), 'prose centred under the header').toBeLessThanOrEqual(3);
    });
});
