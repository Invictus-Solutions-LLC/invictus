import type { NextApiRequest, NextApiResponse } from 'next';

type HealthResponse = {
    status: 'ok';
};

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<HealthResponse | ErrorResponse>
) {
    // A wrong method is a client error, not a server fault — returning 500 here
    // made uptime probes (which commonly use HEAD) report the service as down.
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        res.status(405).json({ message: 'Invalid HTTP method.' });
        return;
    }

    res.status(200).json({ status: 'ok' });
}
