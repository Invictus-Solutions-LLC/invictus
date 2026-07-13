import path from 'path';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

describe('content loader', () => {
    const originalContentDir = process.env.CONTENT_DIR;

    afterEach(() => {
        process.env.CONTENT_DIR = originalContentDir;
        jest.resetModules();
    });

    it('reads and parses an existing content file', () => {
        process.env.CONTENT_DIR = FIXTURES_DIR;
        const { getHeroContent } = require('@/lib/content');

        expect(getHeroContent()).toEqual({
            image: '/hero.png',
            prefix: 'root@fixture:~# ',
            titles: ['Fixture Title'],
            words: ['Fixture word'],
        });
    });

    it('throws a clear, non-leaking error when the file is missing', () => {
        process.env.CONTENT_DIR = FIXTURES_DIR;
        const { getAboutContent } = require('@/lib/content');

        expect(() => getAboutContent()).toThrow(/about\.json/);
        expect(() => getAboutContent()).not.toThrow(/ENOENT|errno|at Object/);
    });
});
