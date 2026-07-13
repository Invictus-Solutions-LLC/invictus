import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '@/pages/api/health/index';

describe('/api/health', () => {
    it('returns 200 and ok status on GET', () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: 'GET' });

        handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(res._getJSONData()).toEqual({ status: 'ok' });
    });

    it('returns 500 on non-GET methods', () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: 'POST' });

        handler(req, res);

        expect(res._getStatusCode()).toBe(500);
    });
});
