import path from 'path';
import fs from 'fs';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

describe('content loader', () => {
    const originalContentDir = process.env.CONTENT_DIR;

    afterEach(() => {
        process.env.CONTENT_DIR = originalContentDir;
        jest.resetModules();
    });

    // A sitemap that reports today's date on every request is worse than one
    // with no lastmod at all: once a crawler sees the value is not credible it
    // discounts the field. The date has to come from the content itself.
    it('reports the newest content file as the last-modified date', () => {
        const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'content-'));
        const older = new Date('2020-03-04T00:00:00Z');
        const newer = new Date('2021-06-07T00:00:00Z');

        fs.writeFileSync(path.join(dir, 'hero.json'), '{}');
        fs.writeFileSync(path.join(dir, 'seo.json'), '{}');
        // An example template is not the deployed content and must not count.
        fs.writeFileSync(path.join(dir, 'hero.example.json'), '{}');
        fs.utimesSync(path.join(dir, 'hero.json'), older, older);
        fs.utimesSync(path.join(dir, 'seo.json'), newer, newer);
        fs.utimesSync(path.join(dir, 'hero.example.json'), new Date('2030-01-01T00:00:00Z'), new Date('2030-01-01T00:00:00Z'));

        process.env.CONTENT_DIR = dir;
        const { getContentLastModified } = require('@/lib/content');

        expect(getContentLastModified()?.toISOString().slice(0, 10)).toBe('2021-06-07');
    });

    // Omitting lastmod is valid; inventing one is not.
    it('reports no last-modified date when the content directory is unreadable', () => {
        process.env.CONTENT_DIR = path.join(require('os').tmpdir(), 'definitely-not-here-' + Date.now());
        const { getContentLastModified } = require('@/lib/content');

        expect(getContentLastModified()).toBeNull();
    });

    it('reads and parses an existing content file', () => {
        process.env.CONTENT_DIR = FIXTURES_DIR;
        const { getHeroContent } = require('@/lib/content');

        expect(getHeroContent()).toEqual({
            location: 'Fixture City',
            greeting: 'Aloha',
            headline: 'Fixture headline',
            image: '/hero.png',
            imageAlt: 'Fixture portrait',
            ctas: [{ label: 'Fixture', href: '#contact', variant: 'primary' }],
        });
    });

    it('throws a clear, non-leaking error when the file is missing', () => {
        process.env.CONTENT_DIR = FIXTURES_DIR;
        const { getAboutContent } = require('@/lib/content');

        expect(() => getAboutContent()).toThrow(/about\.json/);
        expect(() => getAboutContent()).not.toThrow(/ENOENT|errno|at Object/);
    });

    // The content directory is bind-mounted read-only into a container running
    // as an unprivileged user, so an ownership mistake on the host is at least
    // as likely as a missing file. Telling the operator to create a file that is
    // already there sends them hunting for the wrong problem.
    it('distinguishes an unreadable file from a missing one', () => {
        const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'content-'));
        const file = path.join(dir, 'hero.json');
        fs.copyFileSync(path.join(FIXTURES_DIR, 'hero.json'), file);
        fs.chmodSync(file, 0o000);
        process.env.CONTENT_DIR = dir;
        const { getHeroContent } = require('@/lib/content');

        // root ignores permission bits, so this assertion is only meaningful
        // for an unprivileged test runner.
        if (typeof process.getuid === 'function' && process.getuid() === 0) {
            return;
        }

        expect(() => getHeroContent()).toThrow(/could not be read \(EACCES\)/);
        expect(() => getHeroContent()).not.toThrow(/was not found/);
    });

    // The content directory is bind-mounted and hand-edited in production, so a
    // renamed or dropped field is a realistic failure. It should surface here
    // rather than as "undefined is not iterable" inside a component.
    it('names the offending fields when a file is the wrong shape', () => {
        const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'content-'));
        fs.copyFileSync(path.join(FIXTURES_DIR, 'malformed.json'), path.join(dir, 'hero.json'));
        process.env.CONTENT_DIR = dir;
        const { getHeroContent } = require('@/lib/content');

        expect(() => getHeroContent()).toThrow(/"ctas" \(array\)/);
        expect(() => getHeroContent()).toThrow(/hero\.example\.json/);
    });

    // Adding an entry and forgetting a field is the likeliest hand-edit mistake,
    // and it used to render a blank card with an undefined href rather than
    // saying anything.
    it('names the offending item and field when an array entry is incomplete', () => {
        const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'content-'));
        fs.writeFileSync(
            path.join(dir, 'projects.json'),
            JSON.stringify({ projects: [
                { name: 'Fine', image: '/a.png', url: 'https://a', description: 'ok' },
                { name: 'Broken' },
            ] })
        );
        process.env.CONTENT_DIR = dir;
        const { getProjectsContent } = require('@/lib/content');

        expect(() => getProjectsContent()).toThrow(/"projects\[1\]\.description" \(string\)/);
        // ...and says nothing about the entry that is fine.
        expect(() => getProjectsContent()).not.toThrow(/projects\[0\]/);
    });

    // Nested objects are checked the same way arrays are — a missing key inside
    // contact.cta or ask.messages used to render undefined rather than fail.
    it('names the offending field inside a nested object', () => {
        const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'content-'));
        fs.writeFileSync(path.join(dir, 'contact.json'), JSON.stringify({
            header: 'x', phone: 'x', email: 'x', headquarters: 'x', linkLabel: 'x',
            cta: { header: 'Got something?', buttonLabel: 'Start' },
        }));
        process.env.CONTENT_DIR = dir;
        const { getContactContent } = require('@/lib/content');

        expect(() => getContactContent()).toThrow(/"cta\.invitation" \(string\)/);
        expect(() => getContactContent()).not.toThrow(/cta\.header/);
    });

    it('rejects an array of strings containing something else', () => {
        const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'content-'));
        fs.writeFileSync(path.join(dir, 'about.json'), JSON.stringify({ text: ['fine', 42] }));
        process.env.CONTENT_DIR = dir;
        const { getAboutContent } = require('@/lib/content');

        expect(() => getAboutContent()).toThrow(/"text\[1\]" \(string\)/);
    });

    it('rejects socials.json when it is not an array of strings', () => {
        const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'content-'));
        fs.writeFileSync(path.join(dir, 'socials.json'), JSON.stringify({ nope: true }));
        process.env.CONTENT_DIR = dir;
        const { getSocialsContent } = require('@/lib/content');

        expect(() => getSocialsContent()).toThrow(/array of URL strings/);
    });

    // The hero's heading sits directly above the About prose. If the heading
    // appears inside that prose, the page introduces its owner twice in a row —
    // the exact redundancy this hero was reworked to remove — and it is also
    // what a truncation or copy-paste slip between the two files looks like.
    it('does not repeat the about prose as the hero heading', () => {
        process.env.CONTENT_DIR = path.join(process.cwd(), 'content');
        const { getHeroContent, getAboutContent } = require('@/lib/content');

        const { headline } = getHeroContent();
        const prose = getAboutContent().text.join(' ');

        expect(headline.trim().length).toBeGreaterThan(2);
        expect(headline).toBe(headline.trim());
        expect(prose).not.toContain(headline.trim());
    });

    // The committed *.example.json files are what CI and a fresh clone actually
    // run on, so they have to satisfy the same loaders as the real files. This
    // is what catches a schema change that updated only one of the two.
    it('loads every committed example file', () => {
        const source = path.join(process.cwd(), 'content');
        const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'examples-'));
        fs.readdirSync(source)
            .filter((name) => name.endsWith('.example.json'))
            .forEach((name) => {
                fs.copyFileSync(path.join(source, name), path.join(dir, name.replace('.example', '')));
            });

        process.env.CONTENT_DIR = dir;
        const content = require('@/lib/content');

        expect(() => content.getHeroContent()).not.toThrow();
        expect(() => content.getAboutContent()).not.toThrow();
        expect(() => content.getExperienceContent()).not.toThrow();
        expect(() => content.getSkillsContent()).not.toThrow();
        expect(() => content.getProjectsContent()).not.toThrow();
        expect(() => content.getProcessContent()).not.toThrow();
        expect(() => content.getLabContent()).not.toThrow();
        expect(() => content.getContactContent()).not.toThrow();
        expect(() => content.getSocialsContent()).not.toThrow();
        expect(() => content.getFooterContent()).not.toThrow();
        expect(() => content.getSeoContent()).not.toThrow();
        expect(() => content.getAskContent()).not.toThrow();
        expect(() => content.getBootContent()).not.toThrow();
    });
});
