type AboutProps = {
    header: string;
    image: string;
    text: Array<string>;
};

type ContactInputs = {
    name: string;
    email: string;
    subject: string;
    message: string;
};

type ContactProps = {
    header: string;
    phone: string;
    email: string;
    headquarters: string;
};

type ErrorResponse = {
    message: string;
};

type Experience = {
    title: string;
    company: string;
    logo: string;
    start: string;
    end: string;
    technologies: Array<Technology>;
    description: Array<string>;
};

type ExperienceProps = {
    experiences: Array<Experience>;
};

type FooterProps = {
    text: string;
};

type HeroProps = {
    image: string;
    words: Array<string>;
    titles: Array<string>;
    prefix: string;
};

type Project = {
    name: string;
    image: string;
    url: string;
    description: string;
};

type ProjectsProps = {
    projects: Array<Project>;
};

type Skill = Technology & {
    level: number;
};

type Certification = {
    name: string;
    image: string;
    url: string;
};

type SkillsProps = {
    header: string;
    skills: Array<Skill>;
    certifications?: Array<Certification>;
};

type SocialsProps = {
    socials: Array<string>;
};

type Technology = {
    image: string;
    name: string;
};
