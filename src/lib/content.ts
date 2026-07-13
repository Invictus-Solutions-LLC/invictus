import fs from 'fs';
import path from 'path';

const CONTENT_DIR = process.env.CONTENT_DIR ?? path.join(process.cwd(), 'content');

function loadContent<T>(filename: string): T {
    const filePath = path.join(CONTENT_DIR, filename);

    let raw: string;
    try {
        raw = fs.readFileSync(filePath, 'utf-8');
    } catch {
        throw new Error(
            `Content file "${filename}" was not found in "${CONTENT_DIR}". ` +
            `Copy content/${filename.replace('.json', '.example.json')} to content/${filename} and fill in your real data.`
        );
    }

    return JSON.parse(raw) as T;
}

export function getHeroContent(): HeroProps {
    return loadContent<HeroProps>('hero.json');
}

export function getAboutContent(): AboutProps {
    return loadContent<AboutProps>('about.json');
}

export function getExperienceContent(): ExperienceProps {
    return loadContent<ExperienceProps>('experience.json');
}

export function getSkillsContent(): SkillsProps {
    return loadContent<SkillsProps>('skills.json');
}

export function getProjectsContent(): ProjectsProps {
    return loadContent<ProjectsProps>('projects.json');
}

export function getContactContent(): ContactProps {
    return loadContent<ContactProps>('contact.json');
}

export function getSocialsContent(): SocialsProps {
    return { socials: loadContent<Array<string>>('socials.json') };
}
