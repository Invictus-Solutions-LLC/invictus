type AboutProps = {
    header: string;
    text: Array<string>;
};

type ContactInputs = {
    name: string;
    email: string;
    subject: string;
    message: string;
};

type ErrorResponse = {
    message: string;
};

type Experience = {
    title: string;
    company: string;
    start: string;
    end: string;
    description: Array<string>;
};

type ExperienceProps = {
    experiences: Array<Experience>;
};

type HeroProps = {
    words: Array<string>;
    titles: Array<string>;
    prefix: string;
};

type Project = {
    name: string;
    description: string;
};

type Skill = {
    image: string;
    level: number;
    name: string;
};

type SkillsProps = {
    header: string;
    skills: Array<Skill>;
};
