import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { getContactContent } from '@/lib/content';

type ContactApiResponse = {
    message: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidSubmission(body: Partial<ContactInputs>): body is ContactInputs {
    return Boolean(
        body.name?.trim() &&
        body.email?.trim() &&
        EMAIL_PATTERN.test(body.email) &&
        body.subject?.trim() &&
        body.message?.trim()
    );
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ContactApiResponse>
) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Invalid HTTP method.' });
        return;
    }

    const body = req.body as Partial<ContactInputs>;
    if (!isValidSubmission(body)) {
        res.status(400).json({ message: 'Please fill out every field with a valid email address.' });
        return;
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        res.status(500).json({ message: 'Email sending is not configured on this server.' });
        return;
    }

    try {
        const resend = new Resend(apiKey);
        const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
        const { email: toEmail } = getContactContent();

        const { error } = await resend.emails.send({
            from: `Portfolio Contact Form <${fromEmail}>`,
            to: toEmail,
            replyTo: body.email,
            subject: `[Portfolio] ${body.subject}`,
            text: `From: ${body.name} (${body.email})\n\n${body.message}`,
        });

        if (error) {
            res.status(502).json({ message: 'Failed to send message. Please try again later.' });
            return;
        }

        res.status(200).json({ message: 'Message sent successfully.' });
    } catch {
        res.status(500).json({ message: 'Failed to send message. Please try again later.' });
    }
}
