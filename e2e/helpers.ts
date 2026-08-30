import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

export type RGB = [number, number, number];
export type ThemeChoice = 'dark' | 'light';

function channel(value: number): number {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function luminance([r, g, b]: RGB): number {
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: RGB, b: RGB): number {
    const [l1, l2] = [luminance(a), luminance(b)];
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function parseRgb(colour: string): RGB {
    const parts = colour.match(/\d+/g)?.map(Number) ?? [];
    return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

// WCAG treats >=24px, or >=18.66px bold, as "large text" with a lower bar.
export function requiredContrast(fontSizePx: number, fontWeight: number): number {
    const isLarge = fontSizePx >= 24 || (fontSizePx >= 18.66 && fontWeight >= 700);
    return isLarge ? 3 : 4.5;
}

// Must run before goto: the pre-paint theme script reads storage on load, and
// the whole point is to exercise the theme the visitor actually gets first.
export async function useTheme(page: Page, theme: ThemeChoice): Promise<void> {
    await page.addInitScript((choice) => {
        try {
            window.localStorage.setItem('theme', choice as string);
        } catch {
            // Nothing to do — the page falls back to the dark default.
        }
    }, theme);
}

// The intro overlay covers the viewport on every load — the full boot log on a
// fresh session, a shorter reattach bar afterwards — and it intercepts clicks
// and skews layout measurements while it is up. Every spec except the one that
// tests it navigates through here.
//
// The skip listeners attach on hydration, so a single early keypress can land
// before anything is listening; retry until the overlay is actually gone.
export async function gotoHome(page: Page, path = '/'): Promise<void> {
    await page.goto(path);

    const intro = page.locator('#boot-sequence');
    await expect(async () => {
        await page.keyboard.press('Escape');
        await expect(intro).toHaveCount(0, { timeout: 1_000 });
    }).toPass({ timeout: 25_000 });
}

// Scrolls a section into view and lets its entry animation finish. Sections
// fade and rise over 550ms once they intersect; waiting on every descendant's
// settled opacity does not work, because content still below the fold has
// legitimately never animated in.
export async function showSection(page: Page, id: string): Promise<void> {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(750);
}

export type TextSample = {
    name: string;
    colour: string;
    background: string;
    size: number;
    weight: number;
};

// Samples colour against the nearest painted ancestor rather than one global
// page background — the shell-white cards sit on the dark page, so a single
// backdrop assumption would measure the wrong pair entirely.
export async function sampleText(
    page: Page,
    targets: Array<{ selector: string; name: string }>
): Promise<Array<TextSample>> {
    return page.evaluate((entries) => {
        const painted = (start: Element): string => {
            let node: Element | null = start;
            while (node) {
                const bg = getComputedStyle(node).backgroundColor;
                if (bg && !/rgba\(0,\s*0,\s*0,\s*0\)|transparent/.test(bg)) {
                    return bg;
                }
                node = node.parentElement;
            }
            return getComputedStyle(document.body).backgroundColor;
        };

        return entries.flatMap(({ selector, name }) => {
            const el = document.querySelector(selector);
            if (!el) {
                return [];
            }
            const cs = getComputedStyle(el);
            return [{
                name,
                colour: cs.color,
                background: painted(el),
                size: parseFloat(cs.fontSize),
                weight: parseInt(cs.fontWeight, 10) || 400,
            }];
        });
    }, targets);
}
