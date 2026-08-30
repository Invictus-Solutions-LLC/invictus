import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { getContactContent } from '@/lib/content';
import { RateLimiter } from '@/lib/rateLimit';
import { rateLimitKey } from '@/lib/clientIp';

type ContactApiResponse = {
    message: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Newlines in single-line fields could be used to smuggle extra headers into
// the outgoing email (e.g. via the subject line); reject them outright.
const CONTROL_CHAR_PATTERN = /[\r\n]/;

const NAME_MAX_LENGTH = 100;
const EMAIL_MAX_LENGTH = 254;
const SUBJECT_MAX_LENGTH = 150;
const MESSAGE_MAX_LENGTH = 5000;

// Single process, single instance deployment (see Dockerfile/DEPLOY.md) — an
// in-memory limiter is sufficient and avoids adding a Redis dependency just
// for a low-traffic contact form.
const rateLimiter = new RateLimiter({ windowMs: 10 * 60 * 1000, max: 5 });

// A per-caller limit alone cannot stop distributed abuse, and every submission
// that gets through spends real mail quota and lands in a real inbox. This is
// the same shape of ceiling /api/ask uses to protect its token spend: one
// bucket for the whole deployment, well above any plausible legitimate volume
// for a portfolio contact form.
const globalLimiter = new RateLimiter({ windowMs: 60 * 60 * 1000, max: 30 });

function isValidSubmission(body: Partial<ContactInputs>): body is ContactInputs {
    return Boolean(
        body.name?.trim() &&
        body.name.length <= NAME_MAX_LENGTH &&
        !CONTROL_CHAR_PATTERN.test(body.name) &&
        body.email?.trim() &&
        body.email.length <= EMAIL_MAX_LENGTH &&
        EMAIL_PATTERN.test(body.email) &&
        body.subject?.trim() &&
        body.subject.length <= SUBJECT_MAX_LENGTH &&
        !CONTROL_CHAR_PATTERN.test(body.subject) &&
        body.message?.trim() &&
        body.message.length <= MESSAGE_MAX_LENGTH
    );
}

// The longest field is capped at 5,000 characters, so a legitimate submission
// cannot approach Next's default 1 MB body limit. Rejecting at the parser keeps
// junk from being read into memory before validation sees it.
export const config = {
    api: { bodyParser: { sizeLimit: '64kb' } },
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ContactApiResponse>
) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).json({ message: 'Invalid HTTP method.' });
        return;
    }

    const caller = rateLimiter.check(rateLimitKey(req));
    if (!caller.allowed) {
        res.setHeader('Retry-After', String(caller.retryAfterSeconds));
        res.status(429).json({ message: 'Too many requests. Please try again later.' });
        return;
    }

    const overall = globalLimiter.check('global');
    if (!overall.allowed) {
        res.setHeader('Retry-After', String(overall.retryAfterSeconds));
        res.status(429).json({ message: 'Too many requests. Please try again later.' });
        return;
    }

    const body = req.body as Partial<ContactInputs>;
    if (!isValidSubmission(body)) {
        res.status(400).json({ message: 'Please fill out every field with a valid email address.' });
        return;
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        // A missing key is a broken deployment, not a feature the visitor can
        // opt into — unlike /api/ask, where 503 is a designed signal the palette
        // degrades around. So it reads as an ordinary send failure and the real
        // reason goes to the logs, where the operator will actually see it.
        console.error('[contact] RESEND_API_KEY is not set — cannot send');
        res.status(500).json({ message: 'Failed to send message. Please try again later.' });
        return;
    }

    try {
        const resend = new Resend(apiKey);
        const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
        // Delivery inbox can differ from the address displayed on the site —
        // required with Resend's sandbox sender, which only delivers to the
        // account owner's email.
        // `||` not `??`: compose files pass this as an empty string when unset.
        const toEmail = process.env.RESEND_TO_EMAIL || getContactContent().email;

        const { error } = await resend.emails.send({
            from: `Portfolio Contact Form <${fromEmail}>`,
            to: toEmail,
            replyTo: body.email,
            subject: `[Portfolio] ${body.subject}`,
            text: `From: ${body.name} (${body.email})\n\n${body.message}`,
        });

        if (error) {
            // Server-side only — never leak provider details to the client.
            console.error(`[contact] resend rejected send: ${error.name}: ${error.message}`);
            res.status(502).json({ message: 'Failed to send message. Please try again later.' });
            return;
        }

        res.status(200).json({ message: 'Message sent successfully.' });
    } catch (err) {
        console.error('[contact] send failed:', err instanceof Error ? err.message : err);
        res.status(500).json({ message: 'Failed to send message. Please try again later.' });
    }
}
