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
    },
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
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
