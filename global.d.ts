type APIHero = {
    words: Array<string>;
    titles: Array<string>;
    prefix: string;
};

type APIAbout = {
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

type ExperienceInformation = {
    title: string;
    company: string;
    start: string;
    end: string;
    description: Array<string>;
};

type ProjectInformation = {
    name: string;
    description: string;
};
