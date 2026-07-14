jest.mock('@/lib/content', () => ({
    getAboutContent: jest.fn(() => ({
        header: 'About me',
        image: '/about.png',
        text: ['A software engineer who tests things.'],
    })),
    getContactContent: jest.fn(() => ({
        header: 'Contact',
        phone: '+1-555-0100',
        email: 'owner@example.com',
        headquarters: 'Testville',
    })),
    getExperienceContent: jest.fn(() => ({
        experiences: [{
            title: 'Engineer',
            company: 'Example Corp',
            logo: '/logos/x.svg',
            start: '01/2024',
            end: 'PRESENT',
            technologies: [],
            description: ['Built the test suite.'],
        }],
    })),
    getSkillsContent: jest.fn(() => ({
        header: 'Skills',
        skills: [{ name: 'Python', level: 90, image: '/logos/python.svg' }],
    })),
}));

import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '@/pages/api/resume/index';

let nextTestIp = 1;
function uniqueIp(): string {
    nextTestIp += 1;
    return `198.51.100.${nextTestIp}`;
}

function mockRequest(options: { key?: string; bearer?: string; method?: string; ip?: string } = {}) {
    const headers: Record<string, string> = { 'x-forwarded-for': options.ip ?? uniqueIp() };
    if (options.bearer) {
        headers.authorization = `Bearer ${options.bearer}`;
    }
    return createMocks<NextApiRequest, NextApiResponse>({
        method: (options.method ?? 'GET') as 'GET',
        headers,
        query: options.key ? { key: options.key } : {},
    });
}

describe('/api/resume', () => {
    const originalTokens = process.env.RESUME_ACCESS_TOKENS;

    beforeEach(() => {
        process.env.RESUME_ACCESS_TOKENS = 'valid-token-one, valid-token-two';
    });

    afterAll(() => {
        process.env.RESUME_ACCESS_TOKENS = originalTokens;
    });

    it('returns 405 on non-GET methods', async () => {
        const { req, res } = mockRequest({ method: 'POST', key: 'valid-token-one' });
        await handler(req, res);
        expect(res._getStatusCode()).toBe(405);
    });

    it('returns 404 when no token is supplied', async () => {
        const { req, res } = mockRequest();
        await handler(req, res);
        expect(res._getStatusCode()).toBe(404);
    });

    it('returns 404 for a wrong token — indistinguishable from a missing route', async () => {
        const { req, res } = mockRequest({ key: 'wrong-token' });
        await handler(req, res);
        expect(res._getStatusCode()).toBe(404);
        expect(res._getJSONData()).toEqual({ message: 'Not found.' });
    });

    it('returns 404 even with a token when none are configured (locked by default)', async () => {
        process.env.RESUME_ACCESS_TOKENS = '';
        const { req, res } = mockRequest({ key: 'valid-token-one' });
        await handler(req, res);
        expect(res._getStatusCode()).toBe(404);
    });

    it('serves the plain-text resume for a valid ?key= token', async () => {
        const { req, res } = mockRequest({ key: 'valid-token-two' });
        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(res.getHeader('content-type')).toContain('text/plain');
        const body = res._getData();
        expect(body).toContain('INVICTUS808 — RESUME');
        expect(body).toContain('owner@example.com');
        expect(body).toContain('Engineer — Example Corp');
        expect(body).toContain('Built the test suite.');
        expect(body).toContain('Python (90%)');
    });

    it('serves the resume for a valid Authorization: Bearer token', async () => {
        const { req, res } = mockRequest({ bearer: 'valid-token-one' });
        await handler(req, res);
        expect(res._getStatusCode()).toBe(200);
    });

    it('rate limits repeated attempts from one IP with 429', async () => {
        const ip = uniqueIp();
        for (let i = 0; i < 10; i += 1) {
            const { req, res } = mockRequest({ key: 'wrong-token', ip });
            await handler(req, res);
            expect(res._getStatusCode()).toBe(404);
        }
        const { req, res } = mockRequest({ key: 'wrong-token', ip });
        await handler(req, res);
        expect(res._getStatusCode()).toBe(429);
        expect(res.getHeader('Retry-After')).toBeDefined();
    });
});
