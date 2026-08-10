import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 3100);
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
    testDir: './e2e',
    // These assert layout geometry and animation end-states, so they must not
    // race each other for CPU on a shared runner.
    workers: process.env.CI ? 1 : undefined,
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [['github'], ['list']] : [['list']],
    timeout: 60_000,
    expect: { timeout: 15_000 },
    use: {
        baseURL: BASE_URL,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
    webServer: {
        // Always exercise the production build — several checks (image
        // optimisation, error pages, security headers) behave differently in dev.
        command: `yarn build && yarn start --port ${PORT}`,
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 300_000,
        env: {
            // Never let a suite send real mail, and make the rate limiter read
            // X-Forwarded-For the way it does behind nginx in production.
            RESEND_API_KEY: '',
            TRUST_PROXY: 'true',
            NEXT_TELEMETRY_DISABLED: '1',
        },
    },
});
