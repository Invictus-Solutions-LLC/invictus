# Invictus Website

## Overview

Invictus is a portfolio site for a software engineer and digital network exploitation analyst,
written to serve two very different visitors at once: recruiters, who want experience and evidence, and small-business
owners, who want to know what a project would actually be like. It leads with a person rather than
a stack, groups capabilities by what they are for rather than rating them out of ten, and sets out
the freelance process before anyone has to ask.

The design is dark-first with a light and system theme, on an island palette — deep-water cyan,
topographic contour texture and a warm sunset accent — with shell-white cards for the content that
matters most. Every section is fed from `content/*.json`; effectively nothing is hardcoded.

A ⌘K palette handles navigation and, where a key is configured, answers questions in plain English
strictly from that same content, citing which file each answer came from. Without a key it stays a
fast navigator, so the feature degrades rather than breaks.

## Content setup (required before first run)

All personal content (name, bio, employment history, contact info, projects) lives in `content/`
as JSON files. Real content files are gitignored and never committed — only placeholder
`*.example.json` templates are tracked, so no PII ever reaches the repository.

To populate real content locally:

```bash
for f in content/*.example.json; do
    cp "$f" "${f/.example/}"
done
```

Then edit each `content/*.json` file (not the `.example.json` ones) with your real data. These
files are read at request time by `src/lib/content.ts`, which validates each file's shape and
fails with a message naming the offending field — no rebuild is required after editing them in
development (`yarn dev`).

What each file drives:

| File | Feeds |
| --- | --- |
| `hero.json` | Greeting, headline, location, portrait and the calls to action. The greeting sits above the `<h1>` rather than inside it, so the heading stays exactly the term the page should rank for — leave it empty to omit it |
| `about.json` | `text[]` is the hero's prose — there is no separate About section, so the introduction is written once, in your own voice |
| `experience.json` | Section heading and intro, plus roles, dates, technologies and bullets |
| `skills.json` | `categories[]` and each skill's `category` — grouped capability, no proficiency scores |
| `projects.json` | Section heading and intro, plus each project's `name` and full `description` |
| `process.json` | The "How working together goes" timeline shown to prospective clients |
| `lab.json` | "What I'm digging into now" — in-progress work; leave `entries` empty to hide the section |
| `contact.json` | Contact details, the closing invitation (`cta`) and the header button's `linkLabel` |
| `socials.json`, `footer.json` | Footer links and copyright |
| `boot.json` | Lines used by the intro sequence; an optional `extras` array supplies alternates, one of which is mixed in per load |
| `ask.json` | The ⌘K button label, the example questions its placeholder cycles through, the messages it says back (`messages`), and `terminal` — canned replies to shell commands typed into the palette |
| `seo.json` | Site identity and search metadata — page title, meta description, canonical URL, share-card image, and the name used in the footer wordmark and the schema.org markup (`shortName` names the installable web app instead) |

### Search and share metadata

The head carries a canonical URL, full Open Graph and Twitter tags, and a
schema.org `Person` block assembled from the content files — job title from
`experience.json`, `knowsAbout` from `skills.json`, `hasCredential` from your
certifications and `sameAs` from `socials.json`. `robots.txt` and `sitemap.xml`
are generated routes rather than static files, so the absolute URLs come from
`seo.json` instead of being hardcoded.

The 1200x630 share card at `public/og.jpg` is composed from the hero portrait
and `seo.json`. Regenerate it after changing your name, title or photo:

```bash
yarn og
```

## Local development

```bash
corepack enable
yarn install
yarn dev
```

## Common tasks (Makefile)

The [`Makefile`](./Makefile) is the single entry point for the whole lifecycle. Run `make help`
for the full, grouped list. The essentials:

```bash
make setup      # first-time local setup: install deps + seed content + create .env
make dev        # run the dev server (hot reload)
make verify     # full quality gate: lint + typecheck + tests + build
make e2e        # browser checks: layout, a11y, SEO, security headers, image payload
make image      # build the production Docker image locally
make deploy     # on the server: pull the published image + (re)start the app
```

See [DEPLOY.md](./DEPLOY.md) for the full deploy flow (`make deploy` for app-behind-your-nginx,
or `make stack-up` for the bundled nginx + certbot stack).

## Testing

```bash
make test        # unit tests (Jest)
make e2e         # browser tests (Playwright, against a production build)
```

`make e2e` builds and starts the app itself, then asserts the things unit tests
can't see: responsive layout geometry across six viewports, WCAG contrast in
*both* palettes, landmarks / heading order / focus indicators / reflow at 320px,
the image payload budget, the rendered search metadata and `Person` structured
data, the live security headers, method handling and rate limiting, and the intro
sequence — including that it does not render with JavaScript disabled. CI runs the
same suite on every pull request.

## Production deployment (Docker)

See [DEPLOY.md](./DEPLOY.md) for the full one-command deploy flow. In short: your real
`content/*.json` files live only on the production host and are bind-mounted read-only into the
container — they never enter the Docker image, so the built image is safe to publish.

The image is built from Next's traced standalone output, so it carries only the modules the server
actually imports. Two things worth knowing: the container runs as uid 1001, so the bind-mounted
content directory has to be readable by it (`chmod 755 content && chmod 644 content/*.json`), and
the build deliberately deletes the copy of `content/` that Next's file tracer pulls into the
bundle — with assertions that fail the build if a future Next version traces differently.

## Team

### Maintainers

- [Invictus808](https://invictus808.com/)
