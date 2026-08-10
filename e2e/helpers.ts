import type { Page } from '@playwright/test';

// The page background every contrast ratio below is measured against.
export const PAGE_BG: RGB = [36, 36, 36];

export type RGB = [number, number, number];

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

// The boot overlay covers the first paint until dismissed; every spec needs the
// page past it before measuring anything. Waiting for the overlay to actually go
// away beats a fixed sleep: it is both quicker and doesn't get flaky when a busy
// CI runner takes longer than the guess.
export async function skipBootSequence(page: Page): Promise<void> {
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => {
        const overlay = document.getElementById('boot-sequence');
        return !overlay || getComputedStyle(overlay).opacity === '0';
    }, undefined, { timeout: 20_000 });
}

// Sections fade in via whileInView over 1.5s. Poll the settled opacity rather
// than sleeping past a worst-case guess.
export async function showSection(page: Page, id: string): Promise<void> {
    await page.evaluate((sectionId) => {
        document.getElementById(sectionId)?.scrollIntoView({ block: 'start' });
    }, id);
    await page.waitForFunction((sectionId) => {
        const wrapper = document.getElementById(sectionId)?.firstElementChild;
        return !!wrapper && parseFloat(getComputedStyle(wrapper).opacity) > 0.99;
    }, id, { timeout: 20_000 });
    // Cards animate in on mount independently of the section fade.
    await page.waitForTimeout(400);
}
