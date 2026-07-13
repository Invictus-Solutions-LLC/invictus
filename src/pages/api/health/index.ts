import type { NextApiRequest, NextApiResponse } from 'next';

type HealthResponse = {
    status: 'ok';
};

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<HealthResponse | ErrorResponse>
) {
    if (req.method === 'GET') {
        res.status(200).json({ status: 'ok' });
    }
    else {
        res.status(500).json({ message: 'Invalid HTTP method.' });
    }
}
