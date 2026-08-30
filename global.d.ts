// About has no section of its own: this prose is what the hero speaks in.
type AboutProps = {
    text: Array<string>;
};

// The fake kernel log the intro types out. Decoration, but decoration the
// owner curates, so it is editable without a rebuild like everything else.
type BootProps = {
    lines: Array<string>;
};

// The example questions the ⌘K placeholder cycles through. They teach the one
// thing nothing else on the page says: that the box takes plain questions.
// What the palette says back to a visitor. Sentences addressed to them, in the
// site's voice — unlike the structural labels ("Answer", "Go to"), which are
// interface furniture and stay in the component.
type AskMessages = {
    asking: string;
    throttled: string;
    unavailable: string;
    noMatch: string;
};

type AskProps = {
    // The label on the header's ⌘K button, beside the contact button whose
    // wording is also content.
    triggerLabel: string;
    examples: Array<string>;
    messages: AskMessages;
};

type CallToAction = {
    label: string;
    href: string;
    variant: 'primary' | 'secondary';
};

type ContactInputs = {
    name: string;
    email: string;
    subject: string;
    message: string;
};

type ContactCta = {
    header: string;
    invitation: string;
    buttonLabel: string;
};

// The terminal-styled prefixes on the form's three submit outcomes. Kept in
// content because they are visitor-facing wording, not component logic.
type ContactStatusLabels = {
    sending: string;
    success: string;
    error: string;
};

type ContactProps = {
    header: string;
    phone: string;
    email: string;
    headquarters: string;
    cta: ContactCta;
    status: ContactStatusLabels;
    // The header's contact button. Visitor-facing copy, so it lives with the
    // rest of the contact wording rather than inside the component.
    linkLabel: string;
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
    header: string;
    intro: string;
    experiences: Array<Experience>;
};

type FooterProps = {
    text: string;
};

// The hero's own framing. Its prose comes from about.json, so there is exactly
// one place the "who I am" copy lives.
type HeroProps = {
    location: string;
    // Shown above the name. Kept out of the <h1> so the heading stays exactly
    // the term the page should rank for — an empty string simply omits it.
    greeting: string;
    // The page's <h1>. Holds the name by default — the prose beneath already
    // introduces him, so a tagline here only said it a second time.
    headline: string;
    image: string;
    // Rendered as the portrait's alt attribute. Site owner's choice: it mirrors
    // `image` rather than describing the photograph, so keep the two in step.
    imageAlt: string;
    ctas: Array<CallToAction>;
};

// The one section designed to change. `status` drives the badge treatment;
// anything other than 'live' is styled as work in progress.
type LabEntry = {
    title: string;
    text: string;
    status: 'live' | 'building';
    statusLabel: string;
    href?: string;
};

type LabProps = {
    header: string;
    intro: string;
    entries: Array<LabEntry>;
};

type ProcessStep = {
    title: string;
    text: string;
};

type ProcessProps = {
    header: string;
    intro: string;
    steps: Array<ProcessStep>;
};

type Project = {
    name: string;
    image: string;
    url: string;
    // Each description already opens by explaining what the thing is, so the
    // card leads with the name and lets that first sentence do the work.
    description: string;
};

type ProjectsProps = {
    header: string;
    intro: string;
    projects: Array<Project>;
};

type SkillCategory = {
    id: string;
    label: string;
};

type Skill = Technology & {
    category: string;
};

type Certification = {
    name: string;
    image: string;
    url: string;
};

type SkillsProps = {
    header: string;
    intro: string;
    categories: Array<SkillCategory>;
    skills: Array<Skill>;
    certifications?: Array<Certification>;
};

// Site-level identity and search metadata. Kept in content so the title, the
// description and the share cards are editable without a rebuild — they are the
// highest-leverage copy on the site and were previously hardcoded.
type SeoProps = {
    name: string;
    shortName: string;
    title: string;
    description: string;
    // Absolute origin, no trailing slash. Used for canonical, og:url, the
    // sitemap and every absolute URL in the structured data.
    url: string;
    image: string;
    imageAlt: string;
};

type SocialsProps = {
    socials: Array<string>;
};

type Technology = {
    image: string;
    name: string;
};

type Theme = 'dark' | 'light' | 'system';
