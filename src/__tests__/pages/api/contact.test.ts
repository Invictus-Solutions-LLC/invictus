const mockSend = jest.fn();

jest.mock('resend', () => ({
    Resend: jest.fn().mockImplementation(() => ({
        emails: { send: mockSend },
    })),
}));

jest.mock('@/lib/content', () => ({
    getContactContent: jest.fn(() => ({
        header: 'Contact',
        phone: '',
        email: 'owner@example.com',
        headquarters: '',
    })),
}));

import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '@/pages/api/contact/index';

// Each test uses its own source IP so the shared, module-level rate limiter
// in the handler doesn't let one test's requests count against another's.
let nextTestIp = 1;
function uniqueIp(): string {
    nextTestIp += 1;
    return `203.0.113.${nextTestIp}`;
}

function mockRequest(body: Partial<ContactInputs>, ip: string = uniqueIp()) {
    return createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: { 'x-forwarded-for': ip },
        body,
    });
}

describe('/api/contact', () => {
    const originalApiKey = process.env.RESEND_API_KEY;
    const validBody = { name: 'Test User', email: 'test@example.com', subject: 'Hi', message: 'Hello' };

    beforeEach(() => {
        mockSend.mockReset();
        process.env.RESEND_API_KEY = 're_test_key';
    });

    afterAll(() => {
        process.env.RESEND_API_KEY = originalApiKey;
    });

    it('returns 405 on non-POST methods', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: 'GET' });
        await handler(req, res);
        expect(res._getStatusCode()).toBe(405);
    });

    it('returns 400 when required fields are missing', async () => {
        const { req, res } = mockRequest({ name: '', email: '', subject: '', message: '' });
        await handler(req, res);
        expect(res._getStatusCode()).toBe(400);
        expect(mockSend).not.toHaveBeenCalled();
    });

    it('returns 400 for an invalid email', async () => {
        const { req, res } = mockRequest({ ...validBody, email: 'not-an-email' });
        await handler(req, res);
        expect(res._getStatusCode()).toBe(400);
    });

    it('returns 400 when a field exceeds its max length', async () => {
        const { req, res } = mockRequest({ ...validBody, message: 'a'.repeat(5001) });
        await handler(req, res);
        expect(res._getStatusCode()).toBe(400);
        expect(mockSend).not.toHaveBeenCalled();
    });

    it('returns 400 when the subject contains a newline (header injection attempt)', async () => {
        const { req, res } = mockRequest({ ...validBody, subject: 'Hi\nBcc: victim@example.com' });
        await handler(req, res);
        expect(res._getStatusCode()).toBe(400);
        expect(mockSend).not.toHaveBeenCalled();
    });

    it('returns 400 when the name contains a newline', async () => {
        const { req, res } = mockRequest({ ...validBody, name: 'Test\r\nX-Injected: true' });
        await handler(req, res);
        expect(res._getStatusCode()).toBe(400);
        expect(mockSend).not.toHaveBeenCalled();
    });

    it('returns 500 when RESEND_API_KEY is not configured', async () => {
        delete process.env.RESEND_API_KEY;
        const { req, res } = mockRequest(validBody);
        await handler(req, res);
        expect(res._getStatusCode()).toBe(500);
        expect(mockSend).not.toHaveBeenCalled();
    });

    it('sends the email via Resend and returns 200 on success', async () => {
        mockSend.mockResolvedValue({ data: { id: '123' }, error: null });
        const { req, res } = mockRequest(validBody);
        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
            to: 'owner@example.com',
            replyTo: 'test@example.com',
        }));
    });

    it('returns 502 when Resend reports an error', async () => {
        mockSend.mockResolvedValue({ data: null, error: { message: 'bad request' } });
        const { req, res } = mockRequest(validBody);
        await handler(req, res);

        expect(res._getStatusCode()).toBe(502);
    });

    it('returns 429 with a Retry-After header once a single IP exceeds the rate limit', async () => {
        mockSend.mockResolvedValue({ data: { id: '123' }, error: null });
        const ip = uniqueIp();

        for (let i = 0; i < 5; i += 1) {
            const { req, res } = mockRequest(validBody, ip);
            await handler(req, res);
            expect(res._getStatusCode()).toBe(200);
        }

        const { req, res } = mockRequest(validBody, ip);
        await handler(req, res);

        expect(res._getStatusCode()).toBe(429);
        expect(res.getHeader('Retry-After')).toBeDefined();
    });
});
