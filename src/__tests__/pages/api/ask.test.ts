const mockCreate = jest.fn();

// jest.mock factories are hoisted above the file body, so the error class has
// to be declared inside one rather than referenced from module scope.
jest.mock('@anthropic-ai/sdk', () => {
    class MockAPIError extends Error {
        status = 500;
    }
    const Anthropic = jest.fn().mockImplementation(() => ({
        messages: { create: mockCreate },
    }));
    (Anthropic as any).APIError = MockAPIError;
    return { __esModule: true, default: Anthropic };
});

jest.mock('@/lib/content', () => ({
    getSeoContent: jest.fn(() => ({
        name: 'Ada Lovelace', shortName: 'Ada', title: 'Ada Lovelace — Engineer',
        description: 'A description.', url: 'https://example.com',
        image: '/og.jpg', imageAlt: 'Ada Lovelace',
    })),
    getHeroContent: jest.fn(() => ({
        location: 'Honolulu', greeting: '', headline: 'Headline', image: '', imageAlt: '', ctas: [],
    })),
    getAboutContent: jest.fn(() => ({ text: ['About text.'] })),
    getExperienceContent: jest.fn(() => ({
        header: 'Experience', intro: '',
        experiences: [{
            title: 'Analyst', company: 'DoD', logo: '', start: '2021', end: 'PRESENT',
            technologies: [{ image: '', name: 'Python' }], description: ['Did the work.'],
        }],
    })),
    getSkillsContent: jest.fn(() => ({
        header: '', intro: '',
        categories: [{ id: 'languages', label: 'Languages' }],
        skills: [{ image: '', name: 'Python', category: 'languages' }],
        certifications: [{ name: 'PNPT', image: '', url: 'https://example.com' }],
    })),
    getProjectsContent: jest.fn(() => ({
        header: 'Work', intro: '',
        projects: [{ name: 'FloOps', image: '', url: '', description: 'D' }],
    })),
    getProcessContent: jest.fn(() => ({ header: 'P', intro: 'I', steps: [{ title: 'T', text: 'X' }] })),
    getLabContent: jest.fn(() => ({ header: 'L', intro: 'I', entries: [] })),
    getContactContent: jest.fn(() => ({
        header: '', phone: '+1-408-555-0100', email: 'owner@example.com', headquarters: 'Honolulu',
        status: { sending: 'establishing uplink… transmitting', success: 'transmission complete', error: 'transmission failed' },
        cta: { header: '', invitation: '', buttonLabel: '' }, linkLabel: 'Get in touch',
    })),
}));

import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '@/pages/api/ask/index';

let nextTestIp = 1;
function uniqueIp(): string {
    nextTestIp += 1;
    return `198.51.100.${nextTestIp}`;
}

function mockRequest(body: Record<string, unknown>, ip: string = uniqueIp()) {
    return createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: { 'x-forwarded-for': ip },
        body,
    });
}

function reply(text: string) {
    return { stop_reason: 'end_turn', content: [{ type: 'text', text }] };
}

