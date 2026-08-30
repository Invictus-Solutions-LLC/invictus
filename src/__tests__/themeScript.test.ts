import crypto from 'crypto';
import { THEME_SCRIPT } from '@config/themeScript';

import { contentSecurityPolicy } from '@config/csp';

describe('theme script', () => {
    // The script is inline, so the production CSP allows it by hash. If the
    // script changes and the hash isn't regenerated from the same constant, the
    // browser silently refuses to run it and every visitor gets the dark theme
    // regardless of what they chose. This is the guard against that.
    it('is allowed by the production Content-Security-Policy hash', () => {
        const hash = crypto.createHash('sha256').update(THEME_SCRIPT).digest('base64');

        expect(contentSecurityPolicy).toContain(`'sha256-${hash}'`);
    });

    it('never weakens the policy with unsafe-inline', () => {
        expect(contentSecurityPolicy).not.toContain("'unsafe-inline' ");
        expect(contentSecurityPolicy).toMatch(/script-src 'self' 'sha256-/);
    });

    // It runs before React, before any error boundary — a throw here is a blank
    // page, so every storage access has to sit inside the try.
    it('cannot throw on a browser without storage', () => {
        expect(THEME_SCRIPT.startsWith('(function(){try{')).toBe(true);
        expect(THEME_SCRIPT.endsWith('catch(e){}})();')).toBe(true);
        expect(THEME_SCRIPT.split('try{')[0]).not.toMatch(/localStorage|matchMedia/);
    });

    // Scroll-reveal hides its content and relies on script to show it again.
    // Without this marker a visitor with JavaScript off would be left staring at
    // a page of invisible sections.
    it('marks that JavaScript is running, so reveal can hide safely', () => {
        expect(THEME_SCRIPT).toContain("classList.add('js')");
    });
});
