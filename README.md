# Invictus Website

## Overview

Invictus is a captivating and visually appealing platform to showcase skills, experience, and
projects as a professional. With a modern, terminal-inspired design and user-friendly interface,
this website serves as a digital resume. It features sections for an introduction, experience,
skills, projects, and contact information, providing a comprehensive overview of expertise. The
responsive design ensures optimal viewing across devices.

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
files are read at request time by `src/lib/content.ts` — no rebuild is required after editing
them in development (`yarn dev`).

## Local development

```bash
corepack enable
yarn install
yarn dev
```

## Testing

```bash
yarn test
```

## Production deployment (Docker)

See [DEPLOY.md](./DEPLOY.md) for the full one-command deploy flow. In short: your real
`content/*.json` files live only on the production host and are bind-mounted read-only into the
container — they never enter the Docker image, so the built image is safe to publish.

## Team

### Maintainers

- [Invictus808](https://invictus808.com/)
