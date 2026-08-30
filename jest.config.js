const nextJest = require('next/jest');

const createJestConfig = nextJest({
    dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@config/(.*)$': '<rootDir>/config/$1',
    },
    // e2e/ runs under Playwright, which has its own incompatible globals.
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/e2e/'],
    // Floor, not target — kept a few points under current coverage (91% stmts /
    // 80% branch / 88% funcs / 92% lines) so it catches a real regression
    // instead of sitting so far below that coverage could halve unnoticed.
    coverageThreshold: {
        global: {
            statements: 87,
            branches: 76,
            functions: 84,
            lines: 88,
        },
    },
};

const nextJestConfig = createJestConfig(customJestConfig);

// next/jest hardcodes its own transformIgnorePatterns, overriding anything passed
// above — apply this after its config resolves so react-social-icons' unbundled
// ESM entry point still gets transformed instead of failing to parse.
module.exports = async (...args) => {
    const config = await nextJestConfig(...args);
    config.transformIgnorePatterns = ['/node_modules/(?!(react-social-icons)/)'];
    return config;
};