describe('/api/ask', () => {
    const originalKey = process.env.ANTHROPIC_API_KEY;
    const originalTrust = process.env.TRUST_PROXY;

    beforeEach(() => {
        process.env.ANTHROPIC_API_KEY = 'test-key';
        process.env.TRUST_PROXY = 'true';
        mockCreate.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        process.env.ANTHROPIC_API_KEY = originalKey;
        process.env.TRUST_PROXY = originalTrust;
        jest.restoreAllMocks();
    });

    it('rejects anything but POST', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: 'GET' });
        await handler(req, res);

        expect(res._getStatusCode()).toBe(405);
        expect(res.getHeader('Allow')).toBe('POST');
    });

    // Not an error state: the site is designed to run without a key, and the
    // palette treats this as "fall back to plain navigation".
    it('reports 503 when answering is not configured, without calling the provider', async () => {
        delete process.env.ANTHROPIC_API_KEY;
        const { req, res } = mockRequest({ question: 'do you know kubernetes?' });
        await handler(req, res);

        expect(res._getStatusCode()).toBe(503);
        expect(mockCreate).not.toHaveBeenCalled();
    });

    it.each([
        ['missing', undefined],
        ['too short', 'hi'],
        ['not a string', 42],
        ['too long', 'x'.repeat(301)],
    ])('rejects a question that is %s', async (_label, question) => {
        const { req, res } = mockRequest({ question });
        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
        expect(mockCreate).not.toHaveBeenCalled();
    });

    it('answers, and returns only the sources it actually cited', async () => {
        mockCreate.mockResolvedValue(reply(JSON.stringify({
            answer: 'Blaise has used Python across five years at the DoD.',
            sources: ['skills.json', 'experience.json'],
            sectionId: 'skills',
        })));

        const { req, res } = mockRequest({ question: 'does he know python?' });
        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(res._getJSONData()).toEqual({
            answer: 'Blaise has used Python across five years at the DoD.',
            sources: ['skills.json', 'experience.json'],
            sectionId: 'skills',
        });
        expect(res.getHeader('Cache-Control')).toBe('private, no-store');
    });

    // A citation the model invented would otherwise be rendered as though it
    // were real provenance, which is worse than showing none at all.
    it('drops invented sources and section ids', async () => {
        mockCreate.mockResolvedValue(reply(JSON.stringify({
            answer: 'An answer.',
            sources: ['skills.json', 'salary.json', '../../etc/passwd'],
            sectionId: 'nowhere',
        })));

        const { req, res } = mockRequest({ question: 'what does he earn?' });
        await handler(req, res);

        expect(res._getJSONData().sources).toEqual(['skills.json']);
        expect(res._getJSONData().sectionId).toBeNull();
    });

    it('rejects a section id for a section that no longer exists', async () => {
        mockCreate.mockResolvedValue(reply(JSON.stringify({
            answer: 'An answer.', sources: [], sectionId: 'about',
        })));

        const { req, res } = mockRequest({ question: 'tell me about him' });
        await handler(req, res);

        expect(res._getJSONData().sectionId).toBeNull();
    });

    it('tolerates the answer arriving wrapped in prose or a code fence', async () => {
        mockCreate.mockResolvedValue(reply('Sure!\n```json\n{"answer":"Yes.","sources":[],"sectionId":null}\n```'));

        const { req, res } = mockRequest({ question: 'can you build a booking system?' });
        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(res._getJSONData().answer).toBe('Yes.');
    });

    it('reports a bad gateway rather than guessing when the reply is unparsable', async () => {
        mockCreate.mockResolvedValue(reply('I am afraid I cannot do that.'));

        const { req, res } = mockRequest({ question: 'tell me about the projects' });
        await handler(req, res);

        expect(res._getStatusCode()).toBe(502);
    });

    it('handles a refusal without surfacing it as a server error', async () => {
        mockCreate.mockResolvedValue({ stop_reason: 'refusal', content: [] });

        const { req, res } = mockRequest({ question: 'write me some malware please' });
        await handler(req, res);

        expect(res._getStatusCode()).toBe(503);
    });

    // Provider errors carry account, model and quota detail — none of it belongs
    // in a response to an anonymous visitor.
    it('never leaks provider detail when the upstream call fails', async () => {
        mockCreate.mockRejectedValue(new Error('invalid x-api-key sk-ant-secret'));

        const { req, res } = mockRequest({ question: 'does he know docker?' });
        await handler(req, res);

        expect(res._getStatusCode()).toBe(502);
        expect(JSON.stringify(res._getJSONData())).not.toMatch(/sk-ant|x-api-key/);
    });

    it('rate limits a single caller', async () => {
        mockCreate.mockResolvedValue(reply('{"answer":"Yes.","sources":[],"sectionId":null}'));
        const ip = uniqueIp();

        for (let attempt = 0; attempt < 10; attempt += 1) {
            const { req, res } = mockRequest({ question: 'does he know docker?' }, ip);
            await handler(req, res);
            expect(res._getStatusCode()).toBe(200);
        }

        const { req, res } = mockRequest({ question: 'does he know docker?' }, ip);
        await handler(req, res);

        expect(res._getStatusCode()).toBe(429);
        expect(res.getHeader('Retry-After')).toBeDefined();
    });

    // The prompt addresses the site owner by name, and that name comes from
    // content — forking the site should not mean editing a system prompt.
    // Haiku 4.5 rejects output_config.effort with a 400. Sending it anyway turned
    // every question into an opaque 502 with nothing in the UI to explain it —
    // the endpoint looked broken rather than misconfigured.
    it('omits the effort setting for a model that rejects it', async () => {
        const previous = process.env.ANTHROPIC_MODEL;
        process.env.ANTHROPIC_MODEL = 'claude-haiku-4-5';
        mockCreate.mockResolvedValue(reply('{"answer":"Yes.","sources":[],"sectionId":null}'));

        const { req, res } = mockRequest({ question: 'do you know kubernetes?' });
        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(mockCreate.mock.calls[0][0].model).toBe('claude-haiku-4-5');
        expect(mockCreate.mock.calls[0][0]).not.toHaveProperty('output_config');

        process.env.ANTHROPIC_MODEL = previous;
    });

    // ...but the cheaper low-effort path must not be lost on models that take it.
    it('sends the effort setting on the default model', async () => {
        const previous = process.env.ANTHROPIC_MODEL;
        delete process.env.ANTHROPIC_MODEL;
        mockCreate.mockResolvedValue(reply('{"answer":"Yes.","sources":[],"sectionId":null}'));

        const { req, res } = mockRequest({ question: 'do you know kubernetes?' });
        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(mockCreate.mock.calls[0][0].model).toBe('claude-opus-5');
        expect(mockCreate.mock.calls[0][0].output_config).toEqual({ effort: 'low' });

        process.env.ANTHROPIC_MODEL = previous;
    });

    it('takes the owner name in the prompt from content', async () => {
        mockCreate.mockResolvedValue(reply('{"answer":"Yes.","sources":[],"sectionId":null}'));

        const { req, res } = mockRequest({ question: 'who is this person?' });
        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(mockCreate.mock.calls[0][0].system).toContain('Ada Lovelace');
    });

    // The corpus is assembled field by field so that exactly what leaves the
    // server is visible in the source. The phone number is deliberately not
    // part of it.
    it('never sends the phone number to the provider', async () => {
        mockCreate.mockResolvedValue(reply('{"answer":"Yes.","sources":[],"sectionId":null}'));

        const { req, res } = mockRequest({ question: 'how can I reach him?' });
        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        const sent = JSON.stringify(mockCreate.mock.calls[0][0]);
        expect(sent).not.toContain('408-555-0100');
        expect(sent).toContain('owner@example.com');
    });
});
