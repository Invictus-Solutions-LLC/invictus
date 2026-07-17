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

## Common tasks (Makefile)

The [`Makefile`](./Makefile) is the single entry point for the whole lifecycle. Run `make help`
for the full, grouped list. The essentials:

```bash
make setup      # first-time local setup: install deps + seed content + create .env
make dev        # run the dev server (hot reload)
make verify     # full quality gate: lint + typecheck + tests + build
make image      # build the production Docker image locally
make deploy     # on the server: pull the published image + (re)start the app
```

See [DEPLOY.md](./DEPLOY.md) for the full deploy flow (`make deploy` for app-behind-your-nginx,
or `make stack-up` for the bundled nginx + certbot stack).

## Testing

```bash
make test        # or: yarn test
```

## Production deployment (Docker)

See [DEPLOY.md](./DEPLOY.md) for the full one-command deploy flow. In short: your real
`content/*.json` files live only on the production host and are bind-mounted read-only into the
container — they never enter the Docker image, so the built image is safe to publish.

## Team

### Maintainers

- [Invictus808](https://invictus808.com/)
