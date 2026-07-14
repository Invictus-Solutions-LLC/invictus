import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import {
    getAboutContent,
    getContactContent,
    getExperienceContent,
    getSkillsContent,
} from '@/lib/content';
import { RateLimiter } from '@/lib/rateLimit';

// Strict budget: legit use is a recruiter fetching once, so a low ceiling
// mostly exists to make token guessing impractical.
const rateLimiter = new RateLimiter({ windowMs: 5 * 60 * 1000, max: 10 });

const WRAP_COLUMN = 78;

function getClientIp(req: NextApiRequest): string {
    const forwardedFor = req.headers['x-forwarded-for'];
    const firstForwarded = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    if (firstForwarded) {
        return firstForwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress ?? 'unknown';
}

// Constant-time equality via digest comparison — token lengths may differ,
// and timingSafeEqual requires equal-length inputs.
function tokenMatches(candidate: string, allowed: Array<string>): boolean {
    const candidateDigest = crypto.createHash('sha256').update(candidate).digest();
    return allowed.some((token) => {
        const tokenDigest = crypto.createHash('sha256').update(token).digest();
        return crypto.timingSafeEqual(candidateDigest, tokenDigest);
    });
}

function extractToken(req: NextApiRequest): string {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
        return header.slice('Bearer '.length).trim();
    }
    const key = req.query.key;
    return typeof key === 'string' ? key : '';
}

function wrap(text: string, indent = ''): string {
    const words = text.split(/\s+/);
    const lines: Array<string> = [];
    let line = indent;
    words.forEach((word) => {
        if (line.length + word.length + 1 > WRAP_COLUMN && line.trim()) {
            lines.push(line);
            line = indent;
        }
        line += (line === indent ? '' : ' ') + word;
    });
    if (line.trim()) {
        lines.push(line);
    }
    return lines.join('\n');
}

function heading(title: string): string {
    return `\n== ${title} ${'='.repeat(Math.max(0, WRAP_COLUMN - title.length - 4))}\n`;
}

function buildResume(): string {
    const about = getAboutContent();
    const contact = getContactContent();
    const { experiences } = getExperienceContent();
    const { skills } = getSkillsContent();

    const parts: Array<string> = [];

    parts.push('┌' + '─'.repeat(WRAP_COLUMN - 2) + '┐');
    parts.push('│ INVICTUS808 — RESUME' + ' '.repeat(WRAP_COLUMN - 23) + '│');
    parts.push('└' + '─'.repeat(WRAP_COLUMN - 2) + '┘');

    parts.push(heading('CONTACT'));
    parts.push(`  email:    ${contact.email}`);
    parts.push(`  phone:    ${contact.phone}`);
    parts.push(`  location: ${contact.headquarters}`);

    parts.push(heading('ABOUT'));
    about.text.forEach((paragraph) => {
        parts.push(wrap(paragraph, '  '));
        parts.push('');
    });

    parts.push(heading('EXPERIENCE'));
    experiences.forEach((experience) => {
        parts.push(`  * ${experience.title} — ${experience.company} (${experience.start} – ${experience.end})`);
        experience.description.forEach((note) => {
            parts.push(wrap(`- ${note}`, '      '));
        });
        parts.push('');
    });

    parts.push(heading('SKILLS'));
    parts.push(wrap(skills.map((skill) => `${skill.name} (${skill.level}%)`).join(', '), '  '));
    parts.push('');
    parts.push(`  generated ${new Date().toISOString().slice(0, 10)} — https://invictus808.com`);
    parts.push('');

    return parts.join('\n');
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<string | ErrorResponse>
) {
    if (req.method !== 'GET') {
        res.status(405).json({ message: 'Invalid HTTP method.' });
        return;
    }

    const { allowed, retryAfterSeconds } = rateLimiter.check(getClientIp(req));
    if (!allowed) {
        res.setHeader('Retry-After', String(retryAfterSeconds));
        res.status(429).json({ message: 'Too many requests. Please try again later.' });
        return;
    }

    // Locked by default: without configured tokens the endpoint plays dead,
    // and bad tokens get the identical response — no oracle either way.
    const allowedTokens = (process.env.RESUME_ACCESS_TOKENS ?? '')
        .split(',')
        .map((token) => token.trim())
        .filter(Boolean);

    const candidate = extractToken(req);
    if (allowedTokens.length === 0 || !candidate || !tokenMatches(candidate, allowedTokens)) {
        res.status(404).json({ message: 'Not found.' });
        return;
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'private, no-store');
    res.status(200).send(buildResume());
}
