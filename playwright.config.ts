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
            // Never let a suite send real mail or spend money on a real model
            // call. Both are cleared rather than assumed absent: .env is loaded
            // by the server under test, so a developer who has configured either
            // key locally would otherwise have the suite reach a live provider —
            // silently, on every run. Clearing them also makes the unconfigured
            // path (403/503 fallbacks) the deterministic thing under test.
            RESEND_API_KEY: '',
            ANTHROPIC_API_KEY: '',
            // Rate limiter reads X-Forwarded-For the way it does behind nginx.
            TRUST_PROXY: 'true',
            NEXT_TELEMETRY_DISABLED: '1',
        },
    },
});
