import fs from 'fs';
import path from 'path';

const CONTENT_DIR = process.env.CONTENT_DIR ?? path.join(process.cwd(), 'content');

type Kind = 'string' | 'array' | 'object';

// A field is either a plain kind, an array whose items are themselves checked
// (`{ items: 'string' }` for a list of strings, or a field map for a list of
// objects), or a nested object whose own fields are checked.
type Spec = Kind | { items: 'string' | Record<string, Kind> } | { fields: Record<string, Kind> };

type Shape = Record<string, Spec>;

function wrongKind(value: unknown, kind: Kind): boolean {
    if (kind === 'array') {
        return !Array.isArray(value);
    }
    if (kind === 'object') {
        return typeof value !== 'object' || value === null || Array.isArray(value);
    }
    return typeof value !== 'string';
}

// The content directory is bind-mounted at runtime and edited by hand, so a
// missing or renamed field is a realistic failure. Checking the shape here turns
// that into one clear server-side error instead of a half-rendered page or an
// "undefined is not iterable" deep inside a component.
//
// Array items are checked too: adding a project or a skill and forgetting a
// field is the single most likely edit, and it would otherwise render a blank
// card with an undefined href rather than saying anything at all.
function validate(filename: string, value: unknown, shape: Shape): void {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new Error(`Content file "${filename}" must contain a JSON object.`);
    }

    const record = value as Record<string, unknown>;
    const problems: Array<string> = [];

    Object.entries(shape).forEach(([key, spec]) => {
        const field = record[key];

        if (typeof spec === 'string') {
            if (wrongKind(field, spec)) {
                problems.push(`"${key}" (${spec})`);
            }
            return;
        }

        if ('fields' in spec) {
            if (wrongKind(field, 'object')) {
                problems.push(`"${key}" (object)`);
                return;
            }
            const nested = field as Record<string, unknown>;
            Object.entries(spec.fields).forEach(([name, kind]) => {
                if (wrongKind(nested[name], kind)) {
                    problems.push(`"${key}.${name}" (${kind})`);
                }
            });
            return;
        }

        if (!Array.isArray(field)) {
            problems.push(`"${key}" (array)`);
            return;
        }

        field.forEach((item, index) => {
            if (spec.items === 'string') {
                if (typeof item !== 'string') {
                    problems.push(`"${key}[${index}]" (string)`);
                }
                return;
            }

            if (typeof item !== 'object' || item === null || Array.isArray(item)) {
                problems.push(`"${key}[${index}]" (object)`);
                return;
            }

            const entry = item as Record<string, unknown>;
            Object.entries(spec.items).forEach(([field_, kind]) => {
                if (wrongKind(entry[field_], kind)) {
                    problems.push(`"${key}[${index}].${field_}" (${kind})`);
                }
            });
        });
    });

    if (problems.length > 0) {
        throw new Error(
            `Content file "${filename}" is missing or has the wrong type for: ${problems.join(', ')}. ` +
            `Compare it against content/${filename.replace('.json', '.example.json')}.`
        );
    }
}

function describeReadFailure(error: unknown, filename: string): string {
    const code = (error as NodeJS.ErrnoException)?.code;
    const example = `content/${filename.replace('.json', '.example.json')}`;

    if (code === 'EACCES' || code === 'EPERM') {
        return (
            `Content file "${filename}" exists in "${CONTENT_DIR}" but could not be read ` +
            `(${code}). The process runs as uid ${typeof process.getuid === 'function' ? process.getuid() : 'unknown'}; ` +
            'check that the directory is traversable and the files readable by that user.'
        );
    }

    if (code === 'EISDIR') {
        return `Content path "${filename}" in "${CONTENT_DIR}" is a directory, not a file.`;
    }

    return (
        `Content file "${filename}" was not found in "${CONTENT_DIR}". ` +
        `Copy ${example} to content/${filename} and fill in your real data.`
    );
}

function loadContent<T>(filename: string, shape: Shape): T {
    // Content is read at request time from a directory that is bind-mounted on the
    // production host (gitignored, never baked into the image — the PII-safe design).
    // The turbopackIgnore hint stops Turbopack's build tracer from trying to bundle
    // this dynamic path, which would otherwise pull the whole project into the output.
    const filePath = path.join(/* turbopackIgnore: true */ CONTENT_DIR, filename);

    let raw: string;
    try {
        raw = fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
        throw new Error(describeReadFailure(error, filename));
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        throw new Error(`Content file "${filename}" is not valid JSON.`);
    }

    validate(filename, parsed, shape);
    return parsed as T;
}

export function getHeroContent(): HeroProps {
    return loadContent<HeroProps>('hero.json', {
        location: 'string',
        greeting: 'string',
        headline: 'string',
        image: 'string',
        imageAlt: 'string',
        ctas: { items: { label: 'string', href: 'string', variant: 'string' } },
    });
}

export function getAboutContent(): AboutProps {
    return loadContent<AboutProps>('about.json', { text: { items: 'string' } });
}

export function getExperienceContent(): ExperienceProps {
    return loadContent<ExperienceProps>('experience.json', {
        header: 'string',
        intro: 'string',
        experiences: {
            items: {
                title: 'string', company: 'string', logo: 'string',
                start: 'string', end: 'string',
                technologies: 'array', description: 'array',
            },
        },
    });
}

