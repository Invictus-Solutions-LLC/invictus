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

describe('/api/contact', () => {
    const originalApiKey = process.env.RESEND_API_KEY;

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
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'POST',
            body: { name: '', email: '', subject: '', message: '' },
        });
        await handler(req, res);
        expect(res._getStatusCode()).toBe(400);
        expect(mockSend).not.toHaveBeenCalled();
    });

    it('returns 400 for an invalid email', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'POST',
            body: { name: 'Test', email: 'not-an-email', subject: 'Hi', message: 'Hello' },
        });
        await handler(req, res);
        expect(res._getStatusCode()).toBe(400);
    });

    it('returns 500 when RESEND_API_KEY is not configured', async () => {
        delete process.env.RESEND_API_KEY;
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'POST',
            body: { name: 'Test', email: 'test@example.com', subject: 'Hi', message: 'Hello' },
        });
        await handler(req, res);
        expect(res._getStatusCode()).toBe(500);
        expect(mockSend).not.toHaveBeenCalled();
    });

    it('sends the email via Resend and returns 200 on success', async () => {
        mockSend.mockResolvedValue({ data: { id: '123' }, error: null });
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'POST',
            body: { name: 'Test User', email: 'test@example.com', subject: 'Hi', message: 'Hello' },
        });
        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
            to: 'owner@example.com',
            replyTo: 'test@example.com',
        }));
    });

    it('returns 502 when Resend reports an error', async () => {
        mockSend.mockResolvedValue({ data: null, error: { message: 'bad request' } });
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'POST',
            body: { name: 'Test User', email: 'test@example.com', subject: 'Hi', message: 'Hello' },
        });
        await handler(req, res);

        expect(res._getStatusCode()).toBe(502);
    });
});