export function getSkillsContent(): SkillsProps {
    return loadContent<SkillsProps>('skills.json', {
        header: 'string',
        intro: 'string',
        categories: { items: { id: 'string', label: 'string' } },
        skills: { items: { image: 'string', name: 'string', category: 'string' } },
    });
}

export function getProjectsContent(): ProjectsProps {
    return loadContent<ProjectsProps>('projects.json', {
        header: 'string',
        intro: 'string',
        projects: { items: { name: 'string', image: 'string', url: 'string', description: 'string' } },
    });
}

export function getProcessContent(): ProcessProps {
    return loadContent<ProcessProps>('process.json', {
        header: 'string',
        intro: 'string',
        steps: { items: { title: 'string', text: 'string' } },
    });
}

export function getLabContent(): LabProps {
    return loadContent<LabProps>('lab.json', {
        header: 'string',
        intro: 'string',
        entries: { items: { title: 'string', text: 'string', status: 'string', statusLabel: 'string' } },
    });
}

export function getContactContent(): ContactProps {
    return loadContent<ContactProps>('contact.json', {
        header: 'string',
        phone: 'string',
        email: 'string',
        headquarters: 'string',
        cta: { fields: { header: 'string', invitation: 'string', buttonLabel: 'string' } },
        status: { fields: { sending: 'string', success: 'string', error: 'string' } },
        linkLabel: 'string',
    });
}

export function getSocialsContent(): SocialsProps {
    const filePath = path.join(/* turbopackIgnore: true */ CONTENT_DIR, 'socials.json');

    let raw: string;
    try {
        raw = fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
        throw new Error(describeReadFailure(error, 'socials.json'));
    }

    // socials.json is the one file that is a bare array rather than an object,
    // so it can't go through the shared object validator.
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.some((entry) => typeof entry !== 'string')) {
        throw new Error('Content file "socials.json" must contain an array of URL strings.');
    }

    return { socials: parsed as Array<string> };
}

export function getBootContent(): BootProps {
    const boot = loadContent<BootProps>('boot.json', { lines: { items: 'string' } });

    // `extras` is optional: a boot.json without it is valid and simply never
    // varies. Validated by hand rather than through the schema, which has no
    // way to express an optional key.
    if (boot.extras !== undefined
        && (!Array.isArray(boot.extras) || boot.extras.some((line) => typeof line !== 'string'))) {
        throw new Error('Content file "boot.json" has "extras" but it is not an array of strings.');
    }

    return boot;
}

export function getAskContent(): AskProps {
    const ask = loadContent<AskProps>('ask.json', {
        triggerLabel: 'string',
        examples: { items: 'string' },
        messages: {
            fields: {
                asking: 'string',
                throttled: 'string',
                unavailable: 'string',
                noMatch: 'string',
            },
        },
    });

    // `terminal` is a free-form map of command to reply, which the schema
    // language here cannot express — it only knows fixed field sets. Checked by
    // hand so a malformed one still fails loudly at load rather than rendering
    // "undefined" at a visitor.
    const { terminal } = ask;
    const valid = terminal !== null
        && typeof terminal === 'object'
        && !Array.isArray(terminal)
        && Object.values(terminal).every((reply) => { return typeof reply === 'string'; });

    if (!valid) {
        throw new Error('Content file "ask.json" needs "terminal" to be an object of command → reply strings.');
    }

    return ask;
}

export function getSeoContent(): SeoProps {
    return loadContent<SeoProps>('seo.json', {
        name: 'string',
        shortName: 'string',
        title: 'string',
        description: 'string',
        url: 'string',
        image: 'string',
        imageAlt: 'string',
    });
}

export function getFooterContent(): FooterProps {
    return loadContent<FooterProps>('footer.json', { text: 'string' });
}

// The page is rendered entirely from these files, so the newest of their
// modification times IS the page's last-modified date. Reporting "today" on
// every request — which is what `new Date()` in the sitemap did — is worse than
// reporting nothing: once a crawler sees that lastmod is not credible it
// discounts the field for the whole site. Returns null when the directory
// cannot be read, so the caller can omit lastmod rather than invent one.
export function getContentLastModified(): Date | null {
    try {
        const newest = fs
            .readdirSync(/* turbopackIgnore: true */ CONTENT_DIR)
            .filter((name) => { return name.endsWith('.json') && !name.includes('.example.'); })
            // Marked alongside the readdirSync above: without it Turbopack's
            // static analysis cannot resolve these paths, gives up, and traces
            // the ENTIRE project into .next/standalone — src/, e2e/, public/
            // and content/, the last of which is the gitignored personal data
            // the Dockerfile then has to delete back out of the image.
            .map((name) => {
                return fs.statSync(
                    /* turbopackIgnore: true */ path.join(/* turbopackIgnore: true */ CONTENT_DIR, name),
                ).mtimeMs;
            })
            .reduce((latest, value) => { return Math.max(latest, value); }, 0);

        return newest > 0 ? new Date(newest) : null;
    }
    catch {
        return null;
    }
}
